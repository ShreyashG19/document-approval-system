import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Menu } from 'react-native-paper';

interface Props {
  label?: string;
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (text: string) => void;
  onToggleSearch?: () => void;
  onNavigateToProfile?: () => void;
  onManageUsers?: () => void;
  onLogout?: () => void;
}

const DashboardNavbar = ({
  label = 'Dashboard',
  showSearch,
  searchValue,
  onSearchChange,
  onToggleSearch,
  onNavigateToProfile,
  onManageUsers,
  onLogout,
}: Props) => {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
      {/* Left: Menu */}
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <TouchableOpacity onPress={() => setMenuVisible(true)} className="mr-3">
            <Ionicons name="menu-outline" size={28} color="#4B5563" />
          </TouchableOpacity>
        }
        contentStyle={{
          backgroundColor: 'white', // Tailwind's gray-100
          borderRadius: 8,
          paddingVertical: 10,
          elevation: 4,
        }}
      >
        <Menu.Item onPress={onNavigateToProfile} title="Profile" />
        <Menu.Item onPress={onManageUsers} title="Manage Users" />
        <Menu.Item onPress={onLogout} title="Logout" />
      </Menu>

      {/* Center */}
      <View className="flex-1 mr-3">
        {showSearch ? (
          <TextInput
            value={searchValue}
            onChangeText={onSearchChange}
            autoFocus
            placeholder="Search documents..."
            className="bg-gray-100 px-4 py-2 rounded-md text-base text-gray-800"
            placeholderTextColor="#9CA3AF"
          />
        ) : (
          <Text className="text-lg font-bold text-gray-800">{label}</Text>
        )}
      </View>

      {/* Right: Search */}
      <TouchableOpacity onPress={onToggleSearch}>
        <Ionicons
          name={showSearch ? 'close-outline' : 'search-outline'}
          size={24}
          color="#4B5563"
        />
      </TouchableOpacity>
    </View>
  );
};

export default DashboardNavbar;
