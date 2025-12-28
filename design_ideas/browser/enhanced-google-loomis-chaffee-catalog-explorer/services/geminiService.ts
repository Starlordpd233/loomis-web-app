
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getCourseAdvice = async (userInterests: string, availableCourses: any[]) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `User Interests: ${userInterests}\nAvailable Courses: ${JSON.stringify(availableCourses.map(c => ({ title: c.title, dept: c.department, desc: c.description })))}`,
      config: {
        systemInstruction: "You are an AI Academic Advisor for Loomis Chaffee School. Based on the student's interests, suggest 3 courses from the catalog and explain why they are a good fit. Keep it encouraging and professional. Return in JSON format with a brief overview.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            advice: { type: Type.STRING },
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  reason: { type: Type.STRING }
                },
                required: ["title", "reason"]
              }
            }
          },
          required: ["advice", "suggestions"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};
