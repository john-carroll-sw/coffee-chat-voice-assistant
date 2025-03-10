import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Get authentication settings from environment - default to disabled auth
const authUrl = import.meta.env.VITE_AUTH_URL || "";
const authEnabled = import.meta.env.VITE_AUTH_ENABLED === "true"; // Read from environment

// console.log("Auth settings:", { authUrl, authEnabled, envValue: import.meta.env.VITE_AUTH_ENABLED });

// Interface for authentication info
interface AuthInfo {
    app: string;
    url: string;
}

// App info that gets sent to authentication service
const info: AuthInfo = {
    app: "Coffee Chat",
    url: window.location.origin
};

// Interface for authentication context
interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    logout: () => void;
    authEnabled: boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | null>(null);

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!authEnabled);
    const [isLoading, setIsLoading] = useState<boolean>(authEnabled);

    const redirectToSignin = () => {
        if (!authEnabled || !authUrl) return;

        console.log("Redirecting to signin page...");
        window.location.href = `${authUrl}/signin/?v=${btoa(JSON.stringify(info))}`;
    };

    const logout = () => {
        if (!authEnabled || !authUrl) return;

        sessionStorage.removeItem("authToken");
        setIsAuthenticated(false);
        redirectToSignin();
    };

    const checkAuth = async (token: string) => {
        if (!authEnabled || !authUrl) {
            setIsAuthenticated(true);
            setIsLoading(false);
            return;
        }

        try {
            if (token) {
                const authTokenParse = JSON.parse(atob(token));

                if (Date.now() > authTokenParse.expiry) {
                    // Token expired, verify with server
                    const response = await fetch(`${authUrl}/auth/check/`, {
                        headers: { "x-token": authTokenParse.token }
                    });

                    if (!response.ok) {
                        sessionStorage.removeItem("authToken");
                        setIsLoading(false);
                        redirectToSignin();
                        return;
                    }
                }

                // Token is valid
                sessionStorage.setItem("authToken", token);
                setIsAuthenticated(true);
            } else {
                // No valid token
                sessionStorage.removeItem("authToken");
                redirectToSignin();
            }
        } catch (error) {
            console.error("Authentication error:", error);
            sessionStorage.removeItem("authToken");
            redirectToSignin();
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!authEnabled || !authUrl) {
            setIsAuthenticated(true);
            setIsLoading(false);
            return;
        }

        // First, check for token in URL
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get("t");

        if (tokenFromUrl) {
            // Clear the token from URL to prevent authentication loops
            window.history.replaceState({}, document.title, window.location.pathname);
            checkAuth(tokenFromUrl);
            return;
        }

        // If no URL token, check sessionStorage
        const token = sessionStorage.getItem("authToken");

        if (token) {
            checkAuth(token);
        } else {
            setIsLoading(false);
            redirectToSignin();
        }
    }, []);

    return <AuthContext.Provider value={{ isAuthenticated, isLoading, logout, authEnabled }}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
