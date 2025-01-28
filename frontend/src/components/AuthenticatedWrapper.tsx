import React, { ReactNode } from "react";
import { useAuth } from "../contexts/AuthUserContexts";
import { Navigate } from "react-router-dom";

type AuthenticatedWrapperProps = {
    children: ReactNode;
    fallback?: ReactNode;
    redirectTo?: string;
};

const AuthenticatedWrapper: React.FC<AuthenticatedWrapperProps> = ({
    children,
    fallback = <p>Access denied. Please log in.</p>,
    redirectTo = "/login",
}) => {
    const { state } = useAuth();

    if (!state.isAuthenticated) {

        return redirectTo ? <Navigate to={redirectTo} replace /> : <>{fallback}</>;
    }


    return <>{children}</>;
};

export default AuthenticatedWrapper;
