export interface DashboardOverviewResponse {
  totalUsers: number;
  totalMovies: number;
  totalComments: number;
  totalViews: number;
}

export interface GenreStatResponse {
  id: number;
  name: string;
  movieCount: number;
}

