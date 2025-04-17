import { useLocalSearchParams } from 'expo-router';
import { View, Text } from 'react-native';

export default function HomeScreen() {
  const { username } = useLocalSearchParams();

  return (
    <View className="flex-1 justify-center items-center bg-white px-6">
      <Text className="text-2xl font-bold text-blue-600 mb-2">
        Welcome, {username} 👋
      </Text>
      <Text className="text-gray-600">You're now logged in.</Text>
    </View>
  );
}
