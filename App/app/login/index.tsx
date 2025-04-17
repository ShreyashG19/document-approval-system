import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';

const LoginSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
});

export default function LoginScreen() {
  const handleLogin = (values: { username: string; password: string }) => {
    console.log('Login values:', values);
    // Here you'll call your backend + FCM token logic
  };

  return (
    <View className="flex-1 justify-center bg-white px-6">
      <Text className="text-3xl font-bold text-blue-600 text-center mb-10">
        User Login
      </Text>

      <Formik
        initialValues={{ username: '', password: '' }}
        validationSchema={LoginSchema}
        onSubmit={handleLogin}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-2 text-base"
              placeholder="Username"
              placeholderTextColor="#aaa"
              onChangeText={handleChange('username')}
              onBlur={handleBlur('username')}
              value={values.username}
            />
            {errors.username && touched.username && (
              <Text className="text-red-500 text-sm mb-2">{errors.username}</Text>
            )}

            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-2 text-base"
              placeholder="Password"
              placeholderTextColor="#aaa"
              secureTextEntry
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              value={values.password}
            />
            {errors.password && touched.password && (
              <Text className="text-red-500 text-sm mb-4">{errors.password}</Text>
            )}

            <TouchableOpacity
              className="bg-blue-600 py-3 rounded-lg"
              onPress={handleSubmit as any}
            >
              <Text className="text-white text-center text-lg font-semibold">
                Login
              </Text>
            </TouchableOpacity>
          </>
        )}
      </Formik>
    </View>
  );
}
