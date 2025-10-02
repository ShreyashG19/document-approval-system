import * as React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDepartment } from "@/services/departments/useDepartment";

interface DepartmentDropdownProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

interface Department {
  id: string;
  name: string;
}

export const DepartmentDropdown: React.FC<DepartmentDropdownProps> = ({
  value,
  onChange,
  placeholder = "Select department...",
}) => {
  const { sortedDepartments, isLoadingDepartments, error } = useDepartment();

  if (isLoadingDepartments) {
    return <p className="text-sm text-gray-500">Loading departments...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-500">Failed to load departments</p>;
  }

  // Properly type the departments
  const departments: Department[] = sortedDepartments.map((dept: any) => ({
    id: dept.id || dept._id || Math.random().toString(), // fallback ID generation
    name: typeof dept === 'string' ? dept : dept.name || dept.departmentName || 'Unknown Department'
  }));

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[250px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {departments.map((dept) => (
          <SelectItem key={dept.id} value={dept.name}>
            {dept.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};