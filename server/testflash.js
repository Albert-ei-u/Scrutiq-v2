const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, ".env") });

async function testAI() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    console.log("Sending ping to gemini-2.5-pro...");
    const result = await model.generateContent("Hello?");
    const response = await result.response;
    console.log("Success:", response.text());
  } catch (e) {
    console.error("AI Error:", e);
  }
}

testAI();
