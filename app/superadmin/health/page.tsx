"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Server, Database, Key, Mail, HardDrive, Globe, Activity, CheckCircle2, XCircle, AlertTriangle, Clock, Cpu, MemoryStick, RefreshCw, Archive, Loader2 } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { toast } from "sonner";
import { superadminAPI, HealthResponse } from "@/lib/api/superadmin";

const SERVICE_ICONS: Record<string, typeof Server> = {
  "API Gateway": Globe, "Primary Database": Database, "Auth Service": Key,
  "Email Service": Mail, "Storage Service": HardDrive, "CDN": Globe,
  "WebSocket": Activity, "Backup Service": Archive,
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "healthy": return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    case "degraded": return <AlertTriangle className="w-5 h-5 text-amber-500" />;
    case "down": return <XCircle className="w-5 h-5 text-red-500" />;
    default: return <Clock className="w-5 h-5 text-neutral-400" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "healthy": return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "degraded": return "bg-amber-100 text-amber-700 border-amber-200";
    case "down": return "bg-red-100 text-red-700 border-red-200";
    default: return "bg-black/5 text-neutral-700 border-black/10";
  }
};

export default function SystemHealth() {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = useCallback(async () => {
    try {
      setLoading(true);
      const res = await superadminAPI.health();
      setData(res.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to load system health");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHealth(); }, [fetchHealth]);

  const services = data?.services ?? [];
  const anyDown = services.some((s) => s.status === "down");
  const anyDegraded = services.some((s) => s.status === "degraded");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>System Health</h1>
        <p className="text-neutral-500 text-sm mt-0.5">Monitor platform infrastructure and services</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-neutral-400" /></div>
      ) : (
        <>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl border-2 ${anyDown ? "bg-red-50 border-red-200" : anyDegraded ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {anyDown ? <XCircle className="w-8 h-8 text-red-500" /> : anyDegraded ? <AlertTriangle className="w-8 h-8 text-amber-500" /> : <CheckCircle2 className="w-8 h-8 text-emerald-500" />}
                <div>
                  <h2 className="text-lg font-bold text-black">
                    {anyDown ? "System Outage Detected" : anyDegraded ? "Partial Degradation" : "All Systems Operational"}
                  </h2>
                  <p className="text-sm text-neutral-600">
                    {anyDown ? "One or more critical services are currently down" : anyDegraded ? "Some services are experiencing reduced performance" : "All platform services are running normally"}
                  </p>
                </div>
              </div>
              <button onClick={fetchHealth} className="flex items-center gap-2 px-4 py-2 bg-white border border-black/10 rounded-lg text-sm font-medium hover:bg-black/5 transition-colors">
                <RefreshCw className="w-4 h-4" /> Refresh Status
              </button>
            </div>
          </motion.div>

          <div className="grid grid-cols-4 gap-4">
            {services.map((service, i) => {
              const IconComp = SERVICE_ICONS[service.name] ?? Server;
              return (
                <motion.div key={service.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-black/5 rounded-lg flex items-center justify-center"><IconComp className="w-5 h-5 text-black" /></div>
                      <div><h3 className="font-bold text-black">{service.name}</h3><p className="text-xs text-neutral-500">Last checked: {service.last_checked}</p></div>
                    </div>
                    {getStatusIcon(service.status)}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-neutral-500">Uptime</span><span className="font-medium text-black">{service.uptime}%</span></div>
                    <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${service.uptime >= 99.9 ? "bg-emerald-500" : service.uptime >= 99 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${service.uptime}%` }} />
                    </div>
                    {service.latency > 0 && (
                      <div className="flex justify-between text-sm"><span className="text-neutral-500">Latency</span><span className="font-medium text-black">{service.latency}ms</span></div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm p-5">
              <h3 className="text-lg font-bold text-black mb-4" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>API Latency (ms)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data?.latency_data ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="#737373" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#737373" />
                  <Tooltip contentStyle={{ background: "rgba(255,255,255,0.9)", border: "1px solid #e5e5e5", borderRadius: "8px" }} />
                  <Line type="monotone" dataKey="api" stroke="#18181b" strokeWidth={2} dot={{ fill: "#18181b", r: 3 }} name="API" />
                  <Line type="monotone" dataKey="db" stroke="#22c55e" strokeWidth={2} dot={{ fill: "#22c55e", r: 3 }} name="Database" />
                  <Line type="monotone" dataKey="auth" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", r: 3 }} name="Auth" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm p-5">
              <h3 className="text-lg font-bold text-black mb-4" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>Error Rate (%)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data?.error_rate_data ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="#737373" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#737373" />
                  <Tooltip contentStyle={{ background: "rgba(255,255,255,0.9)", border: "1px solid #e5e5e5", borderRadius: "8px" }} />
                  <Line type="monotone" dataKey="errors" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444", r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm">
              <div className="p-5 border-b border-black/10"><h3 className="text-lg font-bold text-black" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>Recent Incidents</h3></div>
              <div className="p-4 space-y-3">
                {(data?.incidents ?? []).map((incident) => (
                  <div key={incident.id} className={`p-4 rounded-lg border ${incident.severity === "critical" ? "bg-red-50/50 border-red-200" : incident.severity === "warning" ? "bg-amber-50/50 border-amber-200" : "bg-black/5 border-black/10"}`}>
                    <div className="flex items-start justify-between">
                      <div><h4 className="font-medium text-black">{incident.title}</h4><p className="text-sm text-neutral-500 mt-0.5">{incident.time}</p></div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${incident.status === "ongoing" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>{incident.status}</span>
                    </div>
                    <p className="text-sm text-neutral-600 mt-2">Duration: <span className="font-medium">{incident.duration}</span></p>
                  </div>
                ))}
                {(!data?.incidents || data.incidents.length === 0) && <p className="text-sm text-neutral-400 text-center py-4">No recent incidents</p>}
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur rounded-xl border border-black/10 shadow-sm p-5">
              <h3 className="text-lg font-bold text-black mb-4" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>System Resources</h3>
              <div className="space-y-4">
                {(data?.resource_usage ?? []).map((resource) => (
                  <div key={resource.name}>
                    <div className="flex justify-between mb-1"><span className="text-sm font-medium text-black">{resource.name}</span><span className="text-sm text-neutral-500">{resource.value}%</span></div>
                    <div className="w-full h-3 bg-neutral-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${resource.value >= 80 ? "bg-red-500" : resource.value >= 60 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${resource.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              {data?.resource_usage && data.resource_usage.length > 0 && (
                <div className="mt-6 pt-4 border-t border-black/10 grid grid-cols-2 gap-4">
                  {data.resource_usage.slice(0, 2).map((r) => (
                    <div key={r.name} className="text-center p-3 bg-black/5 rounded-lg">
                      {r.name.includes("CPU") ? <Cpu className="w-5 h-5 mx-auto text-neutral-600 mb-1" /> : <MemoryStick className="w-5 h-5 mx-auto text-neutral-600 mb-1" />}
                      <p className="text-sm font-medium text-black">{r.value}%</p>
                      <p className="text-xs text-neutral-500">{r.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
