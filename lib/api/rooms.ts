import api from "@/lib/config/app";

// GET /rooms/{property_id}/live-summary
export interface LiveBooking {
  booking_id: string;
  status: "booked" | "checked_in" | string;
  guest_name: string | null;
  booking_source: string | null;
  check_in: string;
  check_out: string;
  stay_progress_pct: number;
  /** Checked in and past check_out (late check-out); progress is then 100. */
  overstay?: boolean;
  special_requests: string | null;
  total_amount: number | null;
  currency: string | null;
}

export interface LiveSummary {
  generated_at: string;
  active_bookings: number;
  rooms: { room_id: string; current_booking: LiveBooking | null }[];
  source_counts: { source: string | null; count: number }[];
}

export const roomsAPI = {
  list: (propertyId: string, status?: string) =>
    api.get(`/v1/rooms/${propertyId}`, { params: { status } }),
  get: (roomId: string) => api.get(`/v1/rooms/detail/${roomId}`),
  create: (propertyId: string, data: any) =>
    api.post(`/v1/rooms/${propertyId}`, data),
  update: (roomId: string, data: any) =>
    api.put(`/v1/rooms/${roomId}`, data),
  delete: (roomId: string) => api.delete(`/v1/rooms/${roomId}`),
  regenerate: (propertyId: string) =>
    api.post(`/v1/rooms/${propertyId}/regenerate`),

  bulkUpdateStatus: (propertyId: string, roomIds: string[], roomStatus: string) =>
    api.post(`/v1/rooms/${propertyId}/bulk-status`, { room_ids: roomIds, status: roomStatus }),

  liveSummary: (propertyId: string) =>
    api.get<LiveSummary>(`/v1/rooms/${propertyId}/live-summary`),

  // Bookings
  listBookings: (propertyId: string, status?: string, activeOnly?: boolean) =>
    api.get(`/v1/rooms/${propertyId}/bookings`, { params: { status, active_only: activeOnly || undefined } }),
  createBooking: (propertyId: string, data: any) =>
    api.post(`/v1/rooms/${propertyId}/bookings`, data),
  getBooking: (bookingId: string) =>
    api.get(`/v1/rooms/bookings/detail/${bookingId}`),
  updateBooking: (bookingId: string, data: any) =>
    api.put(`/v1/rooms/bookings/${bookingId}`, data),
  checkin: (bookingId: string) =>
    api.put(`/v1/rooms/bookings/${bookingId}/checkin`),
  checkout: (bookingId: string) =>
    api.put(`/v1/rooms/bookings/${bookingId}/checkout`),
  cancel: (bookingId: string) =>
    api.put(`/v1/rooms/bookings/${bookingId}/cancel`),
};
