import { ItemType, NewItemInput } from '../types';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY;

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

// --- 1. SAFE DATE HELPER (Crucial for iPhone/Safari) ---
const getSafeYear = (dateString?: string): number => {
  if (!dateString) return new Date().getFullYear();
  const date = new Date(dateString);
  // If date is invalid (NaN), return current year to prevent crash
  if (isNaN(date.getTime())) return new Date().getFullYear();
  return date.getFullYear();
};

// --- 2. Helper: Get Ratings from OMDb ---
async function fetchRatings(imdbId: string): Promise<{ imdb: number, rt: string }> {
  if (!OMDB_API_KEY || !imdbId) return { imdb: 0, rt: 'N/A' };

  try {
    const res = await fetch(`https://www.omdbapi.com/?i=${imdbId}&apikey=${OMDB_API_KEY}`);
    const data = await res.json();

    if (data.Response === "True") {
      const imdb = parseFloat(data.imdbRating) || 0;
      const rtSource = data.Ratings?.find((r: any) => r.Source === "Rotten Tomatoes");
      return { imdb, rt: rtSource ? rtSource.Value : 'N/A' };
    }
  } catch (error) {
    console.error("OMDb Error:", error);
  }
  return { imdb: 0, rt: 'N/A' };
}

// --- 3. Main Service: Fetch everything from TMDB ---
export const fetchMediaDetails = async (input: NewItemInput) => {
  if (!TMDB_API_KEY) throw new Error("TMDB API Key is missing!");

  try {
    // A. SEARCH
    let searchEndpoint = 'search/multi';
    if (input.type === ItemType.Movie) searchEndpoint = 'search/movie';
    if (input.type === ItemType.Series || input.type === ItemType.Anime) searchEndpoint = 'search/tv';

    const searchUrl = `${TMDB_BASE_URL}/${searchEndpoint}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(input.name)}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    const bestMatch = searchData.results?.[0];
    if (!bestMatch) throw new Error("No results found.");

    // B. GET DETAILS (Requesting 'videos' for trailer)
    const mediaType = input.type === ItemType.Movie ? 'movie' : 'tv';
    const detailsUrl = `${TMDB_BASE_URL}/${mediaType}/${bestMatch.id}?api_key=${TMDB_API_KEY}&append_to_response=external_ids,watch/providers,videos`;
    
    const detailsRes = await fetch(detailsUrl);
    const details = await detailsRes.json();

    // --- C. EXTRACT TRAILER ---
    const videos = details.videos?.results || [];
    const trailer = videos.find((v: any) => v.type === "Trailer" && v.site === "YouTube") 
                 || videos.find((v: any) => v.type === "Teaser" && v.site === "YouTube");
    const trailerUrl = trailer ? `https://www.youtube.com/embed/${trailer.key}` : "";

    // --- D. EXTRACT DATA & FIX DATES ---
    // Use getSafeYear instead of raw new Date() to prevent iPhone crash
    const dateStr = details.release_date || details.first_air_date;
    const year = getSafeYear(dateStr);

    const imdbId = details.external_ids?.imdb_id;
    const ratings = await fetchRatings(imdbId);

    const providers = details['watch/providers']?.results?.['IN'] || details['watch/providers']?.results?.['US'];
    const flatProviders = providers?.flatrate || [];
    
    const streamingOptions = flatProviders.slice(0, 3).map((p: any) => ({
      platform: p.provider_name,
      url: getSmartLink(p.provider_name, details.title || details.name) 
    }));

    let runPeriod = String(year);
    if (input.type !== ItemType.Movie && details.status !== "Ended" && details.status !== "Canceled") {
      runPeriod = `${year}-Present`;
    } else if (input.type !== ItemType.Movie && details.last_air_date) {
      const endYear = getSafeYear(details.last_air_date);
      if (endYear !== year) runPeriod = `${year}-${endYear}`;
    }

    return {
      id: String(bestMatch.id),
      name: details.title || details.name,
      genre: details.genres?.[0]?.name || "Unknown",
      imdbRating: ratings.imdb,
      rottenTomatoes: ratings.rt,
      year: year,
      type: input.type,
      totalSeasons: details.number_of_seasons || null,
      description: details.overview || "No description available.",
      // Ensure strings, never undefined
      posterUrl: details.poster_path ? `${TMDB_IMAGE_BASE}${details.poster_path}` : "",
      runPeriod: runPeriod,
      streamingOptions: streamingOptions,
      trailerUrl: trailerUrl // <--- Return the new trailer URL
    };

  } catch (error) {
    console.error("Fetch Details Error:", error);
    throw error;
  }
};

// --- 4. Helper: Smart Links ---
function getSmartLink(platform: string, title: string): string {
  const p = platform.toLowerCase();
  const t = encodeURIComponent(title);
  if (p.includes('netflix')) return `https://www.netflix.com/search?q=${t}`;
  if (p.includes('prime') || p.includes('amazon')) return `https://www.amazon.com/s?k=${t}&i=instant-video`;
  if (p.includes('disney')) return `https://www.disneyplus.com/search?q=${t}`;
  if (p.includes('hulu')) return `https://www.hulu.com/search?q=${t}`;
  if (p.includes('hotstar')) return `https://www.hotstar.com/in/search?q=${t}`;
  if (p.includes('jiocinema')) return `https://www.jiocinema.com/search?q=${t}`;
  if (p.includes('sony')) return `https://www.sonyliv.com/search?q=${t}`;
  return `https://www.google.com/search?q=watch+${t}+on+${platform}`;
}