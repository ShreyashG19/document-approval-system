import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Platform, Linking } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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
  name = 'Sahil Makandar',
  email = 'sahilmakandar15@gmail.com',
  role = 'Admin',
  gender = 'Male',
  birthDate = '1/23/2005',
  mobile = '+91-9579891114',
  country = 'India',
  zipCode = '416 410',
  onBack,
}: Props) {
  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!name) return '';
    return name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Get role badge color
  const getRoleBadgeColor = (): [string, string] => {
    switch (role?.toLowerCase()) {
      case 'admin': return ['#EF4444', '#DC2626']; 
      case 'approver': return ['#3B82F6', '#2563EB'];
      case 'assistant': return ['#10B981', '#059669'];
      default: return ['#F59E0B', '#D97706'];
    }
  };

  const handleCallUser = () => {
    if (mobile) {
      Linking.openURL(`tel:${mobile.replace(/[-\s]/g, '')}`);
    }
  };

  const handleWhatsAppUser = () => {
    if (mobile) {
      Linking.openURL(`https://wa.me/${mobile.replace(/[-\s]/g, '')}`);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header with gradient background */}
      <LinearGradient
        colors={['#1E40AF', '#3B82F6']}
        className="pt-12 pb-6 px-6"
      >
        <View className="flex-row justify-between items-center mb-6">
          <TouchableOpacity 
            onPress={onBack}
            className="bg-white/20 rounded-full p-2"
          >
            <Ionicons name="arrow-back-outline" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* User Avatar */}
        <View className="items-center mb-2">
          <View className="bg-white p-1 rounded-full">
            <View className="w-28 h-28 rounded-full bg-blue-100 items-center justify-center overflow-hidden">
              <Text className="text-3xl font-bold text-blue-600">
                {getUserInitials()}
              </Text>
            </View>
          </View>
          
          <Text className="text-xl font-bold text-white mt-4">{name}</Text>
          <View className="flex-row items-center mt-1">
            <LinearGradient
              colors={getRoleBadgeColor()}
              start={[0, 0]}
              end={[1, 0]}
              className="px-3 py-1 rounded-full flex-row items-center mt-1"
            >
              <Ionicons 
                name={role?.toLowerCase() === 'admin' ? 'shield-checkmark' : 'person'} 
                size={12} 
                color="#fff" 
              />
              <Text className="text-xs font-medium text-white ml-1">
                {role}
              </Text>
            </LinearGradient>
          </View>
        </View>
      </LinearGradient>

      {/* Quick Actions */}
      <View className="flex-row justify-around -mt-6 mx-6 mb-4">
        <TouchableOpacity 
          onPress={handleCallUser}
          className="bg-white rounded-xl py-3 px-6 items-center shadow-sm"
          style={{ 
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
          }}
        >
          <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mb-1">
            <Ionicons name="call-outline" size={20} color="#3B82F6" />
          </View>
          <Text className="text-xs font-medium text-gray-800">Call</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={handleWhatsAppUser}
          className="bg-white rounded-xl py-3 px-6 items-center shadow-sm"
          style={{ 
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
          }}
        >
          <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mb-1">
            <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
          </View>
          <Text className="text-xs font-medium text-gray-800">WhatsApp</Text>
        </TouchableOpacity>
      </View>

      {/* Personal Information Card (Non-editable) */}
      <View className="bg-white rounded-xl mx-6 p-5 mb-4 shadow-sm">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold text-gray-800">Personal Information</Text>
        </View>

        {/* User Info Grid */}
        <View className="space-y-4">
          {/* Mobile */}
          <View className="flex-row border-b border-gray-100 pb-3">
            <View className="w-10 h-10 rounded-lg bg-blue-50 items-center justify-center mr-3">
              <Ionicons name="call-outline" size={18} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <Text className="text-sm text-gray-500">Mobile Number</Text>
              <Text className="text-base font-semibold text-gray-900">{mobile}</Text>
            </View>
          </View>

          {/* Birth Date */}
          <View className="flex-row border-b border-gray-100 pb-3">
            <View className="w-10 h-10 rounded-lg bg-blue-50 items-center justify-center mr-3">
              <Ionicons name="calendar-outline" size={18} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <Text className="text-sm text-gray-500">Birth Date</Text>
              <Text className="text-base font-semibold text-gray-900">{birthDate}</Text>
            </View>
          </View>

          {/* Gender */}
          <View className="flex-row border-b border-gray-100 pb-3">
            <View className="w-10 h-10 rounded-lg bg-blue-50 items-center justify-center mr-3">
              <Ionicons name="person-outline" size={18} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <Text className="text-sm text-gray-500">Gender</Text>
              <Text className="text-base font-semibold text-gray-900">{gender}</Text>
            </View>
          </View>

          {/* Location */}
          <View className="flex-row">
            <View className="w-10 h-10 rounded-lg bg-blue-50 items-center justify-center mr-3">
              <Ionicons name="location-outline" size={18} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <Text className="text-sm text-gray-500">Location</Text>
              <Text className="text-base font-semibold text-gray-900">{country}, {zipCode}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Account Settings Card */}
      <View className="bg-white rounded-xl mx-6 p-5 mb-6 shadow-sm">
        <Text className="text-lg font-bold text-gray-800 mb-4">Account Settings</Text>
        
        <TouchableOpacity className="flex-row items-center justify-between py-3 border-b border-gray-100">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-lg bg-green-50 items-center justify-center mr-3">
              <Ionicons name="notifications-outline" size={18} color="#10B981" />
            </View>
            <Text className="text-base font-medium text-gray-800">Notifications</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
        
        <TouchableOpacity className="flex-row items-center justify-between py-3">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-lg bg-red-50 items-center justify-center mr-3">
              <Ionicons name="log-out-outline" size={18} color="#EF4444" />
            </View>
            <Text className="text-base font-medium text-gray-800">Logout</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
      
      <View className="h-6" />
    </ScrollView>
  );
}
