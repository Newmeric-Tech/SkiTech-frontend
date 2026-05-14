import api from "@/lib/config/app";

// ── helpers ────────────────────────────────────────────────

function getISOWeek(dateStr: string): { week: number; year: number } {
  const date = new Date(dateStr);
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return {
    week: Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7),
    year: d.getUTCFullYear(),
  };
}

// ── Daily KRA ──────────────────────────────────────────────

export interface DailyKRAFormData {
  date: string;
  shift: string;
  guestCheckIns: string;
  guestCheckOuts: string;
  complaints: string;
  complaintsResolved: string;
  roomChecks: string;
  maintenanceTasks: string;
  cashDeposits: string;
  googleReviews: string;
}

export interface DailyKRAResponse {
  id: number;
  tenant_id: number;
  user_id: number;
  date: string;
  shift_changeover_status: boolean;
  guest_checkin_count: number;
  guest_checkout_count: number;
  complaints_logged: number;
  room_availability_checked: boolean;
  maintenance_tasks: number;
  cash_deposit_amount: number;
  google_reviews_count: number;
  notes: string | null;
  is_submitted: boolean;
  created_at: string;
  updated_at: string;
}

export interface DailyKRAListItem {
  id: number;
  tenant_id: number;
  user_id: number;
  date: string;
  is_submitted: boolean;
  guest_checkin_count: number;
  guest_checkout_count: number;
  complaints_logged: number;
  created_at: string;
}

// ── Weekly KRA ─────────────────────────────────────────────

export interface WeeklyKRAFormData {
  weekStartDate: string;
  weekEndDate: string;
  otaGoogle: boolean;
  otaBooking: boolean;
  otaMakemytrip: boolean;
  otaAirbnb: boolean;
  otaExpedia: boolean;
  otaTripadvisor: boolean;
  supplyOK: string;
  supplyLow: string;
  supplyOut: string;
  overallNotes: string;
}

export interface WeeklyKRAResponse {
  id: number;
  tenant_id: number;
  user_id: number;
  week_starting_date: string;
  year: number;
  week_number: number;
  ota_images_uploaded: boolean;
  ota_platforms: string | null;
  supply_stock_reviewed: boolean;
  supply_notes: string | null;
  notes: string | null;
  is_submitted: boolean;
  created_at: string;
  updated_at: string;
}

// ── Monthly KRA ────────────────────────────────────────────

export interface MonthlyKRAFormData {
  month: string;
  year: string;
  revenueAmount: string;
  revenueFile: File | null;
  revenueFilePreview: string | null;
  guestCount: string;
  occupancyRate: string;
}

export interface MonthlyKRAResponse {
  id: number;
  tenant_id: number;
  user_id: number;
  month: number;
  year: number;
  revenue_amount: number | null;
  guest_count: number | null;
  occupancy_rate: number | null;
  revenue_report_url: string | null;
  notes: string | null;
  is_submitted: boolean;
  created_at: string;
  updated_at: string;
}

// ── Quarterly KRA ──────────────────────────────────────────

export interface QuarterlyKRAFormData {
  quarter: string;
  year: string;
  revenueAmount: string;
  revenueFile: File | null;
  revenueFilePreview: string | null;
  guestCount: string;
  occupancyRate: string;
}

export interface QuarterlyKRAResponse {
  id: number;
  tenant_id: number;
  user_id: number;
  quarter: number;
  year: number;
  revenue_amount: number | null;
  guest_count: number | null;
  occupancy_rate: number | null;
  revenue_report_url: string | null;
  notes: string | null;
  is_submitted: boolean;
  created_at: string;
  updated_at: string;
}

export interface KRAComplianceResponse {
  tenant_id: number;
  employee_id: number | null;
  property_id: number | null;
  start_date: string;
  end_date: string;
  total_days: number;
  expected_submissions: number;
  actual_submissions: number;
  compliance_percentage: number;
}

export interface PaginatedKRAResponse<T> {
  total: number;
  skip: number;
  limit: number;
  items: T[];
}

// ── API Functions ──────────────────────────────────────────

