export enum ItemType {
  Movie = 'Movie',
  Series = 'Series',
  Anime = 'Anime'
}

export interface StreamingOption {
  platform: string;
  url: string;
}

// --- 1. NEW: Comment Structure ---
export interface Comment {
  id: string;         // Unique ID for the comment
  text: string;
  userId: string;     // user.email
  userName: string;   // user.displayName
  userPhoto?: string; 
  timestamp: number;
}

export interface BaseItem {
  id: string;
  name: string;
  genre: string;
  imdbRating: number;
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

  // --- 2. NEW: Interaction Fields ---
  likedBy?: string[];     // Array of emails who liked
  dislikedBy?: string[];  // Array of emails who disliked
  comments?: Comment[];   // Array of comment objects
}

export interface SeriesItem extends BaseItem {
  type: ItemType.Series;
  rottenTomatoes: string;
}

export interface MovieItem extends BaseItem {
  type: ItemType.Movie;
  rottenTomatoes: string;
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