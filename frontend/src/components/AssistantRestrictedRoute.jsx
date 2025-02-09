import { Navigate, NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Role } from "../../utils/enums";
const AssistantRestrictedRoute = ({ children }) => {
  const { loggedInUser, loading } = useAuth();

  if (loading)
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        <span className="loading loading-bars loading-lg"></span>
        <p className="ml-4 text-gray-700">Authenticating...</p>
      </div>
    );
  return loggedInUser &&
    (loggedInUser.role === Role.SENIOR_ASSISTANT ||
      loggedInUser.role === Role.ASSISTANT) ? (
    children
  ) : (
    <h2>
      You are not authorized to access this page.
      <br />
      <NavLink to="/" className={"text-sky-500 underline"}>
        Go to Home
      </NavLink>
    </h2>
  );
};

export default AssistantRestrictedRoute;
