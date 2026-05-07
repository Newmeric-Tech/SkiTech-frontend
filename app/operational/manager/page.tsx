"use client";

import { motion } from "framer-motion";
import { 
  AlertTriangle, Snowflake, Lock, Activity, ChevronRight, Search, Bell,
  FileText, Zap, Clock
} from "lucide-react";

export default function ManagerDashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header */}
      <header className="bg-white px-6 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search logs, tickets, or guest rooms..."
              className="bg-slate-50 border border-slate-200 rounded-full pl-9 pr-4 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-slate-300 w-80 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900 leading-tight">Julian Dang</p>
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Operations Manager</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-200 overflow-hidden">
              <img src="https://i.pravatar.cc/150?u=juliandang" alt="Julian Dang" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-8 space-y-6">
        
        {/* Warning Banner */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-100 rounded-xl p-3 px-5 flex flex-wrap items-center justify-between gap-4"
        >
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-semibold">3 High Priority Issues pending &gt; 1 hour</span>
          </div>
          <button className="text-sm font-semibold text-red-600 hover:text-red-700">
            View Escalations &gt;
          </button>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left Column (2/3) */}
          <div className="flex-1 space-y-6 lg:w-2/3">
            
            {/* Urgent Attention Preview */}
            <section>
              <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-sm font-bold text-slate-900">Urgent Attention Preview</h2>
                <span className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">3 Critical</span>
              </div>
              <div className="space-y-3">
                
                {/* Urgent Card 1 */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                    <Snowflake className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-900 text-sm">HVAC Failure - Penthouse</h3>
                      <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded uppercase">Critical</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <Clock className="w-3 h-3" /> 40m ago • Room 4001
                    </div>
                  </div>
                </div>

                {/* Urgent Card 2 */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-900 text-sm">SLA Breach: Room 102</h3>
                      <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded uppercase">High</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <Clock className="w-3 h-3" /> 1h 12m ago • Maintenance Delay
                    </div>
                  </div>
                </div>

                {/* Urgent Card 3 */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-900 text-sm">Safety Alert: Unlocked Fire Exit</h3>
                      <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded uppercase">Safety</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <Clock className="w-3 h-3" /> 5m ago • North Wing
                    </div>
                  </div>
                </div>
                
              </div>
            </section>

            {/* Items Requiring Manager Action */}
            <section>
              <div className="flex items-center justify-between mb-4 px-1 mt-8">
                <h2 className="text-sm font-bold text-slate-900">Items Requiring Manager Action</h2>
                <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-red-600">Critical: 2</span>
                  <span className="text-orange-600">High: 5</span>
                  <span className="text-yellow-600">Med: 12</span>
                </div>
              </div>
              
              <div className="space-y-4">
                
                {/* Action Card 1 */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 pl-4 shadow-sm relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                  <div className="pl-2">
                    <h3 className="font-bold text-slate-900 text-sm mb-1">Equipment Replacement Approval: Gym Treadmill #4</h3>
                    <p className="text-xs text-slate-500 mb-3 font-medium">Requested by Maintenance Dept • Est. Cost: $4,200</p>
                    <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-slate-900">UNASSIGNED</span>
                      <span className="text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> Waiting 4h</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pl-2 sm:pl-0">
                    <button className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">Reject</button>
                    <button className="px-4 py-2 text-xs font-bold text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors bg-white shadow-sm">Assign Staff</button>
                    <button className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm">Approve</button>
                  </div>
                </div>

                {/* Action Card 2 */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 pl-4 shadow-sm relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500"></div>
                  <div className="pl-2">
                    <h3 className="font-bold text-slate-900 text-sm mb-1">Guest Dispute: Incorrect Room Service Billing</h3>
                    <p className="text-xs text-slate-500 mb-3 font-medium">Folio #29384 • Guest: Mrs. Vanderbilt (Platinum Tier)</p>
                    <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-slate-900">Assigned to: Julian Dang</span>
                      <span className="text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> Waiting 1h 22m</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pl-2 sm:pl-0">
                    <button className="px-6 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm">Resolve</button>
                  </div>
                </div>
                
              </div>
            </section>

            {/* Bottom Widgets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              <div className="bg-slate-900 rounded-xl p-5 text-white flex flex-col justify-end min-h-[160px] relative overflow-hidden shadow-md">
                {/* Abstract pattern */}
                <div className="absolute top-4 left-4 right-4 h-1/2 opacity-20 pointer-events-none">
                   <div className="w-full h-2 bg-white/20 rounded mb-2"></div>
                   <div className="w-3/4 h-2 bg-white/20 rounded mb-2"></div>
                   <div className="w-1/2 h-2 bg-white/20 rounded"></div>
                </div>
                <h3 className="font-bold text-sm mb-1 relative z-10">Resource Distribution</h3>
                <p className="text-xs text-slate-400 relative z-10">Peak operational efficiency in North Wing</p>
              </div>
              
              <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-end min-h-[160px] relative overflow-hidden shadow-sm">
                {/* Abstract pattern */}
                <div className="absolute top-4 left-4 right-4 h-1/2 opacity-40 pointer-events-none">
                   <div className="w-full h-2 bg-slate-200 rounded mb-2"></div>
                   <div className="w-1/2 h-2 bg-slate-200 rounded mb-2"></div>
                   <div className="w-5/6 h-2 bg-slate-200 rounded"></div>
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1 relative z-10">Operational Health</h3>
                <p className="text-xs text-slate-500 relative z-10">94% resolution rate this cycle</p>
              </div>
            </div>

          </div>

          {/* Right Column (1/3) */}
          <div className="lg:w-1/3 space-y-6">
            
            {/* Performance Metrics */}
            <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-auto">
              <div className="p-5 flex items-center gap-2 border-b border-slate-100">
                <FileText className="w-4 h-4 text-slate-500" />
                <h2 className="text-sm font-bold text-slate-900">Performance Metrics</h2>
              </div>
              <div className="p-6 pb-8">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Oldest Unresolved Issue</p>
                <div className="flex items-end gap-1 mb-8">
                  <span className="text-4xl font-bold text-red-600 tracking-tight">03:42:12</span>
                  <span className="text-sm font-semibold text-red-600 mb-1">hrs</span>
                </div>

                <div className="bg-red-50 rounded-lg p-4 mb-8">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-xs font-bold text-red-600">SLA Breach Warning</h4>
                    <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Urgent</span>
                  </div>
                  <p className="text-xs text-red-500 leading-relaxed font-medium">8 tickets currently exceeding resolution threshold.</p>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Avg Delay</p>
                    <p className="text-lg font-bold text-slate-900">18.4m</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Trend</p>
                    <p className="text-lg font-bold text-red-500 flex items-center justify-end gap-1">
                      <TrendingUpIcon /> +4%
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Live Activity Feed */}
            <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-auto">
              <div className="p-5 flex items-center justify-between border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900">Live Activity Feed</h2>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              </div>
              <div className="p-5 space-y-6">
                
                <ActivityItem 
                  title="New Escalation: Power Surge"
                  time="JUST NOW"
                  description="Reported in Engineering Hub B..."
                />
                
                <ActivityItem 
                  title="System Alert: Server Latency"
                  time="4M AGO"
                  description="PMS synchronization delayed by 2s."
                />
                
                <ActivityItem 
                  title="Complaint Resolved: Room 302"
                  time="12M AGO"
                  description="Resolved by Staff: Sarah K."
                />
                
                <ActivityItem 
                  title="New Staff Assigned: Front Desk"
                  time="22M AGO"
                  description="Shift change: Mark T. logged in."
                />
                
                <ActivityItem 
                  title="Priority High: Leakage"
                  time="1H AGO"
                  description="Water pressure warning in Kitchen."
                />

              </div>
              <div className="p-4 border-t border-slate-100">
                <button className="w-full py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200 bg-white shadow-sm">
                  View Historical Logs
                </button>
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}

function TrendingUpIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
      <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
  );
}

function ActivityItem({ title, time, description }: any) {
  return (
    <div>
      <div className="flex justify-between items-start mb-1 gap-2">
        <h4 className="text-xs font-bold text-slate-900 leading-tight">{title}</h4>
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{time}</span>
      </div>
      <p className="text-xs text-slate-500">{description}</p>
    </div>
  );
}