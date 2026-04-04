"use server";

import { GoogleGenAI, Type, Schema } from "@google/genai";
import prisma from "@/lib/prisma";

// Initialize the Google Gen AI client
// This expects process.env.GEMINI_API_KEY to be available in the environment.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// The required JSON schema for the response
const responseSchema: Schema = {
  type: Type.ARRAY,
  description: "A chronological daily list of study tasks.",
  items: {
    type: Type.OBJECT,
    properties: {
      day: {
        type: Type.INTEGER,
        description: "The day number (1, 2, 3...) starting from today.",
      },
      title: {
        type: Type.STRING,
        description: "A short, concise title for the day's study goal.",
      },
      description: {
        type: Type.STRING,
        description:
          "A short paragraph describing the specific chapters, exercises, or strategies to apply on this day.",
      },
    },
    required: ["day", "title", "description"],
  },
};

export async function generateStudyPlan(
  subject: string,
  examDate: string,
  daysLeft: number,
  subjectId?: string,
  userId?: string,
  syllabusBase64?: string,
  syllabusMimeType?: string,
) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }

    let notesContext = "";
    if (subjectId && userId) {
      const notes = await prisma.note.findMany({
        where: { subjectId, userId },
        orderBy: { updatedAt: "desc" },
      });
      if (notes.length > 0) {
        notesContext = `\n\n=== EXISTING USER NOTES ===\nThe user has already studied or taken notes on the following:\n`;
        notes.forEach((n) => {
          notesContext += `\n--- Note: ${n.title || "Untitled"} ---\n${n.content || ""}\n`;
        });
        notesContext += `\nPlease integrate these topics and acknowledge areas the user already understands, prioritizing unstudied topics if necessary.`;
      }
    }

    // Core prompt
    let promptText = `You are an expert academic tutor. Create a highly effective, day-by-day study plan for the subject "${subject}" to prepare for an exam on ${examDate}.
CRITICAL CONSTRAINT: You MUST create EXACTLY ${daysLeft} days in your plan. If daysLeft is ${daysLeft}, output exactly ${daysLeft} items, starting from Day 1 to Day ${daysLeft}.`;

    if (notesContext) {
      promptText += notesContext;
    }

    const contents: Array<
      { text: string } | { inlineData: { data: string; mimeType: string } }
    > = [];

    if (syllabusBase64 && syllabusMimeType) {
      promptText += `\n\n=== SYLLABUS PROVIDED ===\nBase the plan primarily heavily on the attached syllabus document.`;
      contents.push({ text: promptText });
      contents.push({
        inlineData: {
          data: syllabusBase64,
          mimeType: syllabusMimeType,
        },
      });
    } else {
      contents.push({ text: promptText });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2,
      },
    });

    if (!response.text) {
      throw new Error("Failed to generate plan");
    }

    const plan = JSON.parse(response.text);
    return { success: true, plan };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("AI Generation Error:", errorMessage);
    return {
      success: false,
      error: errorMessage || "Failed to generate study plan",
    };
  }
}

export async function summarizeNote(content: string) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }

    const prompt = `You are an expert academic summarizer. Summarize the following note content. Extract the core concepts, important definitions, and key takeaways, and return them formatted as a clean HTML bulleted list (using <ul> and <li> tags). 
Do NOT include a title like "Summary", just return the HTML list.\n\nNote Content:\n${content}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.3,
      },
    });

    const summary = response.text?.trim() || "";
    // Avoid returning markdown code block tags if the model includes them accidentally
    const cleanedSummary = summary
      .replace(/^```html\n/i, "")
      .replace(/\n```$/i, "");

    return { success: true, summary: cleanedSummary };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("AI Generation Error:", errorMessage);
    return {
      success: false,
      error: errorMessage || "Failed to summarize note",
    };
  }
}
