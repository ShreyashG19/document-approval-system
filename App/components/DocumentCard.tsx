import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  title: string;
  status: string;
  onPreview: () => void;
  onDownload: () => void;
}

const statusColors: Record<string, string> = {
  pending: '#F59E0B',
  approved: '#22C55E',
  rejected: '#EF4444',
  correction: '#3B82F6',
};

export default function DocumentCard({ title, status, onPreview, onDownload }: Props) {
  return (
    <View className="mb-4 p-4 bg-white rounded-md shadow border border-gray-100">
      <Text className="text-base font-bold text-gray-900 mb-1">{title}</Text>
      <Text
        className="text-sm font-medium mb-2"
        style={{ color: statusColors[status] || '#6B7280' }}
      >
        Status: {status.toUpperCase()}
      </Text>

      <View className="flex-row space-x-6 mt-2">
        <TouchableOpacity onPress={onPreview} className="flex-row items-center space-x-1">
          <Ionicons name="eye-outline" size={18} color="#2563EB" />
          <Text className="text-blue-600 font-medium">Preview</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onDownload} className="flex-row items-center space-x-1">
          <Ionicons name="download-outline" size={18} color="#22C55E" />
          <Text className="text-green-600 font-medium">Download</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
