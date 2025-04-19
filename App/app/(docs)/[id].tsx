import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function DocumentDetail() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const router = useRouter();

  const [remark, setRemark] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [docStatus, setDocStatus] = useState<'pending' | 'approved' | 'rejected' | 'corrected'>('pending');

  const documentName = 'Contract Agreement';

  const handleApprove = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setDocStatus('approved');
    setIsLoading(false);
  };

  const handleReject = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setDocStatus('rejected');
    setIsLoading(false);
  };

  const handleCorrect = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setDocStatus('corrected');
    setIsLoading(false);
  };

  const StatusBadge = () => {
    let bgColor = 'bg-yellow-100', textColor = 'text-yellow-800', statusText = 'Pending Review', icon = 'time-outline';

    if (docStatus === 'approved') {
      bgColor = 'bg-green-100'; textColor = 'text-green-800'; statusText = 'Approved'; icon = 'checkmark-circle-outline';
    } else if (docStatus === 'rejected') {
      bgColor = 'bg-red-100'; textColor = 'text-red-800'; statusText = 'Rejected'; icon = 'close-circle-outline';
    } else if (docStatus === 'corrected') {
      bgColor = 'bg-blue-100'; textColor = 'text-blue-800'; statusText = 'Correction Requested'; icon = 'create-outline';
    }

    return (
      <View className={`flex-row items-center ${bgColor} px-3 py-1 rounded-full`}>
        <Ionicons name={icon as any} size={16} color={textColor.replace('text-', '')} />
        <Text className={`${textColor} ml-1 font-medium`}>{statusText}</Text>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 pt-12 pb-4 bg-white border-b border-gray-200 flex-row justify-between items-center">
        <TouchableOpacity onPress={() => router.back()} className="p-1 rounded-full bg-gray-100">
          <Ionicons name="arrow-back" size={22} color="#374151" />
        </TouchableOpacity>
        <View className="flex-1 ml-3">
          <Text className="text-xl font-bold text-gray-800">{documentName}</Text>
          <Text className="text-sm text-gray-500">{`ID: ${id}`}</Text>
        </View>
        <StatusBadge />
      </View>

      <ScrollView className="flex-1">
        {/* Preview placeholder */}
        <View className="m-4 h-64 bg-gray-50 rounded-lg justify-center items-center border border-gray-200 shadow-sm">
          <Ionicons name="document-text-outline" size={48} color="#9CA3AF" />
          <Text className="text-gray-500 text-base mt-2">Document preview unavailable</Text>
          <TouchableOpacity className="mt-3 bg-blue-50 px-4 py-2 rounded-full flex-row items-center">
            <Ionicons name="download-outline" size={16} color="#3B82F6" />
            <Text className="text-blue-600 font-medium ml-1">Download</Text>
          </TouchableOpacity>
        </View>

        {/* Metadata */}
        <View className="mx-4 bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
          <Text className="font-semibold text-gray-800 mb-3">Document Information</Text>

          <View className="flex-row mb-2">
            <Text className="text-gray-500 w-24">Type:</Text>
            <Text className="text-gray-800 font-medium">Contract</Text>
          </View>

          <View className="flex-row mb-2">
            <Text className="text-gray-500 w-24">Submitted:</Text>
            <Text className="text-gray-800 font-medium">Apr 15, 2025</Text>
          </View>

          <View className="flex-row mb-2">
            <Text className="text-gray-500 w-24">Submitted by:</Text>
            <Text className="text-gray-800 font-medium">John Davis</Text>
          </View>

          <View className="flex-row">
            <Text className="text-gray-500 w-24">Priority:</Text>
            <View className="bg-orange-100 px-2 py-0.5 rounded">
              <Text className="text-orange-700 font-medium text-xs">High</Text>
            </View>
          </View>
        </View>

        {/* Approval actions – show only if status is pending */}
        {docStatus === 'pending' && (
          <View className="px-4 pb-6">
            <Text className="font-semibold text-gray-800 mb-2">Add Remark:</Text>
            <TextInput
              placeholder="Type your remark here..."
              value={remark}
              onChangeText={setRemark}
              multiline
              numberOfLines={4}
              className="border border-gray-200 rounded-lg px-3 py-3 mb-4 bg-gray-50 text-gray-800"
              editable={!isLoading}
            />

            <View className="flex-row space-x-3 mb-3">
              <TouchableOpacity
                className="flex-1 bg-white border border-green-600 rounded-lg py-3"
                onPress={handleApprove}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#16A34A" />
                ) : (
                  <View className="flex-row justify-center items-center">
                    <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
                    <Text className="text-green-600 font-bold ml-1">Approve</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 bg-white border border-red-600 rounded-lg py-3"
                onPress={handleReject}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#DC2626" />
                ) : (
                  <View className="flex-row justify-center items-center">
                    <Ionicons name="close-circle" size={18} color="#DC2626" />
                    <Text className="text-red-600 font-bold ml-1">Reject</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className="bg-white border border-blue-600 rounded-lg py-3"
              onPress={handleCorrect}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#2563EB" />
              ) : (
                <View className="flex-row justify-center items-center">
                  <Ionicons name="create" size={18} color="#2563EB" />
                  <Text className="text-blue-600 font-bold ml-1">Request Correction</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Final status feedback */}
        {docStatus !== 'pending' && (
          <View className="px-4 pb-10 items-center">
            <View className={`rounded-full p-4 ${
              docStatus === 'approved' ? 'bg-green-100' :
              docStatus === 'rejected' ? 'bg-red-100' : 'bg-blue-100'
            }`}>
              <Ionicons
                name={
                  docStatus === 'approved' ? 'checkmark-circle' :
                  docStatus === 'rejected' ? 'close-circle' : 'create'
                }
                size={32}
                color={
                  docStatus === 'approved' ? '#16A34A' :
                  docStatus === 'rejected' ? '#DC2626' : '#2563EB'
                }
              />
            </View>
            <Text className="text-lg font-bold mt-3 text-gray-800">
              {docStatus === 'approved' ? 'Document Approved' :
               docStatus === 'rejected' ? 'Document Rejected' : 'Correction Requested'}
            </Text>
            {remark && (
              <View className="bg-gray-50 p-3 rounded-lg mt-3 w-full border border-gray-200">
                <Text className="text-gray-500 font-medium">Your remark:</Text>
                <Text className="text-gray-800 mt-1">{remark}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
