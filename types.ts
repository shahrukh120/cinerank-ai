export enum ItemType {
  Movie = 'Movie',
  Series = 'Series',
  Anime = 'Anime'
}

export interface StreamingOption {
  platform: string;
  url: string;
}

export interface Comment {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userPhoto?: string; 
  timestamp: number;
}

// --- NEW: Ratings Map Interface ---
// Key = User Email (e.g. "srk@gmail.com")
// Value = Rating (1-5)
export type RatingsMap = Record<string, number>; 

export interface BaseItem {
  id: string;
  name: string;
  genre: string;
  year: number;
  type: ItemType;
  description?: string;
  posterUrl?: string;
  runPeriod?: string; 
  streamingOptions?: StreamingOption[];
  trailerUrl?: string; 

  createdAt?: number;     
  addedBy?: string;       
  addedByEmail?: string;  
  addedByPhoto?: string;  

  // --- INTERACTION FIELDS ---
  likedBy?: string[];     
  dislikedBy?: string[];  
  comments?: Comment[];   
  
  // --- NEW: STAR RATINGS ---
  starRatings?: RatingsMap; 
  
  // Optional: We can still keep this for caching if needed
  score?: number; 
}

export interface SeriesItem extends BaseItem {
  type: ItemType.Series;
}

export interface MovieItem extends BaseItem {
  type: ItemType.Movie;
}

export interface AnimeItem extends BaseItem {
  type: ItemType.Anime;
  totalSeasons: number;
}

export type MediaItem = SeriesItem | MovieItem | AnimeItem;

export interface NewItemInput {
  name: string;
  type: ItemType;
}