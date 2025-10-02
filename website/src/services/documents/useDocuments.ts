import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
    selectDocuments,
    selectDocumentStatus,
    selectDocumentError,
    selectDocumentFilters,
} from './documentSelectors';
import { useEffect } from 'react';
import { useFetchDocuments, type DocumentFilters } from '@/services/documents/documentsApi';
import { setDocuments, setDocumentsCount, setFilters } from '@/services/documents/documentSlice';

export const useDocuments = (overrideFilters?: Partial<DocumentFilters>) => {
    const dispatch = useAppDispatch();
    const reduxFilters = useAppSelector(selectDocumentFilters);
    
    // Merge Redux filters with any override filters
    const activeFilters: DocumentFilters = {
      ...reduxFilters,
      ...overrideFilters,
    };

    // React Query fetch
    const query = useFetchDocuments(activeFilters);

    // Update Redux when new data arrives
    useEffect(() => {
        if (query.data?.documents) {
            dispatch(setDocuments(query.data.documents));
            dispatch(setDocumentsCount({ 
              status: activeFilters.status, 
              count: query.data.count ?? 0 
            }));
        }
    }, [query.data, dispatch, activeFilters.status]);

    // Redux state
    const documents = useAppSelector(selectDocuments);
    const status = useAppSelector(selectDocumentStatus);
    const error = useAppSelector(selectDocumentError);

    const updateFilters = (newFilters: Partial<DocumentFilters>) => {
        dispatch(setFilters(newFilters));
    };

    return {
        // Query data
        query,
        // Redux data
        documents,
        count: query.data?.count ?? 0,
        status,
        error,
        filters: activeFilters,
        updateFilters,
        isLoading: query.isLoading,
        isError: query.isError,
        refetch: query.refetch,
    };
};
