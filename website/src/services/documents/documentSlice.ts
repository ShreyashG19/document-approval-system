import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type DocumentFilters, type DocumentItem } from "@/services/documents/documentsApi";

interface DocumetState {
  documents: DocumentItem[];
  counts: Record<string, number>;
  filters: DocumentFilters;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: DocumetState = {
  documents: [],
  counts: {},
  filters: {
    status: '',
    department: undefined,
    startDate: undefined,
    endDate: undefined,
    sortBy: 'createdDate:desc',
    createdBy: undefined,
    assignedTo: undefined,
  },
  status: "idle",
  error: null,
};

const documentSlice = createSlice({
  name: "documents",
  initialState,
  reducers: {
    setDocuments: (state, action: PayloadAction<DocumentItem[]>) => {
      state.documents = action.payload;
    },

    setDocumentsCount: (
      state,
      action: PayloadAction<{ status: string; count: number }>
    ) => {
      state.counts[action.payload.status] = action.payload.count;
    },

    setFilters: (state, action: PayloadAction<Partial<DocumentFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    resetFilters: (state) => {
      state.filters = initialState.filters;
    },

    setLoading: (state) => {
      state.status = "loading";
    },

    setSuccess: (state) => {
      state.status = "succeeded";
    },

    setFailure: (state, action: PayloadAction<string>) => {
      state.status = "failed";
      state.error = action.payload;
    },
  },
});

export const { setDocuments, setDocumentsCount, setLoading, setSuccess, setFailure , setFilters, resetFilters} = documentSlice.actions;
export default documentSlice.reducer;
