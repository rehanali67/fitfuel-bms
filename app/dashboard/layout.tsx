"use client";

import { AuthProvider } from "@/context/AuthContext";
import { ReactNode } from "react";

export default function DashboardLayoutWrapper({ children }: { children: ReactNode }) {
    return <AuthProvider>{children}</AuthProvider>;
}
