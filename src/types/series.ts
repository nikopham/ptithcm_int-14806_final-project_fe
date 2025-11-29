export interface Season {
  id: string;
  seasonNumber: number;
  title: string;
  // episodes?: Episode[]; // Nếu backend trả về kèm episodes
}

export interface Episode {
  id: string;
  episodeNumber: number;
  title: string;
  durationMin: number;
  synopsis: string;
  airDate: string;
}

// Request Body
export interface SeasonCreateRequest {
  seasonNumber: number;
  title?: string;
}

export interface EpisodeCreateRequest {
  episodeNumber: number;
  title: string;
  durationMin?: number;
  synopsis?: string;
  airDate?: string;
}

export interface SeasonUpdateRequest {
  seasonNumber?: number;
  title?: string;
}

export interface EpisodeUpdateRequest {
  episodeNumber?: number;
  title?: string;
  durationMin?: number;
  synopsis?: string;
  airDate?: string;
}