// DocumentList.tsx
import React from 'react';
import { ScrollView, View, Text, Alert, ActivityIndicator } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DocumentCard from './DocumentCard';

interface Document {
  id: string;
  title: string;
  url: string;
  status: 'pending' | 'approved' | 'rejected' | 'correction';
  uploadedBy: string;
  uploadDate: Date;
}

interface Props {
  status: 'pending' | 'approved' | 'rejected' | 'correction';
  userRole: 'admin' | 'approver' | 'assistant';
  searchQuery?: string;
  isLoading?: boolean;
}

export default function DocumentList({ 
  status, 
  userRole, 
  searchQuery = '',
  isLoading = false
}: Props) {
  const dummyPdf = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

  // Generate random dates between the last 30 days
  const getRandomDate = () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    return new Date(thirtyDaysAgo.getTime() + Math.random() * (now.getTime() - thirtyDaysAgo.getTime()));
  };

  // Sample users based on role
  const users = [
    'John Smith',
    'Maria Garcia',
    'Alex Johnson',
    'Sarah Lee',
    'Mohammed Ali'
  ];

  const dummyDocs: Document[] = Array.from({ length: 10 }, (_, i) => ({
    id: `${userRole}-${status}-${i + 1}`,
    title: `${status.charAt(0).toUpperCase() + status.slice(1)} Document ${i + 1}`,
    url: dummyPdf,
    status,
    uploadedBy: users[Math.floor(Math.random() * users.length)],
    uploadDate: getRandomDate()
  }));

  const filteredDocs = dummyDocs.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePreview = (url: string) => {
    router.push({
      pathname: '/pdfviewer',
      params: { url },
    });
  };

  const handleDownload = async (url: string, title: string) => {
    try {
      const filename = `${title.replace(/\s+/g, '_')}.pdf`;
      const downloadUrl = `${FileSystem.documentDirectory}${filename}`;

      const { uri } = await FileSystem.downloadAsync(
        url,
        downloadUrl
      );

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Download complete', `File saved to: ${uri}`);
      }
    } catch (error) {
      Alert.alert('Download failed', 'Could not download the file');
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-500 mt-4">Loading documents...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      className="flex-1 px-4 pt-4 bg-gray-50" 
      showsVerticalScrollIndicator={false}
    >
      {filteredDocs.length === 0 ? (
        <View className="items-center justify-center py-16 bg-white rounded-lg shadow-sm border border-gray-100 mt-4">
          <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
          <Text className="text-gray-500 text-base mt-4">No documents found</Text>
          {searchQuery && (
            <Text className="text-gray-400 text-sm mt-1">
              Try adjusting your search criteria
            </Text>
          )}
        </View>
      ) : (
        <>
          <Text className="text-lg font-bold text-gray-800 mb-2 ml-1">
            {status.charAt(0).toUpperCase() + status.slice(1)} Documents 
            <Text className="text-gray-500 font-normal"> ({filteredDocs.length})</Text>
          </Text>
          {filteredDocs.map((doc) => (
            <DocumentCard
              key={doc.id}
              title={doc.title}
              status={doc.status}
              uploadedBy={doc.uploadedBy}
              uploadDate={doc.uploadDate}
              onPreview={() => handlePreview(doc.url)}
              onDownload={() => handleDownload(doc.url, doc.title)}
            />
          ))}
        </>
      )}
      <View className="h-4" />
    </ScrollView>
  );
}