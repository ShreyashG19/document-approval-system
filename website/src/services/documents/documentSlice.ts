import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type DocumentItem } from "@/services/documents/documentsApi";

interface DocumetState {
  documents: DocumentItem[];
  counts: Record<string, number>;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: DocumetState = {
  documents: [],
  counts: {},
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

export const { setDocuments, setDocumentsCount, setLoading, setSuccess, setFailure } = documentSlice.actions;
export default documentSlice.reducer;
