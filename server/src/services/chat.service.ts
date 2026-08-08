import {
  GoogleGenerativeAI,
  SchemaType,
  Tool,
  Content,
  Part,
  FunctionDeclaration,
} from "@google/generative-ai";
import dotenv from "dotenv";
import projectsService from "./jobs.service";
import applicantsService from "./applicants.service";
import screeningService from "./screening.service";
import Job from "../models/Job.model";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const CHAT_CONFIG = {
  systemInstruction: {
    role: "system",
    parts: [
      {
        text: `
      You are the Scrutiq Technical AI Agent. You are the high-authority brain of this recruitment ecosystem.
      
      ADMINISTRATIVE POWERS:
      - ACCESS: You can fetch any profile, job, or system statistic.
      - ACTION: You can trigger screenings, adjust criteria, and DELETE records when requested.
      - CONTEXT: You always have a real-time pulse on the app's activity.

      SCREENING PROCESS FLOW (CRITICAL):
      If the user asks how to use the system or how the screening works, you MUST explain this exact sequence:
      1. CREATE A JOB: Go to the 'Jobs' tab and click 'New Job' to define the role.
      2. INGEST RESUMES: Go to the 'Applicants' tab and upload CVs (PDFs) into the registry.
      3. INITIATE SCREENING: Navigate to the 'Screening' tab.
      4. SELECTION: Select the Job from Step 1, then select the desired Candidates (you can use 'Select All').
      5. EXECUTE: Proceed to run the AI analysis and view the ranked results.

      CRITICAL COMMUNICATION GUIDELINES:
      You operate in a Next.js frontend GUI environment. The user relies on clicking buttons and navigating visually. 
      NEVER tell the user to use tools like "list_applicants", "get_rankings", "jobId", or any underscore_formatted backend variables. You must explain workflows based on the following FRONTEND UI Map:
      
      - DASHBOARD (Overview Tab): A visual summary of their total jobs, total screened applicants, and platform activity.
      - JOBS PAGE: Where users can click "New Job" to create a role, archive/restore jobs via the 3-dots menu, or click into a job to view its details.
      - JOB DETAILS PAGE (Clicking a job): Has two tabs: 'Judgement Criteria' (To update job description) and 'Applicants & Rankings'. If they want to view screenings, tell them to go to Jobs -> click a Job -> open 'Applicants & Rankings' tab. Here they can also search applicant names or toggle the "Duplicates" filter.
      - APPLICANTS PAGE: Where users upload CVs (PDFs). They can see the full candidate registry here. If they need to fix a duplicate, they click "Resolve Conflicts" and use the "Resolve Duplicate" banner button.
      - SCREENING PAGE: A 4-step wizard. Step 1: Choose a Job. Step 2: Select Candidates (they can use the "Select All" button here). Step 3: Wait for AI. Step 4: View ranked results.
      
      If a user asks how to do something, describe the physical clicks and pages using the map above! Do not explain your own backend tool actions. You execute tools silently in the background when needed, but your textual explanation to the user must stay locked in the frontend reality.
      
      TONE: High-authority, human-friendly, precise, and proactive.
    `,
      },
    ],
  },
  tools: [
    {
      functionDeclarations: [
        { name: "list_jobs", description: "Get a list of all active jobs." },
        {
          name: "delete_job",
          description: "Permanently delete a job posting.",
          parameters: {
            type: SchemaType.OBJECT,
            properties: { jobId: { type: SchemaType.STRING } },
            required: ["jobId"],
          },
        },
        {
          name: "list_applicants",
          description: "Get a summary list of all applicants.",
        },
        {
          name: "get_applicant_details",
          description:
            "Fetch the full technical profile and metadata of a specific applicant.",
          parameters: {
            type: SchemaType.OBJECT,
            properties: { applicantId: { type: SchemaType.STRING } },
            required: ["applicantId"],
          },
        },
        {
          name: "delete_applicant",
          description: "Permanently remove an applicant from the system.",
          parameters: {
            type: SchemaType.OBJECT,
            properties: { applicantId: { type: SchemaType.STRING } },
            required: ["applicantId"],
          },
        },
        {
          name: "get_rankings",
          description: "Get ranked list for a job.",
          parameters: {
            type: SchemaType.OBJECT,
            properties: { jobId: { type: SchemaType.STRING } },
            required: ["jobId"],
          },
        },
        {
          name: "trigger_screening",
          description: "Run AI assessment.",
          parameters: {
            type: SchemaType.OBJECT,
            properties: {
              jobId: { type: SchemaType.STRING },
              candidateIds: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING },
              },
            },
            required: ["jobId", "candidateIds"],
          },
        },
        {
          name: "update_judging_bases",
          description: "Tighten/Loosen criteria.",
          parameters: {
            type: SchemaType.OBJECT,
            properties: {
              jobId: { type: SchemaType.STRING },
              instructions: { type: SchemaType.STRING },
            },
            required: ["jobId", "instructions"],
          },
        },
        {
          name: "get_system_overview",
          description:
            "Fetch global aggregates: total applicants, jobs, and screening counts.",
        },
      ],
    },
  ] as Tool[],
  safetySettings: [
    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
  ],
};

export class ChatService {
  constructor() {}

