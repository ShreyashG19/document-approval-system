import React from 'react';
import { Text, View } from 'react-native';

export const TabContentMap: Record<string, React.ReactNode> = {
  Pending: (
    <View>
      <Text className="text-gray-700">📄 Pending documents go here</Text>
    </View>
  ),
  Approved: (
    <View>
      <Text className="text-gray-700">✅ Approved documents here</Text>
    </View>
  ),
  Rejected: (
    <View>
      <Text className="text-gray-700">❌ Rejected ones</Text>
    </View>
  ),
  Correction: (
    <View>
      <Text className="text-gray-700">✏️ For correction</Text>
    </View>
  ),
};
