import { ScrollView, Text, View } from 'react-native';

export default function PendingScreen({ query }: { query: string }) {
  return (
    <ScrollView className="flex-1 bg-white px-4 pt-4">
      <Text className="text-gray-500 mb-2">Filtering for: {query}</Text>

      {/* Replace this with filtered document list */}
      <Text className="text-gray-800">📄 Document 1</Text>
      <Text className="text-gray-800">📄 Document 2</Text>
    </ScrollView>
  );
}
