import { useAppSelector } from '@/store/hooks';
import {
    selectDepartments,
    selectDepartmentStatus,
    selectDepartmentError,
    selectDepartmentCount,
    selectDepartmentNames,
    selectSortedDepartments,
} from '@/services/departments/departmentSelectors';
import { useDepartmentApi } from '@/services/departments/departmentApi';

export const useDepartment = () => {
    const departments = useAppSelector(selectDepartments);
    const status = useAppSelector(selectDepartmentStatus);
    const error = useAppSelector(selectDepartmentError);
    const departmentCount = useAppSelector(selectDepartmentCount);
    const departmentNames = useAppSelector(selectDepartmentNames);
    const sortedDepartments = useAppSelector(selectSortedDepartments);
    
    const api = useDepartmentApi();

    return {
        departments,
        departmentCount,
        departmentNames,
        sortedDepartments,
        status,
        error,

        addDepartment: api.addDepartment,
        addDepartmentAsync: api.addDepartmentAsync,
        refetchDepartments: api.refetchDepartments,

        isLoadingDepartments: api.isLoadingDepartments,
        isAddingDepartments: api.isAddingDepartment,

        addDepartmentError: api.addDepartmentError,
    };
};