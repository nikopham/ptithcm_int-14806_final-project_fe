export interface MeiliResult {
  id: string;
  _formatted?: any;
}

export interface MeiliMovie extends MeiliResult {
  title: string;
  originalTitle: string;
  slug: string;
  poster: string; // Lưu ý: Backend map là 'poster', không phải 'posterUrl'
  releaseYear: number;
  rating: number;
}

export interface MeiliPerson extends MeiliResult {
  fullName: string;
  job: string;
  profilePath: string;
}

export interface FastSearchResponse {
  movies: MeiliMovie[];
  people: MeiliPerson[];
}
