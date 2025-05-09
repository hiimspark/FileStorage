import React from "react";
import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ element }) => {
    const token = localStorage.getItem("auth_token")
    return token ? element : <Navigate to="/login" />;
};

export default ProtectedRoute;