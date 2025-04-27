// DocumentCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

interface Props {
  title: string;
  status: string;
  uploadedBy: string;
  uploadDate: Date;
  onPreview: () => void;
  onDownload: () => void;
}

const statusColors: Record<string, string> = {
  pending: '#F59E0B',
  approved: '#22C55E',
  rejected: '#EF4444',
  correction: '#3B82F6',
};

const statusIcons: Record<string, string> = {
  pending: 'time-outline',
  approved: 'checkmark-circle-outline',
  rejected: 'close-circle-outline',
  correction: 'alert-circle-outline',
};

export default function DocumentCard({
  title,
  status,
  uploadedBy,
  uploadDate,
  onPreview,
  onDownload
}: Props) {
  const formattedDate = format(uploadDate, 'MMM d, yyyy');

  return (
    <View className="mb-4 p-4 bg-white rounded-lg shadow-md border border-gray-100">
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-base font-bold text-gray-900 flex-1">{title}</Text>
        <View
          className="px-2 py-1 rounded-full flex-row items-center"
          style={{ backgroundColor: `${statusColors[status]}20` }}
        >
          <Ionicons
            name={(statusIcons[status] || 'document-outline') as keyof typeof Ionicons.glyphMap}
            size={16}
            color={statusColors[status] || '#6B7280'}
          />
          <Text
            className="text-xs font-semibold ml-1"
            style={{ color: statusColors[status] || '#6B7280' }}
          >
            {status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center mb-3">
        <Ionicons name="person-outline" size={14} color="#6B7280" />
        <Text className="text-xs text-gray-500 ml-1">
          Uploaded by <Text className="font-medium">{uploadedBy}</Text>
        </Text>
        <View className="h-3 w-px bg-gray-300 mx-2" />
        <Ionicons name="calendar-outline" size={14} color="#6B7280" />
        <Text className="text-xs text-gray-500 ml-1">{formattedDate}</Text>
      </View>

      <View className="h-px bg-gray-100 my-2" />

      <View className="flex-row justify-between mt-2">
        <TouchableOpacity
          onPress={onPreview}
          className="flex-1 py-2 flex-row justify-center items-center space-x-1 rounded-l-md  "
        >
          <Ionicons name="eye-outline" size={18} color="#2563EB" />
          <Text className="text-blue-600 font-medium">Preview</Text>
        </TouchableOpacity>

        <View className="w-px bg-white" />

        <TouchableOpacity
          onPress={onDownload}
          className="flex-1 py-2 flex-row justify-center items-center space-x-1 rounded-r-md bg-green-50"
        >
          <Ionicons name="download-outline" size={18} color="#22C55E" />
          <Text className="text-green-600 font-medium">Download</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}