import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function listModels() {
  try {
    const models = await ai.models.list();
    for await (const model of models) {
      console.log(model.name);
    }
  } catch (err) {
    console.error(err);
  }
}

listModels();
