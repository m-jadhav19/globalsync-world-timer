
import { GoogleGenAI, Type } from "@google/genai";

// Always use the process.env.API_KEY directly as per SDK guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAITimezoneInsights = async (city: string, zoneName: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a 2-sentence interesting fact about the location ${city} (Timezone: ${zoneName}). Focus on its lifestyle, history, or something unique about how they perceive time or their current season.`,
      config: {
        temperature: 0.7,
        topP: 0.9,
      }
    });
    // The response.text property (not a method) directly returns the string output.
    return response.text || "No insights available for this location.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The stars are quiet today. No AI insights available.";
  }
};

export const searchCityTimezone = async (query: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Find the IANA Timezone ID for the query: "${query}". Return only the ID and the clean city name.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            zoneName: { type: Type.STRING, description: "IANA Timezone string, e.g., 'Europe/Paris'" },
            city: { type: Type.STRING, description: "The city name" },
            country: { type: Type.STRING, description: "The country name" }
          },
          required: ["zoneName", "city", "country"]
        }
      }
    });
    // Access response.text property and trim for parsing JSON.
    const jsonStr = response.text;
    return jsonStr ? JSON.parse(jsonStr.trim()) : null;
  } catch (error) {
    console.error("Gemini Search Error:", error);
    return null;
  }
};
