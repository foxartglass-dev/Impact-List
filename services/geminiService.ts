import { GoogleGenAI, Type } from "@google/genai";
import { ActionItem, AiCoachResponsePayload, DIFMFeasibility } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateActionItems(sourceText: string, customPrompt?: string): Promise<Partial<ActionItem>[]> {
  try {
    console.log('item_dedup_merged: Requesting deduplication and structured output from model.');
    const systemInstruction = `You are an expert productivity consultant. Your task is to analyze the provided text and extract a list of 10-20 concise, non-overlapping, and highly actionable items.
    DEDUPLICATION RULE: Analyze all generated items for semantic similarity. If similarity is >= 0.82, merge them. The winner should have the clearer or shorter title. Merge their 'why' rationales with a semicolon, and create a union of their source references.
    For each item, provide a short 'why' rationale explaining its importance, a citation from the source, and an impact score.`;
  
    const userPrompt = customPrompt || `Analyze the following content and generate a list of 10-20 concise, non-overlapping, and actionable items. Content: """${sourceText}"""`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "A concise, actionable title for the task (max 12 words)." },
              why: { type: Type.STRING, description: "A short rationale explaining the impact or reason for this action (max 20 words)." },
              source_refs: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of source references, e.g., ['src1:#1-5', 'src1:#10-12']." },
              impactHint: { type: Type.NUMBER, description: "A score from 1.0 (low impact) to 1.5 (high impact) based on the 'why' rationale." }
            },
            required: ["title", "why", "source_refs", "impactHint"],
          },
        },
        systemInstruction: systemInstruction,
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

export async function getCoachResponse(item: ActionItem, userPrompt: string): Promise<AiCoachResponsePayload> {
    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userPrompt,
            config: {
                systemInstruction: `You are an AI coach providing guidance on the task: "${item.title}" (Why: ${item.why}). Original source context: ${item.source_refs.join(', ')}. Provide a structured JSON response. Preserve any source references like [srcId:#chunkRange] in your 'message' field.`,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        first_moves: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of the first 2-3 concrete actions the user should take." },
                        check_prereqs: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of prerequisites or things to check before starting." },
                        risks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of potential risks or blockers." },
                        done_when: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 'done-when' criteria to verify completion." },
                        message: { type: Type.STRING, description: "A conversational message summarizing the guidance and answering the user's prompt directly. Preserve any source references like [srcId:#chunkRange]." }
                    },
                    required: ["first_moves", "check_prereqs", "risks", "done_when", "message"]
                }
            }
        });
        
        const jsonText = result.text.trim();
        const parsed = JSON.parse(jsonText);
        // Basic validation
        if (parsed.message && Array.isArray(parsed.done_when)) {
            return parsed as AiCoachResponsePayload;
        }
        throw new Error("Parsed JSON does not match the required contract.");
    } catch (error) {
        console.error("Error getting coach response or parsing its result:", error);
        throw new Error("The AI coach returned an invalid or unexpected response.");
    }
}


// Placeholder for future "Do It For Me" feature
export async function getDIFMFeasibility(item: ActionItem): Promise<DIFMFeasibility> {
  console.log('DIFM feasibility check requested for item:', item.id);
  // This would be another Gemini call in a real implementation
  return Promise.resolve({
    confidence: 'partial',
    est_completion_pct: 60,
    remaining_steps: ['User review of generated content', 'Manual integration with target system'],
  });
}
