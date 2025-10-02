import { type RootState } from '@/store/store';
import { createSelector } from '@reduxjs/toolkit';

export const selectDepartmentState = (state: RootState) => state.department;

export const selectDepartments = (state: RootState) => state.department.departments;
export const selectDepartmentStatus = (state: RootState) => state.department.status;
export const selectDepartmentError = (state: RootState) => state.department.error;

// Memoized selectors
export const selectDepartmentCount = createSelector(
    [selectDepartments],
    (departments) => departments.length
);

export const selectDepartmentById = (departmentId: string) =>
    createSelector([selectDepartments], (departments) =>
        departments.find((dept) => dept.id === departmentId)
    );

export const selectDepartmentNames = createSelector(
    [selectDepartments],
    (departments) => departments.map((dept) => dept.departmentName)
);

export const selectSortedDepartments = createSelector(
  [selectDepartments],
  (departments) =>
    [...departments].sort((a, b) =>
      (a?.departmentName || "").localeCompare(b?.departmentName || "")
    )
);

export const selectDepartmentLoadingState = createSelector(
    [selectDepartmentStatus],
    (status) => status === 'loading'
);