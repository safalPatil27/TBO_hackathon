import React, { createContext, useContext, useReducer, ReactNode, useEffect } from "react";

type User = {
    username: string;
    email: string;
    accessToken: string;
    refreshToken: string;
};

type AuthState = {
    user: User | null;
    isAuthenticated: boolean;
};

type AuthAction =
    | { type: "LOGIN"; payload: User }
    | { type: "LOGOUT" }
    | { type: "INITIALIZE"; payload: User | null };

export const AUTH_ACTIONS = {
    LOGIN: "LOGIN",
    LOGOUT: "LOGOUT",
}

type AuthContextType = {
    state: AuthState;
    dispatch: React.Dispatch<AuthAction>;
};

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
};

// Reducer function
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case "LOGIN":
            return {
                ...state,
                user: action.payload,
                isAuthenticated: true,
            };
        case "LOGOUT":
            return {
                ...state,
                user: null,
                isAuthenticated: false,
            };
        case "INITIALIZE":
            return {
                ...state,
                user: action.payload,
                isAuthenticated: !!action.payload,
            };
        default:
            throw new Error(`Unhandled action type: ${action}`);
    }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
    children: ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);


    // Navigate to dashboard when authenticated

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            const user: User = JSON.parse(userData);
            dispatch({ type: "INITIALIZE", payload: user });
        }
    }, []);

    // Sync state to localStorage on login/logout
    useEffect(() => {
        if (state.user) {
            localStorage.setItem("user", JSON.stringify(state.user));
        } else {
            localStorage.removeItem("user");
        }
    }, [state.user]);
    return (
        <AuthContext.Provider value={{ state, dispatch }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
