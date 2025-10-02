import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useAppDispatch } from '@/store/hooks';
import {
    setDepartments,
    addDepartment,
    setLoading,
    setError,
} from '@/services/departments/departmentSlice';
import { queryKeys } from '@/lib/constants/queryKeys';
import { useEffect } from 'react';

interface Department {
    id: string;
    departmentName: string;
    createdAt?: string;
    updatedAt?: string;
}

interface ApiResponse {
    status: boolean;
    message: string;
    data: {
        departments?: Department[];
        department?: Department;
    };
}

interface ApiError {
    message: string;
    statusCode: number;
}

interface AddDepartmentData {
    departmentName: string;
}

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getAllDepartments = async (): Promise<Department[]> => {
    const response = await axios.get<ApiResponse>(
        `${BASE_URL}/api/department/get-all-departments`,
        { withCredentials: true }
    );
    console.log(response);
    return response.data.data.departments || [];
};

const addNewDepartment = async (data: AddDepartmentData): Promise<Department> => {
    const response = await axios.post<ApiResponse>(
        `${BASE_URL}/api/department/add-department`,
        data,
        { withCredentials: true }
    );
    console.log(response)
    return response.data.data.department!;
};

export const useDepartmentApi = () => {
    const dispatch = useAppDispatch();
    const queryClient = useQueryClient();

    // Query for fetching departments
    const departmentsQuery = useQuery({
        queryKey: queryKeys.departments?.all || ['departments'],
        queryFn: getAllDepartments,
        staleTime: 300000, // 5 minutes
        retry: 2,
    });

    // Update Redux when query data changes
    useEffect(() => {
        if (departmentsQuery.data) {
            dispatch(setDepartments(departmentsQuery.data));
        }
    }, [departmentsQuery.data, dispatch]);

    useEffect(() => {
        if (departmentsQuery.isLoading) {
            dispatch(setLoading());
        }
    }, [departmentsQuery.isLoading, dispatch]);

    useEffect(() => {
        if (departmentsQuery.error) {
            const msg =
                (departmentsQuery.error as AxiosError<ApiError>)?.response?.data?.message ||
                (departmentsQuery.error as Error).message;
            dispatch(setError(msg));
        }
    }, [departmentsQuery.error, dispatch]);

    // Mutation for adding a department
    const addDepartmentMutation = useMutation<
        Department,
        AxiosError<ApiError>,
        AddDepartmentData,
        { previousDepartments?: Department[] } 
    >({
        mutationFn: addNewDepartment,
        onMutate: async (newDepartment) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({
                queryKey: queryKeys.departments?.all || ['departments'],
            });

            // Snapshot previous value
            const previousDepartments = queryClient.getQueryData<Department[]>(
                queryKeys.departments?.all || ['departments']
            );

            // Optimistically update
            if (previousDepartments) {
                queryClient.setQueryData<Department[]>(
                    queryKeys.departments?.all || ['departments'],
                    [...previousDepartments, { id: 'temp', ...newDepartment }]
                );
            }

            return { previousDepartments };
        },
        onSuccess: (data) => {
            dispatch(addDepartment(data));
            queryClient.invalidateQueries({
                queryKey: queryKeys.departments?.all || ['departments'],
            });
        },
        onError: (error, _variables, context) => {
            const msg =
                (error as AxiosError<ApiError>)?.response?.data?.message ||
                (error as Error).message;
            dispatch(setError(msg));

            // Rollback on error
            if (context?.previousDepartments) {
                queryClient.setQueryData(
                    queryKeys.departments?.all || ['departments'],
                    context.previousDepartments
                );
            }
        },
    });

    return {
        // Query data
        departments: departmentsQuery.data || [],
        isLoadingDepartments: departmentsQuery.isLoading,
        departmentsError: departmentsQuery.error,
        refetchDepartments: departmentsQuery.refetch,

        // Mutations
        addDepartment: addDepartmentMutation.mutate,
        addDepartmentAsync: addDepartmentMutation.mutateAsync,
        isAddingDepartment: addDepartmentMutation.isPending,
        addDepartmentError: addDepartmentMutation.error,
    };
};