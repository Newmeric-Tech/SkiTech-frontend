import api from "@/lib/config/app";

export const workforceAPI = {
  // Employees
  listEmployees: (propertyId: string, departmentId?: string) =>
    api.get(`/v1/employees/${propertyId}`, {
      params: { department_id: departmentId },
    }),
  getEmployee: (employeeId: string) =>
    api.get(`/v1/employees/detail/${employeeId}`),
  createEmployee: (propertyId: string, data: any) =>
    api.post(`/v1/employees/${propertyId}`, data),
  updateEmployee: (employeeId: string, data: any) =>
    api.put(`/v1/employees/${employeeId}`, data),
  deleteEmployee: (employeeId: string) =>
    api.delete(`/v1/employees/${employeeId}`),

  // Departments
  listDepartments: (propertyId: string) =>
    api.get(`/v1/departments/${propertyId}`),
  createDepartment: (propertyId: string, data: any) =>
    api.post(`/v1/departments/${propertyId}`, data),
  updateDepartment: (departmentId: string, data: any) =>
    api.put(`/v1/departments/${departmentId}`, data),
  deleteDepartment: (departmentId: string) =>
    api.delete(`/v1/departments/${departmentId}`),

  // Vendors
  listVendors: (propertyId: string) =>
    api.get(`/v1/vendors/${propertyId}`),
  createVendor: (propertyId: string, data: any) =>
    api.post(`/v1/vendors/${propertyId}`, data),
  updateVendor: (vendorId: string, data: any) =>
    api.put(`/v1/vendors/${vendorId}`, data),
  deleteVendor: (vendorId: string) =>
    api.delete(`/v1/vendors/${vendorId}`),
};