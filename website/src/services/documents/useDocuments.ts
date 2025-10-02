import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
    selectDocuments,
    selectDocumentCount,
    selectDocumentStatus,
    selectDocumentError,
} from './documentSelectors';
import { useEffect } from 'react';
import { useFetchDocuments } from '@/services/documents/documentsApi';
import { setDocuments, setDocumentsCount } from '@/services/documents/documentSlice';

export const useDocuments = (opts: { status: string; department?: string }) => {
    const dispatch = useAppDispatch();

    // React Query fetch
    const query = useFetchDocuments(opts);

    // Update count in Redux whenever new data arrives
    useEffect(() => {
        if (query.data?.documents) {
            dispatch(setDocuments(query.data.documents));
            dispatch(setDocumentsCount({ status: opts.status, count: query.data.documents.length }));
        }
    }, [query.data, dispatch, opts.status]);

    // Redux state
    const documents = useAppSelector(selectDocuments);
    const count = useAppSelector(selectDocumentCount(opts.status));
    const status = useAppSelector(selectDocumentStatus);
    const error = useAppSelector(selectDocumentError);

    return {
        // Query data
        query,
        // Redux data
        documents,
        count,
        status,
        error,
    };
};
