import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function testModel() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: 'user', parts: [{ text: "Hello" }] }]
    });
    console.log("Success:", response.text);
  } catch (err) {
    console.error("Error:", err);
  }
}

testModel();