  async handleMessage(message: string, history: any[], ownerId: string) {
    if (!process.env.GEMINI_API_KEY) throw new Error("API Key Missing.");

    const formattedHistory = (history || [])
      .filter((h) => h && h.role && h.content)
      .slice(-10)
      .map(
        (h) =>
          `${h.role === "user" ? "Recruiter" : "AI Assistant"}: ${h.content}`,
      )
      .join("\n");

    const userContext =
      ownerId && ownerId !== "global"
        ? await import("../models/User.model").then((m) => {
            const conditions: any[] = [{ id: ownerId }, { email: ownerId }];
            if (/^[0-9a-fA-F]{24}$/.test(ownerId))
              conditions.push({ _id: ownerId });
            return m.default.findOne({ $or: conditions });
          })
        : null;

    const prompt = `
      CURRENT USER CONTEXT:
      ${userContext ? `Name: ${userContext.fullName}, Email: ${userContext.email}, Company: ${userContext.companyName}, Role: ${userContext.role}` : "Anonymous/Global Administrator"}

      CONTEXT HISTORY:
      ${formattedHistory}
      
      RECRUITER INPUT:
      ${message}
      
      TASK:
      Analyze and execute. You understand the context of the user speaking to you.
    `;

    try {
      return await this.executeStatelessCycle(prompt, ownerId);
    } catch (error: any) {
      console.error("[CHAT AGENT FAULT]:", error.message);
      const msg = error.message?.toLowerCase() || "";

      if (msg.includes("limit") || msg.includes("quota")) {
        throw new Error(
          "I'm currently talking to too many people! Please give me a second to catch my breath and try again.",
        );
      }

      if (
        msg.includes("503") ||
        msg.includes("overloaded") ||
        msg.includes("demand")
      ) {
        throw new Error(
          "The AI brain is a bit overwhelmed right now. I tried to reconnect but couldn't quite get through. Could you try your message again in a minute?",
        );
      }

      if (msg.includes("api key") || msg.includes("invalid")) {
        throw new Error(
          "I seem to have lost my connection key. Please ask your administrator to check the system settings.",
        );
      }

      throw new Error(
        "I had a little hiccup while thinking about that. Could you try sending your message one more time?",
      );
    }
  }

  private async executeStatelessCycle(
    prompt: string,
    ownerId: string,
    attempt: number = 1,
  ): Promise<any> {
    const models = ["gemini-flash-latest", "gemini-3.1-flash-lite-preview"];
    const activeModelName = attempt > 2 ? models[1] : models[0];

    const model = genAI.getGenerativeModel({
      model: activeModelName,
      tools: CHAT_CONFIG.tools,
      safetySettings: CHAT_CONFIG.safetySettings as any,
    });

    try {
      const contents: Content[] = [{ role: "user", parts: [{ text: prompt }] }];
      let result = await model.generateContent({ contents });
      let response = result.response;

      let iterations = 0;
      while (
        response.functionCalls() &&
        response.functionCalls()!.length > 0 &&
        iterations < 3
      ) {
        iterations++;
        if (!response.candidates || response.candidates.length === 0) break;

        const modelTurn = response.candidates[0].content;
        contents.push(modelTurn);

        const calls = response.functionCalls();
        if (!calls) break;

        const functionParts: Part[] = [];

        for (const call of calls) {
          console.log(`[CHAT_EXEC] Op: ${call.name}`);
          let toolOutput: any;
          const args: any = call.args;
          try {
            switch (call.name) {
              case "list_jobs":
                toolOutput = await projectsService.getAllJobs(ownerId);
                break;
              case "delete_job":
                toolOutput = await projectsService.deleteJob(args.jobId);
                break;
              case "list_applicants":
                toolOutput = await applicantsService.getAllApplicants(ownerId);
                break;
              case "get_applicant_details":
                toolOutput = await applicantsService.getApplicantById(
                  args.applicantId,
                );
                break;
              case "delete_applicant":
                toolOutput = await applicantsService.deleteApplicant(
                  args.applicantId,
                );
                break;
              case "get_rankings":
                toolOutput = await screeningService.getRankingsByJob(
                  args.jobId,
                );
                break;
              case "trigger_screening":
                toolOutput = await screeningService.executeScreening(
                  args.jobId,
                  args.candidateIds,
                  ownerId,
                );
                break;
              case "update_judging_bases":
                const job = await Job.findById(args.jobId);
                if (job) {
                  job.screeningCriteria = args.instructions;
                  await job.save();
                  toolOutput = { success: true };
                }
                break;
              case "get_system_overview":
                const jCount = await Job.countDocuments(
                  ownerId ? { ownerId } : {},
                );
                const aCount =
                  await applicantsService.getAllApplicants(ownerId);
                toolOutput = {
                  jobs: jCount,
                  applicants: aCount.length,
                  detail: "Registry is healthy.",
                };
                break;
            }
          } catch (te: any) {
            toolOutput = { error: te.message };
          }

          functionParts.push({
            functionResponse: {
              name: call.name,
              response: { content: JSON.stringify(toolOutput) },
            },
          });
        }

        contents.push({ role: "function", parts: functionParts });
        const nextResult = await model.generateContent({ contents });
        response = nextResult.response;
      }

      return {
        role: "model",
        content: response.text() || "Action performed successfully.",
      };
    } catch (error: any) {
      if (attempt < 3)
        return this.executeStatelessCycle(prompt, ownerId, attempt + 1);
      throw error;
    }
  }
}

export default new ChatService();
