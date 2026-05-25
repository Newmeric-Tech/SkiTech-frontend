import { DashboardLayoutClient } from "@/components/dashboard/DashboardLayoutClient";

export default function DocumentManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayoutClient>
      {children}
    </DashboardLayoutClient>
  );
}
