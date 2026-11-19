
import React, {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

const AuthContext = createContext(null);

const API_URL = "http://127.0.0.1:8000/api";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    const [token, setToken] = useState(
        () => localStorage.getItem("access_token")
    );

    const [loading, setLoading] = useState(true);

    // Verify an existing session only when the app first opens.
    // Do not verify again when login/signup sets a new token.
    useEffect(() => {
        let active = true;

        const verifyLogin = async () => {
            const savedToken = localStorage.getItem("access_token");

            if (!savedToken) {
                if (active) setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${API_URL}/auth/me`, {
                    headers: {
                        Authorization: `Bearer ${savedToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Session expired");
                }

                const data = await response.json();

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

    const authenticate = async (endpoint, formData) => {
        try {
            console.log("Sending request to:", `${API_URL}/auth/${endpoint}`);
            const response = await fetch(`${API_URL}/auth/${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail || "Authentication failed"
                );
            }

            localStorage.setItem("access_token", data.access_token);

            setToken(data.access_token);
            setUser(data.user);

            return data;

        } catch (error) {
            console.error("Authentication error:", error);

            if (error instanceof TypeError) {
                throw new Error(
                    "Cannot connect to the backend. Make sure FastAPI is running."
                );
            }

            throw error;
        }
    };

    const register = (formData) =>
        authenticate("register", formData);

    const login = (formData) =>
        authenticate("login", formData);

    const updateUser = (updatedUser) => {
        setUser((previousUser) => ({
            ...previousUser,
            ...updatedUser,
        }));
    };

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
                isAuthenticated: !!token && !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
