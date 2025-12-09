
export enum ItemType {
  Movie = 'Movie',
  Series = 'Series',
  Anime = 'Anime'
}

export interface StreamingOption {
  platform: string;
  url: string;
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
  runPeriod?: string; // e.g., "2020-2024" or "2023"
  streamingOptions?: StreamingOption[];
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
