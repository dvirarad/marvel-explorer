export interface TmdbMovieResponse {
  id: number;
  title: string;
  release_date: string;
  overview: string;
  poster_path: string;
}

export interface TmdbCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface TmdbMovieCreditsResponse {
  id: number;
  cast: TmdbCastMember[];
  crew: any[];
}

export interface TmdbPersonResponse {
  id: number;
  name: string;
  profile_path: string | null;
}

export interface TmdbPersonMovieCreditsResponse {
  cast: {
    id: number;
    title: string;
    character: string;
  }[];
  crew: any[];
}

export interface TmdbSearchPersonResponse {
  page: number;
  results: TmdbPersonResponse[];
  total_pages: number;
  total_results: number;
}
