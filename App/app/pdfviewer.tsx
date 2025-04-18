// components/PdfViewer.tsx
import { useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';

export default function PdfViewer() {
  const { url } = useLocalSearchParams();
  
  return (
    <WebView 
      source={{ uri: `https://docs.google.com/gview?embedded=true&url=${url}` }}
      style={{ flex: 1 }}
    />
  );
}