
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GeneratedResult, GeneratorType, PersonaData } from "../types";

// The API Key provided for this application
const API_KEY = "AIzaSyAvoRKm6oVglTnYNbxM6fyPmUzRjZqBKSk";

export const generateUXData = async (
  context: string,
  type: GeneratorType,
  existingPersona?: PersonaData
): Promise<GeneratedResult> => {
  
  if (!API_KEY) {
    throw new Error("No API Key configured.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        persona: {
          type: Type.OBJECT,
          nullable: true,
          properties: {
            name: { type: Type.STRING },
            role: { type: Type.STRING },
            goals: { type: Type.ARRAY, items: { type: Type.STRING } },
            needs: { type: Type.ARRAY, items: { type: Type.STRING } },
            pains: { type: Type.ARRAY, items: { type: Type.STRING } },
            tasks: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
        jtbd: {
          type: Type.ARRAY,
          nullable: true,
          items: {
            type: Type.OBJECT,
            properties: {
              situation: { type: Type.STRING, description: "The 'When I...' part" },
              motivation: { type: Type.STRING, description: "The 'I want to...' part" },
              outcome: { type: Type.STRING, description: "The 'So I can...' part" },
            },
          }
        },
      },
    };

    let prompt = `You are an expert UX Researcher. Analyze the following specific Project Context: "${context}".`;

    if (type === 'persona') {
      prompt += ` Generate a unique and detailed User Persona specifically for this project context. Do not use generic placeholders.`;
    } else if (type === 'jtbd') {
      if (existingPersona) {
        prompt += `\n\nBased specifically on this User Persona:
        Name: ${existingPersona.name}
        Role: ${existingPersona.role}
        Goals: ${existingPersona.goals.join(', ')}
        Pains: ${existingPersona.pains.join(', ')}
        
        Generate 3 specific Jobs To Be Done (JTBD) statements that addresses this persona's specific needs in the context of the project. Format: When I..., I want to..., So I can...`;
      } else {
        prompt += ` Generate 3 specific Jobs To Be Done (JTBD) statements for this project using the format: When I..., I want to..., So I can...`;
      }
    } else {
      prompt += ` Generate both a unique User Persona and 3 Jobs To Be Done (JTBD) statements specifically for this project context.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.8, // Slightly higher temperature for more creativity/uniqueness
      },
    });

    if (response.text) {
      let jsonString = response.text.trim();
      
      // Clean up markdown code blocks if the model includes them
      if (jsonString.startsWith("```json")) {
        jsonString = jsonString.replace(/^```json\n/, "").replace(/\n```$/, "");
      } else if (jsonString.startsWith("```")) {
        jsonString = jsonString.replace(/^```\n/, "").replace(/\n```$/, "");
      }

      const parsed = JSON.parse(jsonString) as GeneratedResult;
      
      // Filter out empty objects if the model hallucinates a structure it shouldn't have returned
      if (type === 'persona') delete parsed.jtbd;
      if (type === 'jtbd') delete parsed.persona;
      
      return parsed;
    }

    throw new Error("No response text received");

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error; // Re-throw to be caught by App.tsx for toast handling
  }
};
