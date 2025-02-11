import { Navigate, NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Role } from "../../utils/enums";
const ApproverRestrictedRoute = ({ children }) => {
  const { loggedInUser, loading } = useAuth();

  if (loading)
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        <span className="loading loading-bars loading-lg"></span>
        <p className="ml-4 text-gray-700">Authenticating...</p>
      </div>
    );
  return loggedInUser && loggedInUser.role === Role.APPROVER ? (
    children
  ) : (
    <div className="flex  items-center justify-center h-screen">
      <h2 className="text-4xl text-gray-100 mb-5">
        🚫You are not authorized to access this page.
        <br />
        <div className="mt-7  ml-8 ">
          <NavLink to="/" className={"text-sky-500  underline"}>
            Go to Home
          </NavLink>
        </div>
      </h2>
    </div>
  );
};

export default ApproverRestrictedRoute;
