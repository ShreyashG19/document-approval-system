// src/pages/documents/DocumentPage.jsx
import { useParams } from 'react-router-dom'

const DocumentPage = ({ status }: { status?: string }) => {
    const params = useParams()
    const pageStatus = status ?? (params as any).status ?? 'All'

    return (
        <div>
            <h2 className="text-lg font-semibold mb-4">{pageStatus} Documents</h2>
            <p className="text-sm text-muted-foreground">Document fetching is temporarily disabled.</p>
        </div>
    )
}

export default DocumentPage
