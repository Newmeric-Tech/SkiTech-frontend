import api from "@/lib/config/app";

export interface Property {
  id: string;
  tenant_id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  franchise_type: string | null;
  num_rooms: number | null;
  room_number_start: number | null;
  has_restaurant: boolean | null;
  is_active: boolean;
  created_at: string;
}

export interface OwnerDetails {
  id: string;
  tenant_id: string;
  property_id: string;
  owner_name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  ownership_type: string | null;
  created_at: string;
}

export interface PropertyCreate {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  franchise_type?: string;
  num_rooms?: number;
  room_number_start?: number;
  has_restaurant?: boolean;
}

export interface PropertyUpdate {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  franchise_type?: string;
  num_rooms?: number;
  room_number_start?: number;
  has_restaurant?: boolean;
  is_active?: boolean;
}

export interface OwnerDetailsCreate {
  owner_name: string;
  phone?: string;
  email?: string;
  address?: string;
  ownership_type?: string;
}

export interface OwnerDetailsUpdate {
  owner_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  ownership_type?: string;
}

export const propertiesAPI = {
  list: () => api.get<Property[]>("/v1/properties/"),
  get: (id: string) => api.get<Property>(`/v1/properties/${id}`),
  create: (data: PropertyCreate) => api.post<Property>("/v1/properties/", data),
  update: (id: string, data: PropertyUpdate) => api.put<Property>(`/v1/properties/${id}`, data),
  delete: (id: string) => api.delete(`/v1/properties/${id}`),
  getOwner: (propertyId: string) => api.get<OwnerDetails[]>(`/v1/properties/${propertyId}/owner`),
  createOwner: (propertyId: string, data: OwnerDetailsCreate) =>
    api.post<OwnerDetails>(`/v1/properties/${propertyId}/owner`, data),
  updateOwner: (propertyId: string, ownerId: string, data: OwnerDetailsUpdate) =>
    api.put<OwnerDetails>(`/v1/properties/${propertyId}/owner/${ownerId}`, data),
};
