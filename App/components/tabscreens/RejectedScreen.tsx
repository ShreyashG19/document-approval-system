import React from 'react';
import DocumentList from '../DocumentList';

interface Props {
  query: string;
  userRole: 'admin' | 'approver' | 'assistant';
}

export default function RejectedScreen({ query, userRole }: Props) {
  return <DocumentList status="rejected" userRole={userRole} searchQuery={query} />;
}
