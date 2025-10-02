import { type RootState } from '@/store/store';

export const selectDocumentState = (state: RootState) => state.documents;

export const selectDocuments = (state: RootState) => state.documents.documents;

export const selectDocumentCount = (status: string) => (state: RootState) =>
    state.documents.counts[status] ?? 0;

export const selectDocumentStatus = (state: RootState) => state.documents.status;
export const selectDocumentError = (state: RootState) => state.documents.error;
