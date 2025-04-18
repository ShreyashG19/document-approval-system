import React from 'react';
import DocumentList from '../DocumentList';

interface Props {
  query: string;
  userRole: 'admin' | 'approver' | 'assistant';
}

export default function CorrectionScreen({ query, userRole }: Props) {
  return <DocumentList status="correction" userRole={userRole} searchQuery={query} />;
}
