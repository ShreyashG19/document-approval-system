import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

interface Props {
  name?: string;
  email?: string;
  role?: string;
  gender?: string;
  birthDate?: string;
  mobile?: string;
  country?: string;
  zipCode?: string;
  onBack?: () => void;
}

export default function ProfileCard({
  name = 'Adom Shafi',
  email = 'hellobesnik@gmai.com',
  role = 'Admin',
  gender = 'Male',
  birthDate = '1/11/2000',
  mobile = '+880-1704-889-390',
  country = 'BD',
  zipCode = '5699',
  onBack,
}: Props) {
  return (
    <ScrollView className="flex-1 bg-white px-6 pt-12">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6">
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back-outline" size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">My Profile</Text>
        <View style={{ width: 24 }} /> {/* Empty space to balance */}
      </View>

      {/* Default Avatar */}
      <View className="items-center mb-6">
        <Ionicons name="person-circle-outline" size={96} color="#9CA3AF" />
      </View>

      {/* User Info */}
      <View className="space-y-5">
        {/* Name */}
        <View>
          <Text className="text-sm text-gray-500 mb-1">Name</Text>
          <Text className="text-base font-semibold text-gray-900">{name}</Text>
        </View>

        {/* Birth Date + Gender */}
        <View className="flex-row justify-between gap-4">
          <View className="flex-1">
            <Text className="text-sm text-gray-500 mb-1">Birth Date</Text>
            <Text className="text-base font-semibold text-gray-900">{birthDate}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-sm text-gray-500 mb-1">Gender</Text>
            <Text className="text-base font-semibold text-gray-900">{gender}</Text>
          </View>
        </View>

        {/* Email */}
        <View>
          <Text className="text-sm text-gray-500 mb-1">Email</Text>
          <View className="flex-row items-center space-x-2">
            <Text className="text-base font-semibold text-gray-900">{email}</Text>
            <MaterialIcons name="verified" size={18} color="#22C55E" />
          </View>
        </View>

        {/* Mobile */}
        <View>
          <Text className="text-sm text-gray-500 mb-1">Mobile</Text>
          <Text className="text-base font-semibold text-gray-900">{mobile}</Text>
        </View>

        {/* Country + Zip */}
        <View className="flex-row justify-between gap-4">
          <View className="flex-1">
            <Text className="text-sm text-gray-500 mb-1">Country</Text>
            <Text className="text-base font-semibold text-gray-900">{country}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-sm text-gray-500 mb-1">Zip Code</Text>
            <Text className="text-base font-semibold text-gray-900">{zipCode}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
