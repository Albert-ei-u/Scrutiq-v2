import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || "";
    this.genAI = new GoogleGenerativeAI(apiKey);
    // Using gemini-flash-latest for production stability
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-flash-latest",
    });
  }

  public async executeWithRetry(
    prompt: string,
    attempt: number = 1,
  ): Promise<any> {
    const models = ["gemini-flash-latest", "gemini-3.1-flash-lite-preview"];
    const modelToUse = attempt > 2 ? models[1] : models[0];
    const activeModel = this.genAI.getGenerativeModel({ model: modelToUse });

    try {
      const result = await activeModel.generateContent(prompt);
      return result;
    } catch (error: any) {
      const isOverload =
        error.message?.includes("503") ||
        error.message?.includes("demand") ||
        error.message?.includes("limit");

      if (isOverload && attempt < 6) {
        const delay = 5000 * attempt; // More aggressive backoff (5s, 10s, 15s...)
        console.warn(
          `[AI SERVICE OVERLOAD] Attempt ${attempt} failed for ${modelToUse}. Retrying in ${delay / 1000}s...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.executeWithRetry(prompt, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Technical Screening Protocol:
   * Analyzes candidate registry against job requirement matrix.
   */
  async screenCandidates(jobData: any, candidates: any[]) {
    const prompt = `
      You are a strict HR screening assistant.
      
      You will score each candidate CV from 0 to 100 based on how well they match the job description using this exact rubric:
      
      1. RELEVANT EXPERIENCE (30pts)
         - Years of experience match/exceed requirement = 25-30pts
         - Slightly under or partially relevant = 12-20pts
         - Little to no relevant experience = 0-10pts
      2. PROOF OF RESULTS (25pts)
         - Quantified achievements = 20-25pts
         - Some results but vague = 8-15pts
         - No measurable results = 0pts
      3. SKILLS MATCH (25pts)
         - 90-100% of skills matched = 25pts
         - 50-89% matched = 10-20pts
         - Below 50% = 0-8pts
      4. PROFESSIONALISM & CLARITY (10pts)
         - Well-structured, specific = 10pts
         - Vagueness/filler ("assisted") = 5pts
         - Poorly written = 0-2pts
      5. EXTRAS (10pts)
         - Relevant certs, portfolio = 10pts
         - Minor extras = 5pts
         - Nothing extra = 0pts
         
      STRICT RULES:
      - Do NOT assume missing info.
      - Penalize vague language.
      - "Available on request" = not provided.
      - Only score what is written.
      
      JOB DESCRIPTION:
      Title: ${jobData.title}
      Description: ${jobData.description}
      Department: ${jobData.department}
      
      CANDIDATES:
      ${candidates
        .map(
          (c, i) => `--- CANDIDATE #${i + 1} ---
      ID: ${c._id?.toString() || c.id}
      Name: ${c.firstName && c.lastName ? `${c.firstName} ${c.lastName}` : c.name || "Candidate Name Not Found"}
      Headline: ${c.headline || c.role || "Technical Professional"}
      Skills: ${c.skills?.length ? JSON.stringify(c.skills) : c.technicalProfile || "See CV Text"}
      Experience: ${c.workExperience?.length ? JSON.stringify(c.workExperience) : c.experience || "See CV Text"}
      Education: ${c.education?.length ? JSON.stringify(c.education) : "See CV Text"}
      Projects: ${c.projects?.length ? JSON.stringify(c.projects) : "See CV Text"}
      Certifications: ${c.certifications?.length ? JSON.stringify(c.certifications) : "None listed"}
      CV TEXT:
      ${c.resumeText || c.technicalProfile || "No readable CV data provided."}
      `,
        )
        .join("\n")}
      
      INSTRUCTION:
      You MUST return a JSON array of evaluations.
      
      For EACH candidate, return this JSON object:
      {
        "candidateId": "string (MUST MATCH THE ID PROVIDED)",
        "candidateName": "string (Extract their ACTUAL REAL NAME from the CV text. DO NOT use the placeholder name provided above if the real name is found.)",
        "candidateEmail": "string (Extract their ACTUAL EMAIL from the CV text. Emails are often hidden as links or after icons—search with all your might, but NEVER guess. If no valid email address is found, return 'No email available'.)",
        "candidateGender": "string (Extract their GENDER as 'M', 'F', or 'Not stated'. Look for specific pronouns or declarations, but NEVER guess based on name alone. If unsure, return 'Not stated'.)",


        "microSummary": "string (20 words max technical summary of their specific experience)",
        "matchScore": number (Calculate strict total 0-100),

        "strengths": ["string (High-level professional advantage)"],
        "weaknesses": ["string (Specific technical or experience area to improve for future applications)"],
        "finalRecommendation": "Priority Alignment" | "Technical Fit" | "Potential Fit" | "No Alignment",
        "reasoning": "A 2-3 sentence summary explaining the score and key areas for improvement. Just pure paragraph text."
      }
      
      Make sure to format the 'reasoning' field EXACTLY like the string template above, filling in the actual numbers and summary text. Use \\n for line breaks in the string.
      OUTPUT JSON ONLY. Do not use markdown blocks around the JSON.
    `;

    try {
      console.log(
        `[AI SERVICE] Initiating Gemini Screening Protocol for ${candidates.length} profiles...`,
      );
      const result = await this.executeWithRetry(prompt);
      const response = await result.response;
      const text = response.text();

      console.log(
        `[AI SERVICE] Raw Response Extracted. Length: ${text.length}`,
      );

      // SMART EXTRACTION: Find the starting '[' and ending ']' to isolate the JSON array
      const startIndex = text.indexOf("[");
      const endIndex = text.lastIndexOf("]");

      if (startIndex === -1 || endIndex === -1) {
        console.error(
          "[AI FAULT] No valid JSON array found in response thought process.",
        );
        console.log("Raw Response Trace:", text);
        throw new Error(
          "The AI returned an invalid data format. Please try again.",
        );
      }

      const jsonStr = text.substring(startIndex, endIndex + 1);
      const parsedResults = JSON.parse(jsonStr);

      console.log(
        `[AI SERVICE] Successfully parsed ${parsedResults.length} candidate evaluations.`,
      );
      return parsedResults;
    } catch (error: any) {
      console.error("[AI SERVICE FAULT]:", error.message || error);

      const msg = error.message?.toLowerCase() || "";

      if (msg.includes("limit") || msg.includes("quota")) {
        throw new Error(
          "Our AI partner is currently at full capacity for your account. Please wait a moment or upgrade your screening tokens.",
        );
      }

      if (
        msg.includes("503") ||
        msg.includes("overloaded") ||
        msg.includes("demand")
      ) {
        throw new Error(
          "The AI brain is experiencing high demand. We tried to retry for you, but it's still busy. Please try again in 1 minute.",
        );
      }

      if (msg.includes("api key") || msg.includes("invalid")) {
        throw new Error(
          "Technical setup error: The AI brain key is missing or invalid. Please check your system configuration.",
        );
      }

      if (error instanceof SyntaxError) {
        throw new Error(
          "The AI gave us a response we couldn't read correctly. This sometimes happens with complex resumes. Trying again usually fixes it!",
        );
      }
      throw new Error(
        "We encountered a small hiccup while talking to the AI. Please try running the screening one more time.",
      );
    }
  }
}

export default new GeminiService();
