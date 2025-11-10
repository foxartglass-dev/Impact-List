
import { GoogleGenAI, Type } from "@google/genai";
import { ActionItem } from '../types';

// FIX: Initialize GoogleGenAI with API_KEY directly from environment variables as per guidelines, removing placeholder and runtime checks.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateActionItems(sourceText: string): Promise<Partial<ActionItem>[]> {
  try {
    // FIX: Refactored to use `ai.models.generateContent` with inline configuration, removing deprecated `generationConfig` variable and simplifying the `contents` format.
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the following content and generate a list of 10-20 concise, non-overlapping, and actionable items. Content: """${sourceText}"""`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: "A concise, actionable title for the task (max 12 words).",
              },
              why: {
                type: Type.STRING,
                description: "A short rationale explaining the impact or reason for this action (max 20 words).",
              },
              sourceCitation: {
                type: Type.STRING,
                description: "A brief quote or reference from the source text that justifies this action item."
              }
            },
            required: ["title", "why", "sourceCitation"],
          },
        },
        systemInstruction: "You are an expert productivity consultant. Your task is to analyze the provided text and extract a list of concise, non-overlapping, and highly actionable items. For each item, provide a short 'why' rationale explaining its importance or impact, and a citation from the source text.",
      }
    });

    const jsonText = result.text.trim();
    const items = JSON.parse(jsonText);
    return items as Partial<ActionItem>[];
  } catch (error) {
    console.error("Error generating action items:", error);
    throw new Error("Failed to generate action items from the provided text.");
  }
}

export async function getCoachResponse(item: ActionItem, userPrompt: string, history: {role: string, parts: {text: string}[]}[]): Promise<string> {
    try {
        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: `You are a helpful AI coach. Your goal is to provide specific, actionable guidance on the user's task. You must only use the context provided. Do not invent information outside of this context. The user is working on the action item titled "${item.title}" with the rationale "${item.why}". The original source context for this item is "${item.sourceCitation}". Keep your answers concise and focused on the user's immediate question.`,
            },
            history: history,
        });

        const result = await chat.sendMessage({ message: userPrompt });

        return result.text;
    } catch (error) {
        console.error("Error getting coach response:", error);
        throw new Error("The AI coach is currently unavailable.");
    }
}