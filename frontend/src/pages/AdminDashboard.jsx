import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaSearch } from "react-icons/fa";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";

const AdminDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { loggedInUser } = useAuth();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      queryParams.append('status', 'approved-rejected-correction');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/file/get-documents?${queryParams}`, // Correct API endpoint for admin
        { withCredentials: true }
      );

      if (response.data.status && response.data.documents) {
        setDocuments(response.data.documents);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.response?.data?.message || "Failed to fetch documents");
      toast.error("Failed to load documents");
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex items-center justify-center font-roboto min-h-screen bg-gradient-to-r from-white to-blue-100">
      <div className="w-96 bg-white shadow-lg border border-gray-200 rounded-lg p-8">
        {/* Back Button */}
        <RouterLink
          to="/admin/dashboard" // The Admin dashboard URL
          className="text-blue-600 hover:text-blue-800 mb-6 flex items-center transition-colors duration-300"
        >
          <FaArrowLeft size={24} className="mr-2" />
          Back to Admin Dashboard
        </RouterLink>

        {/* Title */}
        <h2 className="text-center text-xl font-semibold text-gray-800 mb-6">
          Admin Documents
        </h2>

        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FaSearch className="text-zinc-800" />
          </div>
          <input
            type="text"
            name="search"
            id="search"
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none pl-10 text-black"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Documents List */}
        {isLoading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : filteredDocuments.length > 0 ? (
          <ul className="space-y-4">
            {filteredDocuments.map((doc) => (
              <li
                key={doc.id}
                className="flex items-center justify-between bg-white p-4 rounded-md shadow-sm hover:bg-gray-100 transition-colors duration-200"
              >
                <div>
                  <h3 className="text-lg text-black">{doc.title}</h3>
                  <p className="text-sm text-gray-500">{doc.date}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-md ${
                    doc.status === "APPROVED"
                      ? "bg-green-100 text-green-600"
                      : doc.status === "REJECTED"
                      ? "bg-red-100 text-red-600"
                      : "bg-yellow-100 text-yellow-600"
                  }`}
                >
                  {doc.status}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500">No documents found.</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
