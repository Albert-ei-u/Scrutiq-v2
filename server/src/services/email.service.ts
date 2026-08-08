import nodemailer, {
  type SendMailOptions,
  type Transporter,
} from "nodemailer";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

class EmailService {
  private transporter?: Transporter;
  private brevoApiKey?: string;
  private readonly isProduction = process.env.NODE_ENV === "production";

  constructor() {
    if (this.isProduction) {
      if (!process.env.BREVO_API_KEY || !process.env.EMAIL_FROM) {
        throw new Error(
          "BREVO_API_KEY and EMAIL_FROM are required in production.",
        );
      }

      this.brevoApiKey = process.env.BREVO_API_KEY;
      return;
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error(
        "EMAIL_USER and EMAIL_PASS are required in development.",
      );
    }

    this.transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  private sender(name: string): string {
    const address = this.isProduction
      ? process.env.EMAIL_FROM
      : process.env.EMAIL_USER;

    if (!address) {
      throw new Error("Email sender address is missing.");
    }

    return `"${name}" <${address}>`;
  }

  private async dispatch(mail: SendMailOptions): Promise<void> {
    if (this.brevoApiKey) {
      const recipients = Array.isArray(mail.to)
        ? mail.to.map(String)
        : typeof mail.to === "string"
          ? [mail.to]
          : [];

      const from = typeof mail.from === "string" ? mail.from : "";
      const senderName =
        from.split("<")[0].replace(/"/g, "").trim() || "Scrutiq";

      const subject =
        typeof mail.subject === "string"
          ? mail.subject
          : String(mail.subject ?? "");

      const html =
        typeof mail.html === "string" ? mail.html : String(mail.html ?? "");

      if (!recipients.length || !subject || !html) {
        throw new Error("Email recipient, subject, or HTML is missing.");
      }

      try {
        await axios.post(
          "https://api.brevo.com/v3/smtp/email",
          {
            sender: {
              name: senderName,
              email: process.env.EMAIL_FROM,
            },
            to: recipients.map((email) => ({ email })),
            subject,
            htmlContent: html,
          },
          {
            headers: {
              "api-key": this.brevoApiKey,
              "content-type": "application/json",
              accept: "application/json",
            },
          },
        );

        return;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(
            error.response?.data?.message ||
              error.response?.data?.code ||
              error.message,
          );
        }

        throw error;
      }
    }

    await this.transporter!.sendMail(mail);
  }

  async sendVerificationCode(email: string, code: string) {
    const mailOptions: SendMailOptions = {
      from: this.sender("Scrutiq Recruitment"),
      to: email,
      subject: "Activate Your Scrutiq Account",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #E2E8F0; border-radius: 24px; color: #1E293B; background: #FFFFFF;">
          <div style="text-align: center; margin-bottom: 40px;">
            <div style="font-size: 28px; font-weight: 800; color: #2563EB;">
              Scrutiq<span style="color: #64748B;">.</span>
            </div>
          </div>

          <h1 style="font-size: 22px; text-align: center; color: #0F172A;">
            Account Activation
          </h1>

          <p style="text-align: center; color: #64748B; line-height: 1.6;">
            Use the secure verification code below to activate your recruiter account.
          </p>

          <div style="background: #F8FAFC; border: 1px solid #F1F5F9; border-radius: 20px; padding: 32px; text-align: center; margin: 32px 0;">
            <span style="font-size: 48px; font-weight: 800; color: #2563EB; letter-spacing: 14px; font-family: monospace;">
              ${code}
            </span>
          </div>

          <p style="font-size: 12px; color: #94A3B8; text-align: center;">
            If you did not initiate this request, please secure your account.
          </p>
        </div>
      `,
    };

    try {
      await this.dispatch(mailOptions);
      console.log(`[EMAIL] Verification code dispatched to ${email}`);
    } catch (error: any) {
      console.error("[EMAIL ERROR] Verification dispatch failed:", error);
      throw new Error(`Failed to send verification email: ${error.message}`);
    }
  }

  async sendCustomEmail(
    email: string,
    subject: string,
    message: string,
    recruiterEmail?: string,
  ) {
    const formattedMessage = message
      .split("\n\n")
      .map(
        (paragraph) =>
          `<p style="margin-bottom: 16px;">${paragraph.replace(
            /\n/g,
            "<br/>",
          )}</p>`,
      )
      .join("");

    const feedbackFooter = recruiterEmail
      ? `Any question or feedback may be sent to ${recruiterEmail}.`
      : "Reply to this message to speak with our technical support team.";

    const mailOptions: SendMailOptions = {
      from: this.sender("Scrutiq Notifications"),
      to: email,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 24px; overflow: hidden; background: #FFFFFF;">
          <div style="background: #0F172A; padding: 32px; text-align: center;">
            <div style="font-size: 24px; font-weight: 800; color: #FFFFFF;">
              Scrutiq<span style="color: #3B82F6;">.</span>
            </div>
          </div>

          <div style="padding: 40px;">
            <h1 style="font-size: 24px; color: #0F172A; margin-top: 0;">
              ${subject}
            </h1>

            <div style="font-size: 15px; line-height: 1.7; color: #475569;">
              ${formattedMessage}
            </div>

            <div style="margin-top: 32px; padding: 24px; background: #F8FAFC; border-radius: 16px; border-left: 4px solid #2563EB;">
              <strong>Need assistance?</strong>
              <p style="margin-bottom: 0; color: #64748B;">
                ${feedbackFooter}
              </p>
            </div>
          </div>
        </div>
      `,
    };

    try {
      await this.dispatch(mailOptions);
      console.log(`[EMAIL] Custom message dispatched to ${email}`);
    } catch (error: any) {
      console.error("[EMAIL ERROR] Custom email dispatch failed:", error);
      throw new Error(`Failed to dispatch email: ${error.message}`);
    }
  }

  async sendPasswordResetPin(email: string, pin: string) {
    const mailOptions: SendMailOptions = {
      from: this.sender("Scrutiq Security"),
      to: email,
      subject: "Your Password Recovery PIN",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #E2E8F0; border-radius: 24px; color: #1E293B; background: #FFFFFF;">
          <div style="text-align: center; margin-bottom: 40px;">
            <div style="font-size: 28px; font-weight: 800; color: #DC2626;">
              Scrutiq Security<span style="color: #64748B;">.</span>
            </div>
          </div>

          <h1 style="font-size: 20px; text-align: center; color: #0F172A;">
            Password Recovery
          </h1>

          <p style="text-align: center; color: #64748B; line-height: 1.6;">
            A password reset was requested for your account. Use this PIN to continue.
          </p>

          <div style="background: #FFF1F2; border: 1px solid #FFE4E6; border-radius: 20px; padding: 32px; text-align: center; margin: 32px 0;">
            <span style="font-size: 48px; font-weight: 800; color: #DC2626; letter-spacing: 12px; font-family: monospace;">
              ${pin}
            </span>
          </div>

          <p style="text-align: center; color: #F43F5E; font-size: 12px; font-weight: bold;">
            This PIN is valid for 10 minutes.
          </p>

          <p style="font-size: 12px; color: #94A3B8; text-align: center;">
            If you did not request this, please ignore this email.
          </p>
        </div>
      `,
    };

    try {
      await this.dispatch(mailOptions);
      console.log(`[SECURITY] Reset PIN dispatched to ${email}`);
    } catch (error: any) {
      console.error("[SECURITY ERROR] Reset PIN dispatch failed:", error);
      throw new Error(
        `Technical failure during recovery email dispatch: ${error.message}`,
      );
    }
  }
}

export default new EmailService();