import { ScrollView } from 'react-native';
import DocumentList from '../DocumentList';

export default function PendingScreen({ query }: { query: string }) {
  return (
    <ScrollView className="flex-1 bg-white px-4 pt-4">
      <DocumentList status="pending" userRole="admin" searchQuery={query} />
    </ScrollView>
  );
}