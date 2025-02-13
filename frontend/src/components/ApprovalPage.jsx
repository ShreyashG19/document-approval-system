import React, { useState, useEffect } from "react";
import { BsPlus, BsPersonCircle } from "react-icons/bs";
import { FaSearch } from "react-icons/fa"; // Import FaSearch icon
import axios from "axios";

const ApprovalPage = () => {
  const [selectedTab, setSelectedTab] = useState("APPROVED");
  const [documentCounts, setDocumentCounts] = useState({
    APPROVED: 0,
    REJECTED: 0,
    REMARK: 0,
    PENDING: 0,
  });
  const [unseenCounts, setUnseenCounts] = useState({
    APPROVED: 0,
    REJECTED: 0,
    REMARK: 0,
    PENDING: 0,
  });

  useEffect(() => {
    fetchDocumentCounts();
    fetchUnseenCounts();
  }, []);

  const fetchDocumentCounts = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/file/document-counts`,
        { withCredentials: true }
      );
      setDocumentCounts(response.data);
    } catch (error) {
      console.error("Error fetching document counts:", error);
    }
  };

  const fetchUnseenCounts = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/file/unseen-document-counts`,
        { withCredentials: true }
      );
      setUnseenCounts(response.data);
    } catch (error) {
      console.error("Error fetching unseen document counts:", error);
    }
  };

  const handleTabClick = (tab) => {
    setSelectedTab(tab);
    // Mark documents as seen when the tab is clicked
    markDocumentsAsSeen(tab);
  };

  const markDocumentsAsSeen = async (tab) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/file/mark-documents-as-seen`,
        { status: tab },
        { withCredentials: true }
      );
      // Update unseen counts
      setUnseenCounts((prevCounts) => ({
        ...prevCounts,
        [tab]: 0,
      }));
    } catch (error) {
      console.error("Error marking documents as seen:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-white to-blue-100">
      {/* Navbar */}

      {/* Main Content */}
      <div className="flex items-center justify-center flex-grow mt-6">
        <div className="w-[90%] max-w-[80vh] bg-white shadow-lg border border-gray-200 rounded-lg h-[90vh] p-4 flex flex-col">
          {/* Search Section */}
          <div className="relative mb-4">
            <FaSearch className="absolute top-3 left-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-4 py-2 rounded-md bg-gray-100 text-gray-800 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Filters */}
          <div className="flex space-x-4 mb-4">
            <select className="flex-1 px-4 py-2 rounded-md bg-gray-200 text-gray-700 border border-gray-300">
              <option>Category</option>
              <option>Health</option>
              <option>Education</option>
              <option>Transportation</option>
              <option>Finance</option>
            </select>
            <input
              type="date"
              className="flex-1 px-4 py-2 rounded-md bg-gray-200 text-gray-700 border border-gray-300"
            />
          </div>

          {/* Tabs */}
          <div className="tabs flex justify-around items-center text-sm text-gray-700 mb-4 border-b border-gray-200">
            {["APPROVED", "REJECTED", "REMARK", "PENDING"].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`px-4 py-2 font-medium rounded-md ${
                  selectedTab === tab
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {tab}{" "}
                {unseenCounts[tab] > 0 && (
                  <span className="ml-2 bg-red-500 text-white rounded-full px-2 py-1 text-xs">
                    {unseenCounts[tab]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-grow overflow-auto">
            {selectedTab === "APPROVED" && <div>Approved Content</div>}
            {selectedTab === "REJECTED" && <div>Rejected Content</div>}
            {selectedTab === "REMARK" && <div>Remark Content</div>}
            {selectedTab === "PENDING" && <div>Pending Content</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalPage;