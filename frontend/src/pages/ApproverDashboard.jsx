import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { IoMdRefresh } from "react-icons/io";
import { Toaster } from "react-hot-toast";
import DocumentsList from "../components/DocumentsList";

const ApproverDashboard = () => {
  const [selectedTab, setSelectedTab] = useState("PENDING");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [encKey, setEncKey] = useState("");
  const [counts, setCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    correction: 0,
  });

  useEffect(() => {
    // Fetch departments and encryption key
    // Fetch document counts
    fetchDocumentCounts();
  }, []);

  const fetchDocumentCounts = async () => {
    // Fetch the counts of documents for each status
    // This is a placeholder implementation
    const response = await fetch("/api/document-counts");
    const data = await response.json();
    setCounts(data);
  };

  const handleRefresh = () => {
    // Refresh logic
    fetchDocumentCounts();
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setStartDate("");
    setEndDate("");
  };

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 text-gray-800">
      <Toaster />

      <main className="p-6 flex-grow">
        <div className="flex flex-wrap gap-4 mb-6 border-b">
          {["PENDING", "APPROVED", "REJECTED", "CORRECTION"].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-2 ${
                selectedTab === tab
                  ? "border-b-2 border-blue-500 text-blue-500"
                  : "text-gray-600 hover:text-blue-500"
              }`}
              disabled={isLoading}
            >
              {tab} ({counts[tab.toLowerCase()]})
            </button>
          ))}
        </div>

        <div className="flex justify-start items-start md:flex-row gap-4">
          <div className="relative w-full max-w-xs mb-6">
            <FaSearch className="absolute top-3.5 left-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-md border bg-white border-gray-300 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              disabled={isLoading}
            />
          </div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 transition"
            disabled={isLoading}
          >
            <IoMdRefresh className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 flex flex-col md:flex-row gap-4">
          <div className="flex-shrink-0">
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full md:w-auto mt-1 p-2 text-sm border border-gray-300 bg-white rounded-md"
              disabled={isLoading}
            >
              <option value="">All</option>
              {departments?.map((department, idx) => (
                <option key={idx} value={department}>
                  {capitalizeFirstLetter(department)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-grow">
            <label className="block text-sm font-medium">Date Range</label>
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-grow md:flex-grow-0 md:w-48">
                <input
                  ref={(input) => (window.startDateInput = input)}
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="p-2 border bg-white text-gray-500 border-gray-300 rounded-md appearance-none pointer-events-none w-full"
                  disabled={isLoading}
                />
                <svg
                  className="absolute right-3 top-3 w-5 h-5 text-black cursor-pointer"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  onClick={() => window.startDateInput?.showPicker()} // Opens Date Picker on SVG Click
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7V3M16 7V3M3 11h18M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"
                  />
                </svg>
              </div>

              <div className="relative flex-grow md:flex-grow-0 md:w-48">
                <input
                  ref={(input) => (window.endDateInput = input)}
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="p-2 border bg-white text-gray-500 border-gray-300 rounded-md appearance-none pointer-events-none w-full"
                  min={startDate}
                  disabled={isLoading}
                />
                <svg
                  className="absolute right-3 top-3 w-5 h-5 text-black cursor-pointer"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  onClick={() => window.endDateInput?.showPicker()} // Opens Date Picker on SVG Click
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7V3M16 7V3M3 11h18M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"
                  />
                </svg>
              </div>

              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-500 text-white rounded-md shadow-md hover:bg-gray-600 transition"
                disabled={isLoading}
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            Array(3)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="bg-white p-4 rounded-lg shadow animate-pulse w-full max-w-4xl"
                >
                  <div className="flex justify-between items-center w-full">
                    <div className="w-1/2 h-5 bg-gray-200 rounded"></div>
                    <div className="w-32 h-8 bg-gray-200 rounded"></div>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="w-full h-4 bg-gray-200 rounded"></div>
                    <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                    <div className="flex justify-between items-center mt-4">
                      <div className="w-36 h-4 bg-gray-200 rounded"></div>
                      <div className="w-24 h-4 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <DocumentsList
              status={selectedTab.toLowerCase()}
              department={selectedCategory}
              startDate={startDate}
              endDate={endDate}
              searchQuery={searchQuery}
              handleTitleClick={(url, details) => {
                // Handle title click
              }}
              encKey={encKey}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default ApproverDashboard;
