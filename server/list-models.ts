import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";
import axios from "axios";

dotenv.config({ path: path.resolve(__dirname, ".env") });

async function listModels() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("No API key found in .env");
      return;
    }
    
    const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = response.data;
    
    if (data.models) {
      console.log("AVAILABLE MODELS:");
      data.models.forEach((m) => {
        if (m.supportedGenerationMethods.includes("generateContent")) {
          console.log(`- ${m.name} (${m.displayName})`);
        }
      });
    } else {
      console.log("Error fetching models:", data);
    }
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

listModels();
