import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
const LoginRestrictedRoute = ({ children }) => {
  const { loggedInUser, loading } = useAuth();

  if (loading)
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        <span className="loading loading-bars loading-lg"></span>
        <p className="ml-4 text-gray-700">Authenticating...</p>
      </div>
    );

  return loggedInUser ? children : <Navigate to="/" />;
};

export default LoginRestrictedRoute;
