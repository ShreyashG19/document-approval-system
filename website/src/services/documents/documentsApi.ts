import axios from 'axios'
import { useQuery } from '@tanstack/react-query'

export interface DocumentItem {
  _id?: string
  id?: string
  title?: string
  fileUniqueName?: string
  status?: string
  createdBy?: string
  assignedTo?: string
  createdDate?: string
}

const fetchDocuments = async (params: Record<string, any>) => {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:5000'
  const resp = await axios.get(`${base}/api/file/get-documents`, {
    params,
    withCredentials: true,
  })

  // server may return data nested; attempt to normalize
  const body = resp.data
  return body?.data ?? body
}

export const useFetchDocuments = (opts: { status: string; department?: string; startDate?: string; endDate?: string; sortBy?: string; createdBy?: string; assignedTo?: string }) => {
  const { status, ...rest } = opts
  return useQuery({
    queryKey: ['documents', opts],
    queryFn: () => fetchDocuments({ status, ...rest }),
    enabled: Boolean(status),
    staleTime: 1000 * 60 * 1,
  })
}

export default fetchDocuments
