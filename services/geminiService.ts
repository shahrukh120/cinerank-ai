import { GoogleGenAI } from "@google/genai";
import { ItemType, NewItemInput } from '../types';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

// Helper to get image from TMDB
async function fetchPosterFromTMDB(name: string, type: ItemType, year?: number): Promise<string | undefined> {
  if (!TMDB_API_KEY) {
    console.warn("TMDB API Key missing");
    return undefined;
  }

  try {
    // Determine strict search type for better accuracy
    let endpoint = 'search/multi'; // Default fallback
    if (type === ItemType.Movie) endpoint = 'search/movie';
    if (type === ItemType.Series) endpoint = 'search/tv';
    
    // For Anime, we use 'multi' because it could be a movie or a show
    // We add specific params to refine the search
    const url = new URL(`${TMDB_BASE_URL}/${endpoint}`);
    url.searchParams.append('api_key', TMDB_API_KEY);
    url.searchParams.append('query', name);
    if (year) url.searchParams.append('year', year.toString()); // For movies
    if (year && type !== ItemType.Movie) url.searchParams.append('first_air_date_year', year.toString()); // For shows

    const res = await fetch(url.toString());
    const data = await res.json();

    if (data.results && data.results.length > 0) {
      // Return the first result's poster path
      const path = data.results[0].poster_path;
      return path ? `${TMDB_IMAGE_BASE}${path}` : undefined;
    }
  } catch (error) {
    console.error("Error fetching from TMDB:", error);
  }
  return undefined;
}

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

  // We REMOVED the request for posterUrl from Gemini to avoid hallucinations
  const prompt = `
    Search for the ${input.type} named "${input.name}" on IMDb. 
    
    I need you to find the following details:
    1. Primary Genre (string) - e.g. "Action", "Thriller", "Sci-Fi", "Drama". Pick the most relevant single or dual genre.
    2. IMDb rating (number)
    3. Year of Release (number)
    4. ${input.type === ItemType.Anime ? 'Total Number of Seasons' : 'Rotten Tomatoes score (percentage string)'}
    5. A short, exciting description (one sentence).
    6. The Run Period (string). For series/anime, format as "StartYear-EndYear" (e.g. "2020-2024" or "2022-Present"). For movies, just the year (e.g. "2023").
    7. Where to watch: List up to 3 major streaming platforms (Netflix, Prime Video, Disney+, Hulu, Crunchyroll, etc.) where this title is available, along with a direct link if possible. If a direct link isn't found, use the homepage of the platform.

    Return the result strictly as a valid JSON object with the following keys:
    {
      "genre": "string",
      "imdbRating": number,
      "year": number,
      "rottenTomatoes": "string" (or "N/A"),
      "totalSeasons": number (or null),
      "description": "string",
      "runPeriod": "string",
      "streamingOptions": [
        { "platform": "string", "url": "string" }
      ]
    }
    
    Do not wrap the JSON in markdown code blocks. Just return the raw JSON string.
  `;

  try {
    // 1. Fetch text data from Gemini
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] },
    });

    if (!response || !response.text) throw new Error("No response from Gemini");
    const cleanText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let data;
    try {
        data = JSON.parse(cleanText);
    } catch (e) {
        throw new Error("Invalid JSON from AI");
    }

    // 2. Fetch reliable image from TMDB (running in parallel would be faster, but sequential is safer for now)
    // We use the year from Gemini to make the TMDB search accurate
    const tmdbPoster = await fetchPosterFromTMDB(input.name, input.type, data.year);

    // 3. Combine and return
    return {
      genre: data.genre || "Unknown",
      imdbRating: Number(data.imdbRating) || 0,
      year: Number(data.year) || new Date().getFullYear(),
      rottenTomatoes: data.rottenTomatoes,
      totalSeasons: data.totalSeasons,
      description: data.description || `A ${input.type} named ${input.name}.`,
      posterUrl: tmdbPoster, // <--- Using the real image here
      runPeriod: data.runPeriod || String(data.year),
      streamingOptions: data.streamingOptions || []
    };

  } catch (error) {
    console.error("Error fetching details:", error);
    throw error;
  }
};