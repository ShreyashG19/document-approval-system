import { useRouter } from 'expo-router';
import { View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { Formik } from 'formik';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (values: { username: string; password: string }) => {
    const user = values.username.toLowerCase().trim();

    if (user === 'admin') router.push('/admin/dashboard');
    else if (user === 'assistant') router.push('/assistant/dashboard');
    else if (user === 'approver') router.push('/approver/dashboard');
    else Alert.alert('Invalid User', 'Please enter: admin, assistant, or approver');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center px-6">
        {/* Logo or app icon */}
        <View className="items-center mb-10">
          <View className="bg-blue-600 p-4 rounded-2xl">
            <Text className="text-white text-3xl font-bold">DA</Text>
          </View>
        </View>

        {/* Heading */}
        <Text className="text-2xl font-bold text-center text-black mb-1">
          Log in to MyApp
        </Text>
        <Text className="text-center text-gray-500 mb-8">
          Access your dashboard securely
        </Text>

        {/* Form */}
        <Formik
          initialValues={{ username: '', password: '' }}
          onSubmit={handleLogin}
          validate={(values) => {
            const errors: { username?: string; password?: string } = {};
            if (!values.username) errors.username = 'username is required';
            if (!values.password) errors.password = 'Password is required';
            return errors;
          }}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <>
              <View className="mb-4">
                <Text className="text-black mb-1 ml-1">Username</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3"
                  placeholder="Admin"
                  onChangeText={handleChange('username')}
                  onBlur={handleBlur('username')}
                  value={values.username}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {touched.username && errors.username && (
                  <Text className="text-red-600 mt-1 ml-1 text-sm">{errors.username}</Text>
                )}
              </View>

              <View className="mb-6">
                <Text className="text-black mb-1 ml-1">Password</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3"
                  placeholder="••••••••"
                  secureTextEntry
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  value={values.password}
                />
                {touched.password && errors.password && (
                  <Text className="text-red-600 mt-1 ml-1 text-sm">{errors.password}</Text>
                )}
              </View>

              <TouchableOpacity
                onPress={() => handleSubmit()}
                className="bg-blue-600 rounded-lg py-3 mb-8"
              >
                <Text className="text-white text-center font-semibold text-base">Log in</Text>
              </TouchableOpacity>

              <View className="flex-row justify-center">
                <Text className="text-gray-500">Forget Password? </Text>
                <TouchableOpacity>
                  <Text className="text-blue-600 font-semibold">Contact Admin</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </Formik>
      </View>
    </SafeAreaView>
  );
}
