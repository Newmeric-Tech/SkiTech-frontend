"use client";

import { useCallback, useEffect, useState } from "react";
import { User, usersAPI } from "@/lib/api/users";
import { kraErrorMessage } from "@/lib/api/kraTasks";

export interface KraPerson {
  id: string;
  name: string;
  role: "Staff" | "Manager";
  isActive: boolean;
}

function toPerson(user: User, role: KraPerson["role"]): KraPerson {
  return {
    id: user.id,
    name: `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || user.email,
    role,
    isActive: user.is_active,
  };
}

/** The Staff and Managers whose user account belongs to this property */
export function useKraPeople(propertyId: string) {
  const [people, setPeople] = useState<KraPerson[] | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setPeople(null);
    setError("");
    try {
      const [staff, managers] = await Promise.all([
        usersAPI.list(propertyId, "Staff"),
        usersAPI.list(propertyId, "Manager"),
      ]);
      setPeople([
        ...staff.data.map((user) => toPerson(user, "Staff")),
        ...managers.data.map((user) => toPerson(user, "Manager")),
      ].sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
      setError(kraErrorMessage(err));
    }
  }, [propertyId]);

  useEffect(() => { load(); }, [load]);

  return { people, error, reload: load };
}
