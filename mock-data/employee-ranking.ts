import {
  Employee,
  EmployeeRanking,
  DashboardMetrics,
  AIInsight,
  TaskItem,
  Badge,
  ScoreHistory,
} from "@/types/employee-ranking";

export const employees: Employee[] = [
  { id: "1", name: "Elena Rossi", avatar: "/avatars/elena.jpg", department: "Concierge", role: "Senior Concierge", email: "elena.rossi@skitech.com", phone: "+1 555-0101", joinDate: "2023-01-15", status: "active" },
  { id: "2", name: "Marcus V.", avatar: "/avatars/marcus.jpg", department: "Operations", role: "Operations Lead", email: "marcus.v@skitech.com", phone: "+1 555-0102", joinDate: "2022-08-20", status: "active" },
  { id: "3", name: "Racha Kim", avatar: "/avatars/racha.jpg", department: "Guest Relations", role: "Guest Relations Manager", email: "racha.kim@skitech.com", phone: "+1 555-0103", joinDate: "2023-03-10", status: "active" },
  { id: "4", name: "Julian Cole", avatar: "/avatars/julian.jpg", department: "Housekeeping", role: "Housekeeping Supervisor", email: "julian.cole@skitech.com", phone: "+1 555-0104", joinDate: "2022-11-05", status: "active" },
  { id: "5", name: "Claire D.", avatar: "/avatars/claire.jpg", department: "Events Management", role: "Events Coordinator", email: "claire.d@skitech.com", phone: "+1 555-0105", joinDate: "2023-06-01", status: "active" },
  { id: "6", name: "David Lopez", avatar: "/avatars/david.jpg", department: "Operations", role: "Operations Assistant", email: "david.lopez@skitech.com", phone: "+1 555-0106", joinDate: "2023-02-14", status: "on-leave" },
  { id: "7", name: "Ara Torres", avatar: "/avatars/ara.jpg", department: "Front Desk", role: "Front Desk Agent", email: "ara.torres@skitech.com", phone: "+1 555-0107", joinDate: "2023-07-22", status: "active" },
  { id: "8", name: "Sophie Bell", avatar: "/avatars/sophie.jpg", department: "Guest Relations", role: "Guest Relations Agent", email: "sophie.bell@skitech.com", phone: "+1 555-0108", joinDate: "2023-04-18", status: "active" },
  { id: "9", name: "James K.", avatar: "/avatars/james.jpg", department: "Concierge", role: "Concierge Agent", email: "james.k@skitech.com", phone: "+1 555-0109", joinDate: "2023-09-01", status: "probation" },
  { id: "10", name: "Priya Mehta", avatar: "/avatars/priya.jpg", department: "HR", role: "HR Coordinator", email: "priya.mehta@skitech.com", phone: "+1 555-0110", joinDate: "2022-05-10", status: "active" },
  { id: "11", name: "Liam Chen", avatar: "/avatars/liam.jpg", department: "Front Desk", role: "Front Desk Supervisor", email: "liam.chen@skitech.com", phone: "+1 555-0111", joinDate: "2022-09-15", status: "active" },
  { id: "12", name: "Nina Patel", avatar: "/avatars/nina.jpg", department: "Housekeeping", role: "Housekeeping Staff", email: "nina.patel@skitech.com", phone: "+1 555-0112", joinDate: "2023-10-01", status: "active" },
];

