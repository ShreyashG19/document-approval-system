import React from 'react';
import DocumentList from '../DocumentList';

interface Props {
  query: string;
  userRole: 'admin' | 'approver' | 'assistant';
}

export default function PendingScreen({ query, userRole }: Props) {
  return <DocumentList status="pending" userRole={userRole} searchQuery={query} />;
}
