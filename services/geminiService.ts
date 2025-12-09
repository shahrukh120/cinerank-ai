import { GoogleGenAI } from "@google/genai";
import { ItemType, NewItemInput } from '../types';

// FIX 1: Use the correct class name (GoogleGenAI) and correct initialization format
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export const fetchMediaDetails = async (input: NewItemInput): Promise<{
  genre: string;
  imdbRating: number;
  year: number;
  rottenTomatoes?: string;
  totalSeasons?: number;
  description: string;
  posterUrl?: string;
  runPeriod?: string;
  streamingOptions?: { platform: string; url: string }[];
}> => {
  const modelId = 'gemini-2.5-flash';

  const prompt = `
    Search for the ${input.type} named "${input.name}" on IMDb. 
    
    I need you to find the following details:
    1. Primary Genre (string) - e.g. "Action", "Thriller", "Sci-Fi", "Drama". Pick the most relevant single or dual genre.
    2. IMDb rating (number)
    3. Year of Release (number)
    4. ${input.type === ItemType.Anime ? 'Total Number of Seasons' : 'Rotten Tomatoes score (percentage string)'}
    5. A short, exciting description (one sentence).
    6. The direct URL of the official poster image from IMDb (Internet Movie Database). The URL usually starts with "https://m.media-amazon.com/images" and ends with ".jpg". Do not provide the IMDb page URL (like /title/tt...), provide the actual image source URL.
    7. The Run Period (string). For series/anime, format as "StartYear-EndYear" (e.g. "2020-2024" or "2022-Present"). For movies, just the year (e.g. "2023").
    8. Where to watch: List up to 3 major streaming platforms (Netflix, Prime Video, Disney+, Hulu, Crunchyroll, etc.) where this title is available, along with a direct link if possible. If a direct link isn't found, use the homepage of the platform.

    Return the result strictly as a valid JSON object with the following keys:
    {
      "genre": "string",
      "imdbRating": number,
      "year": number,
      "rottenTomatoes": "string" (or "N/A"),
      "totalSeasons": number (or null),
      "description": "string",
      "posterUrl": "string" (or null if not found),
      "runPeriod": "string",
      "streamingOptions": [
        { "platform": "string", "url": "string" }
      ]
    }
    
    Do not wrap the JSON in markdown code blocks. Just return the raw JSON string.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], // This syntax is correct for @google/genai
      },
    });

    // FIX 2: Check for null response before accessing text
    if (!response || !response.text) throw new Error("No response from Gemini");
    
    const text = response.text;

    // Clean up potential markdown formatting
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    let data;
    try {
        data = JSON.parse(cleanText);
    } catch (e) {
        console.error("Failed to parse JSON from Gemini response:", text);
        throw new Error("Invalid data format received from AI.");
    }

    return {
      genre: data.genre || "Unknown",
      imdbRating: Number(data.imdbRating) || 0,
      year: Number(data.year) || new Date().getFullYear(),
      rottenTomatoes: data.rottenTomatoes,
      totalSeasons: data.totalSeasons,
      description: data.description || `A ${input.type} named ${input.name}.`,
      posterUrl: data.posterUrl || undefined,
      runPeriod: data.runPeriod || String(data.year),
      streamingOptions: data.streamingOptions || []
    };

  } catch (error) {
    console.error("Error fetching details from Gemini:", error);
    throw error;
  }
};