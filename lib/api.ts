const API_BASE = "http://127.0.0.1:8000/api/v1";

export async function fetchDashboard(token: string) {
  const res = await fetch("http://127.0.0.1:8000/api/v1/dashboard/", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // ✅ THIS LINE IS CRITICAL
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("❌ Alerts API Error:", errText);
    throw new Error("Failed to fetch alerts");
  }

  return res.json();
}
export async function fetchTasksTrend(token: string) {
  const res = await fetch("http://127.0.0.1:8000/api/v1/dashboard/tasks-trend", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch trend");

  return res.json();
}


export async function fetchAlerts(token: string) {
  const res = await fetch("http://127.0.0.1:8000/api/v1/dashboard/alerts", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch alerts");

  return res.json();
}