export const kraAPI = {
  // ── Daily ────────────────────────────────────────────────

  submitDaily: async (form: DailyKRAFormData): Promise<DailyKRAResponse> => {
    const notes = [
      form.shift ? `Shift: ${form.shift}` : null,
      form.complaintsResolved ? `Complaints resolved: ${form.complaintsResolved}` : null,
    ]
      .filter(Boolean)
      .join(". ") || undefined;

    const payload = {
      date: form.date,
      shift_changeover_status: form.shift !== "",
      guest_checkin_count: parseInt(form.guestCheckIns) || 0,
      guest_checkout_count: parseInt(form.guestCheckOuts) || 0,
      complaints_logged: parseInt(form.complaints) || 0,
      room_availability_checked: parseInt(form.roomChecks) > 0,
      maintenance_tasks: parseInt(form.maintenanceTasks) || 0,
      cash_deposit_amount: parseFloat(form.cashDeposits) || 0,
      google_reviews_count: parseInt(form.googleReviews) || 0,
      notes: notes ?? null,
    };

    const { data } = await api.post<DailyKRAResponse>("/v1/kra/daily", payload);
    return data;
  },

  listDaily: async (params?: {
    skip?: number;
    limit?: number;
    user_id?: number;
  }): Promise<PaginatedKRAResponse<DailyKRAListItem>> => {
    const { data } = await api.get<PaginatedKRAResponse<DailyKRAListItem>>("/v1/kra/daily", { params });
    return data;
  },

  getDaily: async (id: number): Promise<DailyKRAResponse> => {
    const { data } = await api.get<DailyKRAResponse>(`/v1/kra/daily/${id}`);
    return data;
  },

  // ── Weekly ───────────────────────────────────────────────

  submitWeekly: async (form: WeeklyKRAFormData): Promise<WeeklyKRAResponse> => {
    const { week, year } = getISOWeek(form.weekStartDate);

    const selectedPlatforms = [
      form.otaGoogle && "Google",
      form.otaBooking && "Booking",
      form.otaMakemytrip && "MakeMyTrip",
      form.otaAirbnb && "Airbnb",
      form.otaExpedia && "Expedia",
      form.otaTripadvisor && "TripAdvisor",
    ].filter(Boolean) as string[];

    const supplyParts = [
      form.supplyOK ? `OK:${form.supplyOK}` : null,
      form.supplyLow ? `Low:${form.supplyLow}` : null,
      form.supplyOut ? `Out:${form.supplyOut}` : null,
    ].filter(Boolean);

    const payload = {
      week_starting_date: form.weekStartDate,
      year,
      week_number: week,
      ota_images_uploaded: selectedPlatforms.length > 0,
      ota_platforms: selectedPlatforms.length > 0 ? selectedPlatforms.join(",") : null,
      supply_stock_reviewed: supplyParts.length > 0,
      supply_notes: supplyParts.length > 0 ? supplyParts.join(", ") : null,
      notes: form.overallNotes || null,
    };

    const { data } = await api.post<WeeklyKRAResponse>("/v1/kra/weekly", payload);
    return data;
  },

  listWeekly: async (params?: {
    skip?: number;
    limit?: number;
    user_id?: number;
  }): Promise<PaginatedKRAResponse<WeeklyKRAResponse>> => {
    const { data } = await api.get<PaginatedKRAResponse<WeeklyKRAResponse>>("/v1/kra/weekly", { params });
    return data;
  },

  // ── Monthly ──────────────────────────────────────────────

  submitMonthly: async (
    form: MonthlyKRAFormData,
    revenueReportUrl?: string,
  ): Promise<MonthlyKRAResponse> => {
    const payload = {
      month: parseInt(form.month),
      year: parseInt(form.year),
      revenue_amount: form.revenueAmount ? parseFloat(form.revenueAmount) : null,
      guest_count: form.guestCount ? parseInt(form.guestCount) : null,
      occupancy_rate: form.occupancyRate ? parseFloat(form.occupancyRate) : null,
      revenue_report_url: revenueReportUrl ?? null,
      notes: null,
    };

    const { data } = await api.post<MonthlyKRAResponse>("/v1/kra/monthly", payload);
    return data;
  },

  listMonthly: async (params?: {
    skip?: number;
    limit?: number;
    user_id?: number;
  }): Promise<PaginatedKRAResponse<MonthlyKRAResponse>> => {
    const { data } = await api.get<PaginatedKRAResponse<MonthlyKRAResponse>>("/v1/kra/monthly", { params });
    return data;
  },

  // ── Quarterly ────────────────────────────────────────────

  submitQuarterly: async (
    form: QuarterlyKRAFormData,
    revenueReportUrl?: string,
  ): Promise<QuarterlyKRAResponse> => {
    const payload = {
      quarter: parseInt(form.quarter),
      year: parseInt(form.year),
      revenue_amount: form.revenueAmount ? parseFloat(form.revenueAmount) : null,
      guest_count: form.guestCount ? parseInt(form.guestCount) : null,
      occupancy_rate: form.occupancyRate ? parseFloat(form.occupancyRate) : null,
      revenue_report_url: revenueReportUrl ?? null,
      notes: null,
    };

    const { data } = await api.post<QuarterlyKRAResponse>("/v1/kra/quarterly", payload);
    return data;
  },

  listQuarterly: async (params?: {
    skip?: number;
    limit?: number;
    user_id?: number;
  }): Promise<PaginatedKRAResponse<QuarterlyKRAResponse>> => {
    const { data } = await api.get<PaginatedKRAResponse<QuarterlyKRAResponse>>("/v1/kra/quarterly", { params });
    return data;
  },

  // ── Compliance ───────────────────────────────────────────

  getCompliance: async (params: {
    start_date: string;
    end_date: string;
    employee_id?: number;
    property_id?: number;
  }): Promise<KRAComplianceResponse> => {
    const { data } = await api.get<KRAComplianceResponse>("/v1/kra/compliance", { params });
    return data;
  },

  // ── S3 Upload helper ─────────────────────────────────────

  getUploadUrl: async (
    filename: string,
    fileType: string,
  ): Promise<{ upload_url: string; file_key: string }> => {
    const { data } = await api.post<{ upload_url: string; file_key: string }>(
      "/v1/sop/upload/presigned-url",
      null,
      { params: { filename, file_type: fileType } },
    );
    return data;
  },

  uploadFileToS3: async (uploadUrl: string, file: File): Promise<void> => {
    await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });
  },
};
