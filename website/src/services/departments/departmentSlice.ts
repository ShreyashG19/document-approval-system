import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface Department {
  id: string;
  departmentName: string;
  createdAt?: string;
  updatedAt?: string;
}

interface DepartmentState {
  departments: Department[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: DepartmentState = {
  departments: [],
  status: "idle",
  error: null,
};

const departmentSlice = createSlice({
  name: "departments",
  initialState,
  reducers: {
    setDepartments: (state, action: PayloadAction<Department[]>) => {
      state.departments = action.payload;
      state.status = "succeeded";
    },
    addDepartment: (state, action: PayloadAction<Department>) => {
        state.departments.push(action.payload);
    },
    removeDepartment: (state, action: PayloadAction<string>) => {
        state.departments = state.departments.filter(
            (dept) => dept.id !== action.payload
        );
    },
    updateDepartment: (state, action: PayloadAction<Department>) => {
        const index = state.departments.findIndex(
            (dept) => dept.id === action.payload.id
        );
        if(index !== -1){
            state.departments[index] = action.payload;
        }
    },
    setLoading: (state) => {
        state.status = 'loading';
    },
    setError: (state, action: PayloadAction<string>) => {
        state.status = 'failed';
        state.error = action.payload;
    },
    clearDepartments: (state) => {
        state.departments = [];
        state.status = 'idle';
        state.error = null;
    },
  },
});

export const {
    setDepartments,
    addDepartment,
    removeDepartment,
    updateDepartment,
    setLoading,
    setError,
    clearDepartments
} = departmentSlice.actions;

export default departmentSlice.reducer;
