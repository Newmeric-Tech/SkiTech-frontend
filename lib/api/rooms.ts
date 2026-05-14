import api from "@/lib/config/app";

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

  // Bookings
  listBookings: (propertyId: string, status?: string) =>
    api.get(`/v1/rooms/${propertyId}/bookings`, { params: { status } }),
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