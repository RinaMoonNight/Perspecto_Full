
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GeneratedResult, GeneratorType, PersonaData } from "../types";

// Mock data fallback in case of API failure or if environment key is missing (for demo purposes)
const MOCK_DATA: GeneratedResult = {
  persona: {
    name: "Alex Rivera",
    role: "Freelance Graphic Designer",
    goals: ["Increase client base", "Streamline workflow", "Create high-quality outputs quickly"],
    needs: ["Reliable software tools", "Asset management system", "Fast rendering capabilities"],
    pains: ["Inconsistent client feedback", "Software subscription costs", "Time-consuming file exports"],
    tasks: ["Sourcing images", "Creating mockups", "Communicating with clients via email"]
  },
  jtbd: [
    {
      situation: "When I am starting a new branding project",
      motivation: "I want to quickly access a library of high-quality vector assets",
      outcome: "so I can present professional concepts to my client without spending hours drawing from scratch."
    },
    {
      situation: "When I receive feedback from a client",
      motivation: "I want to easily iterate on the design versions",
      outcome: "so I can maintain a clear history of changes and approval."
    }
  ]
};

export const generateUXData = async (
  context: string,
  type: GeneratorType,
  existingPersona?: PersonaData
): Promise<GeneratedResult> => {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    console.warn("No API Key found, using mock data.");
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_DATA), 2000));
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

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

    let prompt = `You are an expert UX Researcher. Analyze the following Project Context: "${context}".`;

    if (type === 'persona') {
      prompt += ` Generate a detailed User Persona for this project.`;
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
      prompt += ` Generate both a User Persona and 3 Jobs To Be Done (JTBD) statements for this project.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.7, 
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
    // Fallback to mock data on error allows the UI to continue working for demo purposes
    return MOCK_DATA;
  }
};