export const rankings: EmployeeRanking[] = [
  { employeeId: "1", employee: employees[0], rank: 1, previousRank: 2, rankChange: 1, attendance: 100, taskCompletion: 99, punctuality: 98, teamwork: 97, guestSatisfaction: 99, standbyHours: 8, overtimeHours: 5, totalHours: 168, finalScore: 98.8, streak: 6, status: "High Performer" },
  { employeeId: "2", employee: employees[1], rank: 2, previousRank: 1, rankChange: -1, attendance: 97, taskCompletion: 96, punctuality: 95, teamwork: 94, guestSatisfaction: 96, standbyHours: 6, overtimeHours: 8, totalHours: 172, finalScore: 95.4, streak: 4, status: "High Performer" },
  { employeeId: "3", employee: employees[2], rank: 3, previousRank: 3, rankChange: 0, attendance: 96, taskCompletion: 95, punctuality: 97, teamwork: 93, guestSatisfaction: 97, standbyHours: 4, overtimeHours: 3, totalHours: 160, finalScore: 97.8, streak: 5, status: "Consistent" },
  { employeeId: "4", employee: employees[3], rank: 4, previousRank: 5, rankChange: 1, attendance: 95, taskCompletion: 93, punctuality: 94, teamwork: 96, guestSatisfaction: 92, standbyHours: 7, overtimeHours: 6, totalHours: 165, finalScore: 97.2, streak: 3, status: "High Performer" },
  { employeeId: "5", employee: employees[4], rank: 5, previousRank: 4, rankChange: -1, attendance: 94, taskCompletion: 92, punctuality: 93, teamwork: 95, guestSatisfaction: 91, standbyHours: 5, overtimeHours: 4, totalHours: 158, finalScore: 93.8, streak: 2, status: "High Performer" },
  { employeeId: "6", employee: employees[5], rank: 6, previousRank: 8, rankChange: 2, attendance: 89, taskCompletion: 88, punctuality: 90, teamwork: 92, guestSatisfaction: 88, standbyHours: 3, overtimeHours: 2, totalHours: 150, finalScore: 96.6, streak: 1, status: "Needs Attention" },
  { employeeId: "7", employee: employees[6], rank: 7, previousRank: 6, rankChange: -1, attendance: 93, taskCompletion: 91, punctuality: 92, teamwork: 90, guestSatisfaction: 94, standbyHours: 4, overtimeHours: 5, totalHours: 162, finalScore: 95.2, streak: 3, status: "High Performer" },
  { employeeId: "8", employee: employees[7], rank: 8, previousRank: 7, rankChange: -1, attendance: 92, taskCompletion: 90, punctuality: 91, teamwork: 89, guestSatisfaction: 93, standbyHours: 2, overtimeHours: 3, totalHours: 155, finalScore: 94.6, streak: 2, status: "Consistent" },
  { employeeId: "9", employee: employees[8], rank: 9, previousRank: 10, rankChange: 1, attendance: 88, taskCompletion: 85, punctuality: 87, teamwork: 86, guestSatisfaction: 87, standbyHours: 3, overtimeHours: 1, totalHours: 148, finalScore: 93.0, streak: 1, status: "Consistent" },
  { employeeId: "10", employee: employees[9], rank: 10, previousRank: 9, rankChange: -1, attendance: 91, taskCompletion: 89, punctuality: 88, teamwork: 91, guestSatisfaction: 90, standbyHours: 5, overtimeHours: 4, totalHours: 160, finalScore: 93.1, streak: 2, status: "High Performer" },
  { employeeId: "11", employee: employees[10], rank: 11, previousRank: 12, rankChange: 1, attendance: 90, taskCompletion: 87, punctuality: 89, teamwork: 88, guestSatisfaction: 89, standbyHours: 4, overtimeHours: 3, totalHours: 156, finalScore: 96.5, streak: 1, status: "Consistent" },
  { employeeId: "12", employee: employees[11], rank: 12, previousRank: 11, rankChange: -1, attendance: 87, taskCompletion: 84, punctuality: 86, teamwork: 85, guestSatisfaction: 86, standbyHours: 2, overtimeHours: 2, totalHours: 145, finalScore: 97.2, streak: 0, status: "New" },
];

export const dashboardMetrics: DashboardMetrics = {
  overallWorkforceScore: 98.8,
  activeStaff: 42,
  totalStaff: 45,
  attendancePercentage: 96.4,
  overtimeHours: 8,
  standbyHours: 5,
  totalHours: 1920,
  scoreChange: 2.4,
  staffChange: 3,
  attendanceChange: 1.2,
};

