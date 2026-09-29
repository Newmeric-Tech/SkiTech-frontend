import { DashboardLayoutClient } from "@/components/dashboard/DashboardLayoutClient";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard>
      <DashboardLayoutClient>{children}</DashboardLayoutClient>
    </RoleGuard>
  );
}
