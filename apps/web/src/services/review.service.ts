import { apiClient } from "@/lib/api-client";

export interface Review {
  id: string;
  name: string;
  rating: number;
  content: string;
  isShown: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateReviewData {
  name: string;
  rating: number;
  content: string;
}

export const reviewService = {
  /** Submit a new review (public) */
  create(data: CreateReviewData) {
    return apiClient.post<Review>("/reviews", data);
  },

  /** Get shown reviews for landing page (public) */
  getShown() {
    return apiClient.get<Review[]>("/reviews/shown");
  },

  /** List all reviews, paginated (developer only) */
  findAll(page = 1, pageSize = 10) {
    const qs = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    return apiClient.get<PaginatedResponse<Review>>(`/reviews?${qs}`, { auth: true });
  },

  /** Toggle show/hide (developer only) */
  toggleShow(id: string) {
    return apiClient.post<Review>(`/reviews/${id}/toggle`, undefined, { auth: true });
  },

  /** Delete review (developer only) */
  remove(id: string) {
    return apiClient.delete<void>(`/reviews/${id}`, { auth: true });
  },
};