export const aiInsights: AIInsight[] = [
  {
    id: "1",
    type: "success",
    title: "MOST IMPROVED",
    description: "David Lopez saw +19% in attendance this month after switching to morning shifts.",
    employeeName: "David Lopez",
    metric: "Attendance",
    value: "+19%",
  },
  {
    id: "2",
    type: "info",
    title: "ATTENDANCE CHAMPION",
    description: "Elena Rossi has maintained 100% attendance for 12 consecutive months. Outstanding dedication!",
    employeeName: "Elena Rossi",
    metric: "Streak",
    value: "12 months",
  },
  {
    id: "3",
    type: "danger",
    title: "NEEDS ATTENTION",
    description: "It\'s the \"housekeeping\" division shows a -5% efficiency drop in the last 2 weeks.",
    employeeName: "Housekeeping Team",
    metric: "Efficiency",
    value: "-5%",
  },
  {
    id: "4",
    type: "warning",
    title: "RANKING TRENDS",
    description: "3 staff members have shown downward ranking trends for 2+ consecutive months.",
    metric: "Ranking",
    value: "3 staff",
  },
];

export const staffTasks: TaskItem[] = [
  { id: "1", title: "Daily Shift Duties", status: "completed", priority: "high", dueDate: "Today" },
  { id: "2", title: "Team Collaboration Tasks", status: "completed", priority: "medium", dueDate: "Today" },
  { id: "3", title: "Monthly KPI Report", status: "in-review", priority: "high", dueDate: "May 25" },
  { id: "4", title: "Guest Satisfaction Followup", status: "pending", priority: "medium", dueDate: "May 22" },
  { id: "5", title: "Inventory reconciliation report", status: "pending", priority: "low", dueDate: "May 28" },
  { id: "6", title: "Maintaining log submissions", status: "completed", priority: "medium", dueDate: "Today" },
  { id: "7", title: "Training Certification", status: "pending", priority: "high", dueDate: "May 30" },
  { id: "8", title: "Daily site briefing notes", status: "completed", priority: "low", dueDate: "Today" },
];

export const badges: Badge[] = [
  { id: "1", name: "Attendance Master", icon: "🏆", description: "100% attendance for 3+ months", earnedDate: "2024-02-15", color: "#F59E0B" },
  { id: "2", name: "Team Player", icon: "🤝", description: "Outstanding teamwork score", earnedDate: "2024-01-20", color: "#3B82F6" },
  { id: "3", name: "Star Performer", icon: "⭐", description: "Top 3 ranking for 2+ months", earnedDate: "2024-03-01", color: "#8B5CF6" },
  { id: "4", name: "Task Champion", icon: "🎯", description: "99%+ task completion rate", earnedDate: "2024-02-28", color: "#10B981" },
  { id: "5", name: "Early Bird", icon: "🌅", description: "Perfect punctuality record", earnedDate: "2024-01-10", color: "#EC4899" },
  { id: "6", name: "Guest Favorite", icon: "❤️", description: "Highest guest satisfaction score", earnedDate: "2024-03-15", color: "#EF4444" },
  { id: "7", name: "Quick Learner", icon: "📚", description: "Completed all training modules", earnedDate: "2024-02-05", color: "#06B6D4" },
  { id: "8", name: "Night Owl", icon: "🦉", description: "Excellent night shift performance", earnedDate: "2024-01-25", color: "#6366F1" },
];

export const scoreHistory: ScoreHistory[] = [
  { month: "Oct", score: 91.2, attendance: 93, tasks: 88 },
  { month: "Nov", score: 93.5, attendance: 95, tasks: 91 },
  { month: "Dec", score: 92.8, attendance: 94, tasks: 90 },
  { month: "Jan", score: 95.1, attendance: 96, tasks: 93 },
  { month: "Feb", score: 96.3, attendance: 97, tasks: 95 },
  { month: "Mar", score: 97.0, attendance: 98, tasks: 96 },
  { month: "Apr", score: 97.8, attendance: 99, tasks: 97 },
  { month: "May", score: 98.8, attendance: 100, tasks: 99 },
];

export const departments = [
  "All Departments",
  "Concierge",
  "Operations",
  "Guest Relations",
  "Housekeeping",
  "Events Management",
  "Front Desk",
  "HR",
];

export const statusFilters = [
  "All Status",
  "High Performer",
  "Consistent",
  "Needs Attention",
  "New",
];
