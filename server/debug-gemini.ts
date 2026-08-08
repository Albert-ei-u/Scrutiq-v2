import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * TECHNICAL PROBE: GEMINI CONNECTIVITY
 * This script verifies that the AI registry is accessible and the API key is active.
 */
async function runProbe() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("[CRITICAL] No GEMINI_API_KEY found in the environment registry.");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = "gemini-flash-latest"; // Verified stable model for this environment

  try {
    console.log(`[SYSTEM] Initiating Technical Probe for model: ${modelName}...`);
    const model = genAI.getGenerativeModel({ model: modelName });
    
    // Executing lightweight content generation protocol
    const result = await model.generateContent("Respond with 'SYSTEM ONLINE' if technical registry is accessible.");
    const response = await result.response;
    const text = response.text();
    
    console.log(`[SUCCESS] Connectivity Verified. Model returned: ${text.trim()}`);
  } catch (error: any) {
    console.error(`[FAULT] Connectivity Failure detected for ${modelName}.`);
    console.error(`- Error Code: ${error.status || "UNKNOWN"}`);
    console.error(`- Fault Message: ${error.message}`);
    
    if (error.status === 429) {
      console.warn("[ADVISORY] System is currently experiencing rate-limiting constraints.");
    } else if (error.status === 503) {
      console.warn("[ADVISORY] AI Service is temporarily overloaded.");
    }
  }
}

runProbe();
