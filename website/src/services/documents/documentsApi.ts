// documentsApi.ts
import axios from 'axios'
import { useQuery, useQueries } from '@tanstack/react-query'

export interface DocumentItem {
  _id?: string
  id?: string
  title?: string
  fileUniqueName?: string
  status?: string
  createdBy?: string
  assignedTo?: string
  createdDate?: string
  deparment?: string
}

interface DocumentsResponse {
  documents: DocumentItem[]
  count?: number
  total?: number
}

export interface DocumentFilters {
  status: string
  department?: string
  startDate?: string
  endDate?: string
  sortBy?: string
  createdBy?: string
  assignedTo?: string
}

const fetchDocuments = async (params: Record<string, any>): Promise<DocumentsResponse> => {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== '') {
      acc[key] = value
    }
    return acc
  }, {} as Record<string, any>)

  const resp = await axios.get(`${base}/api/file/get-documents`, {
    params : cleanParams,
    withCredentials: true,
  })

  const body = resp.data
  console.log(body);
  const data = body?.data ?? body
  
  return {
    documents: data.documents ?? data,
    count: data.count ?? data.documents?.length ?? data.length,
    total: data.total ?? data.count ?? data.documents?.length ?? data.length
  }
}

export const useFetchDocuments = (filters: DocumentFilters) => {
  return useQuery({
    queryKey: ['documents', filters],
    queryFn: () => fetchDocuments(filters),
    enabled: Boolean(filters.status),
    staleTime: 1000 * 60 * 5, 
    gcTime: 1000 * 60 * 30,
  })
}

// Fetch counts for multiple statuses
export const useFetchDocumentCounts = (statuses: string[], additionalFilters?: Partial<DocumentFilters>) => {
  const queries = useQueries({
    queries: statuses.map(status => ({
      queryKey: ['documents', 'count', status, additionalFilters],
      queryFn: async () => {
        const result = await fetchDocuments({ status, ...additionalFilters })
        return { status, count: result.count ?? 0 }
      },
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
    }))
  })

  const counts = queries.reduce((acc, query, index) => {
    if (query.data) {
      acc[statuses[index]] = query.data.count
    }
    return acc
  }, {} as Record<string, number>)

  const isLoading = queries.some(q => q.isLoading)
  const isError = queries.some(q => q.isError)

  return { counts, isLoading, isError }
}

// useDocuments.ts - Simplified hook
export const useDocuments = (opts: { 
  status: string
  department?: string
  startDate?: string
  endDate?: string
  sortBy?: string
  createdBy?: string
  assignedTo?: string 
}) => {
  const query = useFetchDocuments(opts)

  return {
    documents: query.data?.documents ?? [],
    count: query.data?.count ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

// Example usage in a component:
/*
import { useDocuments, useFetchDocumentCounts } from './documentsApi'

function DocumentsPage() {
  const { documents, count, isLoading } = useDocuments({ 
    status: 'pending',
    department: 'engineering'
  })

  // Get counts for multiple statuses
  const { counts } = useFetchDocumentCounts(['pending', 'approved', 'rejected'])

  return (
    <div>
      <div>
        Pending: {counts.pending ?? 0}
        Approved: {counts.approved ?? 0}
        Rejected: {counts.rejected ?? 0}
      </div>
      
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <p>Total: {count}</p>
          {documents.map(doc => (
            <div key={doc._id}>{doc.title}</div>
          ))}
        </div>
      )}
    </div>
  )
}
*/