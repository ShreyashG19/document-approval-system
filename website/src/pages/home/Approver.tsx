import { DepartmentDropdown } from "@/components/common/DepartmentDropdown"
import { useState } from "react";


function Approver() {
   const [selectedDept, setSelectedDept] = useState("");
  return (
    <div className="space-y-4">
      <label className="text-sm font-medium">Department</label>
      <DepartmentDropdown
        value={selectedDept}
        onChange={setSelectedDept}
        placeholder="Choose a department"
      />
      <p className="text-sm text-gray-600">
        Selected Department ID: {selectedDept || "None"}
      </p>
    </div>
  )
}

export default Approver