
import { GoogleGenAI, Type } from "@google/genai";
import { DocumentKnowledge, ExtractedSection, ExtractedTable, ExtractedVisual } from "../types";

export class GeminiService {
  /**
   * Processes a PDF page image to extract structured knowledge.
   */
  async processPage(
    base64Image: string, 
    fileName: string, 
    pageNumber: number
  ): Promise<Partial<DocumentKnowledge>> {
    // Always initialize a new GoogleGenAI instance inside the method to use the latest process.env.API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `
      Analyze this PDF page from the document "${fileName}" (Page ${pageNumber}).
      
      Tasks:
      1. Identify the structural hierarchy (Sections/Subsections).
      2. Extract any tables accurately into a row/column format.
      3. Describe any images, charts, or diagrams in detail for searchability.
      4. Provide the main text content.
      
      Return the data in a clean structured format.
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            { inlineData: { mimeType: "image/jpeg", data: base64Image } },
            { text: prompt }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    level: { type: Type.NUMBER },
                    content: { type: Type.STRING }
                  },
                  required: ["title", "level", "content"]
                }
              },
              tables: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    caption: { type: Type.STRING },
                    headers: { type: Type.ARRAY, items: { type: Type.STRING } },
                    rows: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } }
                  }
                }
              },
              visuals: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    description: { type: Type.STRING }
                  }
                }
              },
              fullText: { type: Type.STRING }
            },
            required: ["sections", "fullText"]
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      
      return {
        sections: (data.sections || []).map((s: any, i: number) => ({
          ...s,
          id: `sec-${pageNumber}-${i}`
        })),
        tables: (data.tables || []).map((t: any, i: number) => ({
          ...t,
          id: `tab-${pageNumber}-${i}`
        })),
        visuals: (data.visuals || []).map((v: any, i: number) => ({
          ...v,
          id: `vis-${pageNumber}-${i}`
        })),
        fullText: data.fullText || ""
      };
    } catch (error) {
      console.error("Gemini Processing Error:", error);
      throw error;
    }
  }

  async semanticSearch(query: string, knowledgeBase: DocumentKnowledge[]): Promise<any[]> {
    // Always initialize a new GoogleGenAI instance inside the method to use the latest process.env.API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // In a real app, this would use embeddings. 
    // For this demo, we simulate a smart search over the structured data.
    const prompt = `
      Search Query: "${query}"
      
      I have a knowledge base of processed PDF data. 
      Identify which parts of which documents match this query best.
      Return matches as JSON.
    `;

    // Note: In a production app, we would use vector search. 
    // Here we use Gemini to 'rank' or 'find' relevant snippets from the structured text.
    
    // Simulating knowledge context for the prompt (usually would be top-k vector results)
    const contextSnippet = knowledgeBase.map(doc => ({
      id: doc.id,
      fileName: doc.fileName,
      contentSample: doc.fullText.substring(0, 500)
    }));

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Given this user query: "${query}", find relevant info in these documents: ${JSON.stringify(contextSnippet)}. Return top matches with snippets.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                docId: { type: Type.STRING },
                snippet: { type: Type.STRING },
                reason: { type: Type.STRING },
                relevance: { type: Type.NUMBER }
              }
            }
          }
        }
      });
      return JSON.parse(response.text || '[]');
    } catch (error) {
      console.error("Search Error:", error);
      return [];
    }
  }
}
