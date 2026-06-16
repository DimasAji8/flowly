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

  /** List all reviews (developer only) */
  findAll() {
    return apiClient.get<Review[]>("/reviews", { auth: true });
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
