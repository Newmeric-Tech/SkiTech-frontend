export interface Employee {
  id: string;
  name: string;
  avatar: string;
  department: string;
  role: string;
  email: string;
  phone: string;
  joinDate: string;
  status: "active" | "on-leave" | "probation";
}

export interface EmployeeRanking {
  employeeId: string;
  employee: Employee;
  rank: number;
  previousRank: number;
  rankChange: number; // positive = moved up, negative = moved down
  attendance: number;
  taskCompletion: number;
  punctuality: number;
  teamwork: number;
  guestSatisfaction: number;
  standbyHours: number;
  overtimeHours: number;
  totalHours: number;
  finalScore: number;
  streak: number;
  status: "High Performer" | "Consistent" | "Needs Attention" | "New";
}

export interface DashboardMetrics {
  overallWorkforceScore: number;
  activeStaff: number;
  totalStaff: number;
  attendancePercentage: number;
  overtimeHours: number;
  standbyHours: number;
  totalHours: number;
  scoreChange: number;
  staffChange: number;
  attendanceChange: number;
}

export interface AIInsight {
  id: string;
  type: "success" | "warning" | "danger" | "info";
  title: string;
  description: string;
  employeeName?: string;
  metric?: string;
  value?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  status: "completed" | "pending" | "in-review";
  priority?: "high" | "medium" | "low";
  dueDate?: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earnedDate: string;
  color: string;
}

export interface ScoreHistory {
  month: string;
  score: number;
  attendance: number;
  tasks: number;
}

export interface RankingFilter {
  search: string;
  department: string;
  status: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}
