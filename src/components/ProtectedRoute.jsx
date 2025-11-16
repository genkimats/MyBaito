import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { BaitoContext } from "../context/BaitoContext";

function ProtectedRoute({ children }) {
  const { currentUser, isGuest } = useContext(BaitoContext);

  // Allow access if the user is authenticated OR is a guest
  if (!currentUser && !isGuest) {
    return <Navigate to="/login" />;
  }

  return children;
}

export default ProtectedRoute;
