import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams } from 'expo-router';

export default function PdfViewer() {
  const { url } = useLocalSearchParams();

  if (!url) return null;

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <WebView
        source={{ uri: String(url) }}  // <- url already has full PDF.js viewer URL
        style={{ flex: 1 }}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
      />
    </View>
  );
}
