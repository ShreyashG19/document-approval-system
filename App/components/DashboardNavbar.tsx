import { View, Text, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  label?: string; // e.g. "Admin" or "Welcome"
  onProfilePress?: () => void;
  profileImage?: string; // optional custom profile pic
}

const DashboardNavbar = ({ label = 'Dashboard', onProfilePress, profileImage }: Props) => {
  return (
    <View className="flex-row justify-between items-center px-4 py-3 bg-white border-b border-gray-200">
      {/* Left Side: Label */}
      <Text className="text-lg font-bold text-gray-800">
        {label}
      </Text>

      {/* Right Side: Profile Icon */}
      <TouchableOpacity onPress={onProfilePress}>
        {profileImage ? (
          <Image
            source={{ uri: profileImage }}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <Ionicons name="person-circle-outline" size={32} color="#4B5563" />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default DashboardNavbar;
