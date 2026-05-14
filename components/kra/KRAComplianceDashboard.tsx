"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle2, AlertCircle, Clock, Shield, 
  Building2, Calendar, TrendingUp, FileText 
} from "lucide-react";

interface DashboardData {
  role: string;
  total_properties: number;
  monthly_compliance_rate: number;
  quarterly_compliance_rate: number;
  properties: PropertyData[];
}

interface PropertyData {
  property_id: string;
  property_name: string;
  monthly_submissions: number;
  quarterly_submissions: number;
  latest_monthly: {
    period: string | null;
    submitted_at: string | null;
    status: string;
  };
  latest_quarterly: {
    period: string | null;
    submitted_at: string | null;
    status: string;
  };
}

interface UserInfo {
  role: string;
  property_id?: string;
  property_name?: string;
}

export default function KRAComplianceDashboard({ userInfo }: { userInfo: UserInfo }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/v1/kra/compliance/dashboard");
      if (!response.ok) {
        throw new Error("Failed to load compliance data");
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError("Unable to load compliance dashboard. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-64" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-2xl" />
            ))}
          </div>
          <div className="h-96 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 lg:p-8">
        <div className="bg-red-50 border border-red-200/60 rounded-xl p-6 flex items-center gap-4">
          <AlertCircle className="w-8 h-8 text-red-500 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">{error || "Unable to load dashboard"}</p>
            <button onClick={fetchDashboard} className="text-xs text-red-600 underline mt-1">
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isManager = userInfo.role === "Manager";
  const isAdmin = userInfo.role === "Tenant Admin" || userInfo.role === "Super Admin";

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 tracking-tight">KRA Compliance Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {isManager ? `Property: ${userInfo.property_name || "My Property"}` : "All Properties Overview"}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-950 text-white border border-slate-800 rounded-xl px-4 py-2.5">
          <Shield className="w-4 h-4" />
          <span className="text-sm font-semibold">
            {isManager ? "My Compliance" : "Overall Compliance"}
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-slate-500 font-medium">Properties</span>
          </div>
          <p className="text-3xl font-bold text-slate-950">{data.total_properties}</p>
          <p className="text-xs text-slate-500 mt-1">
            {isManager ? "Your property" : `${data.total_properties} total properties`}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-sm text-slate-500 font-medium">Monthly Compliance</span>
          </div>
          <p className="text-3xl font-bold text-emerald-600">{data.monthly_compliance_rate}%</p>
          <p className="text-xs text-slate-500 mt-1">
            {Math.round(data.monthly_compliance_rate * data.total_properties / 100)} of {data.total_properties} submitted
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="text-sm text-slate-500 font-medium">Quarterly Compliance</span>
          </div>
          <p className="text-3xl font-bold text-indigo-600">{data.quarterly_compliance_rate}%</p>
          <p className="text-xs text-slate-500 mt-1">
            {Math.round(data.quarterly_compliance_rate * data.total_properties / 100)} of {data.total_properties} submitted
          </p>
        </motion.div>
      </div>

      {/* Property Compliance Table */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-950">
            {isManager ? "Your Property KRA Status" : "Property Compliance Details"}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Monthly Submissions
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Monthly Status
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Quarterly Submissions
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Quarterly Status
                </th>
              </tr>
            </thead>
            <tbody>
              {data.properties.map((property, i) => (
                <motion.tr
                  key={property.property_id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-slate-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-900">{property.property_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-slate-600">{property.monthly_submissions}</span>
                  </td>
                  <td className="px-5 py-4">
                    {property.latest_monthly.status === "submitted" ? (
                      <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        {property.latest_monthly.period}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-medium">
                        <Clock className="w-3 h-3" />
                        Not submitted
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-slate-600">{property.quarterly_submissions}</span>
                  </td>
                  <td className="px-5 py-4">
                    {property.latest_quarterly.status === "submitted" ? (
                      <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        {property.latest_quarterly.period}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-medium">
                        <Clock className="w-3 h-3" />
                        Not submitted
                      </span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {data.properties.length === 0 && (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No properties found</p>
          </div>
        )}
      </div>
    </div>
  );
}