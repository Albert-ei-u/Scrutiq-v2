import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

class EmailService {
  private transporter;

  constructor() {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("[EMAIL ERROR] Missing SMTP credentials in environment variables.");
    }
    
    this.transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // Use SSL
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  async sendVerificationCode(email: string, code: string) {
    const mailOptions = {
      from: `"Scrutiq Recruitment" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Activate Your Scrutiq Account",
      html: `
        <div style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #E2E8F0; border-radius: 24px; color: #1E293B; background: #FFFFFF;">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&display=swap');
          </style>
          
          <!-- Logo Header -->
          <div style="text-align: center; margin-bottom: 40px;">
            <div style="display: inline-block; font-size: 28px; font-weight: 800; color: #2563EB; letter-spacing: -1px;">
              Scrutiq<span style="color: #64748B;">.</span>
            </div>
          </div>

          <h1 style="font-size: 22px; font-weight: 800; text-align: center; margin-bottom: 12px; color: #0F172A; letter-spacing: -0.02em;">Account Activation</h1>
          <p style="text-align: center; color: #64748B; font-size: 15px; margin-bottom: 40px; line-height: 1.6;">Use the secure verification code below to authorize your recruiter dashboard access.</p>
          
          <div style="background: #F8FAFC; border: 1px solid #F1F5F9; border-radius: 20px; padding: 32px; text-align: center; margin-bottom: 40px; box-shadow: inset 0 2px 4px 0 rgba(0,0,0,0.02);">
            <span style="font-size: 48px; font-weight: 800; color: #2563EB; letter-spacing: 14px; font-family: monospace;">${code}</span>
          </div>
          
          <div style="border-top: 1px solid #F1F5F9; padding-top: 30px; text-align: center;">
            <p style="font-size: 12px; color: #94A3B8; line-height: 1.8; margin-bottom: 0;">
              If you did not initiate this request, please secure your account.<br/>
              &copy; 2026 Scrutiq Technical Platforms • AI-Powered Talent Ingestion.
            </p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`[EMAIL] Verification code dispatched to ${email}`);
    } catch (error: any) {
      console.error("[EMAIL ERROR] Dispatch failed:", error);
      console.log(`[DEBUG INFO] Sender: ${process.env.EMAIL_USER}`);
      console.log(`[DEBUG] FALLBACK VERIFICATION CODE FOR ${email}: ${code}`);
      throw new Error(`Failed to send verification email: ${error.message}`);
    }
  }

  async sendCustomEmail(email: string, subject: string, message: string, recruiterEmail?: string) {
    // Process message for better rendering: convert double newlines to paragraphs and dashes to bullets
    const formattedMessage = message
      .split('\n\n')
      .map(para => `<p style="margin-bottom: 16px;">${para.replace(/\n/g, '<br/>')}</p>`)
      .join('')
      .replace(/ - (.*?)(?=<br\/>|<\/p>)/g, '<li style="margin-bottom: 8px; color: #334155;">$1</li>')
      .replace(/(<li.*<\/li>)+/g, '<ul style="padding-left: 20px; list-style-type: square; margin-bottom: 24px;">$&</ul>');

    const feedbackFooter = recruiterEmail 
      ? `<p style="margin: 4px 0 0; font-size: 12px; color: #64748B;">
          Any question or feedbacks on this email may be sent to ${recruiterEmail}.
        </p>`
      : `<p style="margin: 4px 0 0; font-size: 12px; color: #64748B;">
          Reply to this message to speak with our technical support team.
        </p>`;

    const mailOptions = {
      from: `"Scrutiq Notifications" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: `
        <div style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid #E2E8F0; border-radius: 24px; overflow: hidden; background: #FFFFFF;">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&display=swap');
          </style>
          
          <!-- Branding Header -->
          <div style="background: #0F172A; padding: 32px; text-align: center;">
            <div style="font-size: 24px; font-weight: 800; color: #FFFFFF; letter-spacing: -1px;">
              Scrutiq<span style="color: #3B82F6;">.</span>
            </div>
          </div>

          <div style="padding: 40px;">
            <div style="margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid #F1F5F9;">
              <h1 style="font-size: 24px; font-weight: 800; color: #0F172A; margin: 0; letter-spacing: -0.02em;">${subject}</h1>
            </div>

            <div style="font-size: 15px; line-height: 1.7; color: #475569; margin-bottom: 40px;">
              ${formattedMessage}
            </div>

            <div style="padding: 24px; background: #F8FAFC; border-radius: 16px; border-left: 4px solid #2563EB;">
              <p style="margin: 0; font-size: 13px; font-weight: 700; color: #1E293B;">
                Need assistance?
              </p>
              ${feedbackFooter}
            </div>
          </div>

          <div style="background: #F8FAFC; padding: 32px; text-align: center; border-top: 1px solid #F1F5F9;">
            <p style="font-size: 11px; text-align: center; color: #94A3B8; line-height: 1.6; margin: 0;">
              This system notification was generated by Scrutiq Dashboard.<br/>
              &copy; 2026 Scrutiq Recruitment • Intelligent Talent Pipeline.
            </p>
          </div>
        </div>
      `,
    };


    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`[EMAIL] Custom message dispatched to ${email}`);
    } catch (error: any) {
      console.error("[EMAIL ERROR] Dispatch failed:", error);
      console.log(`[DEBUG INFO] Sender: ${process.env.EMAIL_USER}`);
      throw new Error(`Failed to dispatch email: ${error.message}`);
    }
  }

  async sendPasswordResetPin(email: string, pin: string) {
    const mailOptions = {
      from: `"Scrutiq Security" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Password Recovery PIN",
      html: `
        <div style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #E2E8F0; border-radius: 24px; color: #1E293B; background: #FFFFFF;">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&display=swap');
          </style>
          
          <div style="text-align: center; margin-bottom: 40px;">
            <div style="display: inline-block; font-size: 28px; font-weight: 800; color: #DC2626; letter-spacing: -1px;">
              Scrutiq Security<span style="color: #64748B;">.</span>
            </div>
          </div>

          <h1 style="font-size: 20px; font-weight: 800; text-align: center; margin-bottom: 12px; color: #0F172A; letter-spacing: -0.02em;">Password Recovery</h1>
          <p style="text-align: center; color: #64748B; font-size: 14px; margin-bottom: 40px;">You are receiving this because a password reset was requested for your recruiter account. Use the PIN below to proceed.</p>
          
          <div style="background: #FFF1F2; border: 1px solid #FFE4E6; border-radius: 20px; padding: 32px; text-align: center; margin-bottom: 40px;">
            <span style="font-size: 48px; font-weight: 800; color: #DC2626; letter-spacing: 12px; font-family: monospace;">${pin}</span>
          </div>
          
          <p style="text-align: center; color: #F43F5E; font-size: 11px; font-weight: bold; margin-top: 20px;">
            This PIN is valid for 10 minutes.
          </p>

          <div style="border-top: 1px solid #F1F5F9; margin-top: 40px; padding-top: 30px; text-align: center;">
            <p style="font-size: 11px; color: #94A3B8; line-height: 1.8; margin-bottom: 0;">
              If you did not request this, please ignore this email.<br/>
              &copy; 2026 Scrutiq Recruitment • Managed Security Infrastructure.
            </p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`[SECURITY] Reset PIN dispatched to ${email}`);
    } catch (error: any) {
      console.error("[SECURITY ERROR] PIN dispatch failed:", error);
      throw new Error(`Technical failure during recovery email dispatch: ${error.message}`);
    }
  }
}


export default new EmailService();
