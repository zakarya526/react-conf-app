import { GoogleGenAI } from "@google/genai";
import Constants from "expo-constants";

const getApiKey = (): string => {
  const apiKey = "AIzaSyD4srPyVUKYPaU40DV_oa-NzgCMH3q-AS4"
    // Constants.expoConfig?.extra?.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    // console.log("apiKey", apiKey);

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured. Please add it to your .env file.",
    );
  }

  return apiKey as string;
};

let genAI: GoogleGenAI | null = null;

const getGenAI = (): GoogleGenAI => {
  if (!genAI) {
    const apiKey = getApiKey();
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
};

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export const sendMessage = async (
  messages: ChatMessage[],
): Promise<string> => {
  try {
    const genAI = getGenAI();

    // Convert messages to Gemini format
    const contents = messages.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
    });

    return response.text || "No response from AI assistant";
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to get response from AI assistant",
    );
  }
};

