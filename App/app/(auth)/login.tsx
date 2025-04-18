import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Formik } from 'formik';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const router = useRouter();
  const { loginUser } = useAuth();

  const handleLogin = (values: { email: string; password: string }) => {
    const username = values.email.toLowerCase().trim();
    const password = values.password;
  
    if (!username || !password) {
      Alert.alert('Missing Fields', 'Please enter both username and password');
      return;
    }
  
    if (username === 'admin') {
      loginUser('admin');
      router.replace('/admin/dashboard');
    } else if (username === 'assistant') {
      loginUser('assistant');
      router.replace('/assistant/dashboard');
    } else if (username === 'approver') {
      loginUser('approver');
      router.replace('/approver/dashboard');
    } else {
      Alert.alert('Invalid Role', 'Allowed roles: admin, assistant, approver');
    }
  };
  

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center px-6">
        <Text className="text-3xl font-bold text-center mb-6">Login</Text>

        <Formik initialValues={{ email: '', password: '' }} onSubmit={handleLogin}>
          {({ handleChange, handleSubmit, values }) => (
            <>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
                placeholder="Username (admin, assistant, approver)"
                value={values.email}
                onChangeText={handleChange('email')}
                autoCapitalize="none"
              />
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 mb-6"
                placeholder="Password"
                secureTextEntry
                value={values.password}
                onChangeText={handleChange('password')}
              />
              <TouchableOpacity
                className="bg-blue-600 py-3 rounded-lg"
                onPress={() => handleSubmit()}
              >
                <Text className="text-white text-center font-semibold">Sign in</Text>
              </TouchableOpacity>
            </>
          )}
        </Formik>
      </View>
    </SafeAreaView>
  );
}
