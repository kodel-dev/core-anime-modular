export interface Anime {
  mal_id: number;
  title: string;
  synopsis: string;
  images: {
    jpg: { large_image_url: string };
  };
  score: number | null;
  type: string;
  episodes: number | null;
  status: string;
  duration: string;
  rating: string;
  genres: { name: string }[];
  studios: { name: string }[];
  year: number | null;
}

export interface JikanResponse {
  data: Anime[];
}