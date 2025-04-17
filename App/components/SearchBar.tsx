import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  onSearchPress?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search documents...',
  onClear,
  onSearchPress,
}) => {
  return (
    <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2 mb-4">
      <Ionicons name="search-outline" size={20} color="#6B7280" />

      <TextInput
        className="flex-1 ml-2 text-gray-800"
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#9CA3AF"
      />

      {value.length > 0 && (
        <TouchableOpacity onPress={onClear}>
          <Ionicons name="close-circle" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      )}

      {onSearchPress && (
        <TouchableOpacity onPress={onSearchPress}>
          <Ionicons name="arrow-forward-circle" size={22} color="#2563EB" className="ml-2" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SearchBar;
