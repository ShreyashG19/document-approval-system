import React from 'react';
import DocumentList from '../DocumentList';

interface Props {
  query: string;
  userRole: 'admin' | 'approver' | 'assistant';
}

export default function ApprovedScreen({ query, userRole }: Props) {
  return <DocumentList status="approved" userRole={userRole} searchQuery={query} />;
}
