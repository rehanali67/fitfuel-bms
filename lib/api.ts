import { ApiResponse } from '@/types/api';

// In Next.js, API routes are relative to the current domain
const API_BASE_URL = '';

class ApiClient {
    private getToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('bms_token');
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const token = this.getToken();
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (token) {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers,
            });

            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            const isJson = contentType && contentType.includes('application/json');

            // Handle empty responses
            const contentLength = response.headers.get('content-length');
            if (contentLength === '0' || (!contentLength && !isJson)) {
                // Empty response - might be a 204 No Content or error
                if (response.ok) {
                    return { success: true } as ApiResponse<T>;
                } else {
                    return {
                        success: false,
                        error: `Server returned empty response (${response.status}). Please try again.`,
                    };
                }
            }

            if (!isJson) {
                // If not JSON, it's likely an HTML error page
                const text = await response.text();
                console.error('Non-JSON response:', text.substring(0, 200));
                return {
                    success: false,
                    error: response.status === 404 
                        ? 'API endpoint not found. Please check if the server is running.'
                        : `Server error (${response.status}). Please try again later.`,
                };
            }

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: data.error || data.message || 'Request failed',
                };
            }

            return data;
        } catch (error) {
            if (error instanceof Error) {
                // Check if it's a JSON parse error
                if (error.message.includes('JSON')) {
                    return {
                        success: false,
                        error: 'Invalid response from server. Please check if the API is running correctly.',
                    };
                }
                return {
                    success: false,
                    error: error.message,
                };
            }
            return {
                success: false,
                error: 'An unexpected error occurred',
            };
        }
    }

    async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { ...options, method: 'GET' });
    }

    async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async patch<T>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { ...options, method: 'DELETE' });
    }
}

export const apiClient = new ApiClient();

