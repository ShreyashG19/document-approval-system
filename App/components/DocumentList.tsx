import React from 'react';
import { ScrollView, View, Text, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import DocumentCard from './DocumentCard';
import { router, useRouter } from 'expo-router';

interface Document {
  id: string;
  title: string;
  url: string;
  status: 'pending' | 'approved' | 'rejected' | 'correction';
}

interface Props {
  status: 'pending' | 'approved' | 'rejected' | 'correction';
  userRole: 'admin' | 'approver' | 'assistant';
  searchQuery?: string;
}

export default function DocumentList({ status, userRole, searchQuery = '' }: Props) {
  const dummyPdf = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

  const dummyDocs: Document[] = Array.from({ length: 10 }, (_, i) => ({
    id: `${userRole}-${status}-${i + 1}`,
    title: `${status.toUpperCase()} Document ${i + 1}`,
    url: dummyPdf,
    status,
  }));

  const filteredDocs = dummyDocs.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // components/DocumentList.tsx
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

  return (
    <ScrollView className="flex-1 px-4 pt-4 bg-white">
      {filteredDocs.length === 0 ? (
        <View className="items-center mt-12">
          <Text className="text-gray-500 text-base">No documents found.</Text>
        </View>
      ) : (
        filteredDocs.map((doc) => (
          <DocumentCard
            key={doc.id}
            title={doc.title}
            status={doc.status}
            onPreview={() => handlePreview(doc.url)}
            onDownload={() => handleDownload(doc.url, doc.title)}
          />
        ))
      )}
    </ScrollView>
  );
}
