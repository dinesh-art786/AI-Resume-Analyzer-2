
import React, {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import { JAVA_API_URL } from "../config";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    const [token, setToken] = useState(
        () => localStorage.getItem("access_token")
    );

    const [loading, setLoading] = useState(true);

    // VERIFY LOGIN SESSION

    useEffect(() => {
        let active = true;

        const verifyLogin = async () => {
            const savedToken = localStorage.getItem("access_token");

            if (!savedToken) {
                if (active) setLoading(false);
                return;
            }

            try {
                const response = await fetch(
                    `${JAVA_API_URL}/auth/me`,
                    {
                        headers: {
                            Authorization: `Bearer ${savedToken}`
                        }
                    }
                );

                const data = await response.json().catch(() => null);

                if (!response.ok) {
                    throw new Error(
                        data?.message ||
                        data?.detail ||
                        "Session expired"
                    );
                }

                if (active) {
                    setUser(data.user);
                }

            } catch (error) {
                console.error("Session verification error:", error);

                if (active) {
                    localStorage.removeItem("access_token");
                    setToken(null);
                    setUser(null);
                }

            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        verifyLogin();

        return () => {
            active = false;
        };
    }, []);

    // LOGIN AND REGISTRATION

    const authenticate = async (endpoint, formData) => {
        try {
            const response = await fetch(
                `${JAVA_API_URL}/auth/${endpoint}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(formData)
                }
            );

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    data?.detail ||
                    "Authentication failed"
                );
            }

            if (!data?.access_token || !data?.user) {
                throw new Error(
                    "Invalid authentication response from Java server."
                );
            }

            localStorage.setItem(
                "access_token",
                data.access_token
            );

            setToken(data.access_token);
            setUser(data.user);

            return data;

        } catch (error) {
            console.error("Authentication error:", error);

            if (error instanceof TypeError) {
                throw new Error(
                    "Cannot connect to the Java backend. Please try again."
                );
            }

            throw error;
        }
    };

    const register = (formData) =>
        authenticate("register", formData);

    const login = (formData) =>
        authenticate("login", formData);

    // UPDATE USER

    const updateUser = (updatedUser) => {
        setUser((previousUser) => ({
            ...previousUser,
            ...updatedUser
        }));
    };

    // LOGOUT

    const logout = () => {
        localStorage.removeItem("access_token");
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                register,
                login,
                logout,
                updateUser,
                isAuthenticated: !!token && !!user
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
