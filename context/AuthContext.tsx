"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/lib/auth";
import { apiClient } from "@/lib/api";
import { LoginResponse } from "@/types/api";

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for existing session on mount
        const checkAuth = async () => {
            const token = localStorage.getItem("bms_token");
            const storedUser = localStorage.getItem("bms_user");

            if (token && storedUser) {
                try {
                    // Verify token is still valid by fetching user
                    const response = await apiClient.get<User>("/api/auth/me");
                    if (response.success && response.data) {
                        setUser(response.data);
                    } else {
                        // Token invalid, clear storage
                        localStorage.removeItem("bms_token");
                        localStorage.removeItem("bms_user");
                    }
                } catch (error) {
                    // Token invalid, clear storage
                    localStorage.removeItem("bms_token");
                    localStorage.removeItem("bms_user");
                }
            }
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        setIsLoading(true);

        try {
            const response = await apiClient.post<LoginResponse>("/api/auth/login", {
                email,
                password,
            });

            if (response.success && response.data) {
                const { user: userData, token } = response.data;
                setUser(userData);
                localStorage.setItem("bms_token", token);
                localStorage.setItem("bms_user", JSON.stringify(userData));
                setIsLoading(false);
                return { success: true };
            }

            setIsLoading(false);
            return { success: false, error: response.error || "Invalid email or password" };
        } catch (error) {
            setIsLoading(false);
            return { success: false, error: "Login failed. Please try again." };
        }
    };

    const logout = async () => {
        try {
            await apiClient.post("/api/auth/logout");
        } catch (error) {
            // Ignore errors on logout
        } finally {
            setUser(null);
            localStorage.removeItem("bms_token");
            localStorage.removeItem("bms_user");
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                login,
                logout,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
