import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as SecureStore from 'expo-secure-store';
// import { setAuthToken } from './services/api';
import LoginScreen from './screens/login';
import HomeScreen from './screens/home';
import { ActivityIndicator, View } from 'react-native';

type RootStackParamList = {
  Login: undefined;
  Home: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userToken, setUserToken] = useState<string | null>(null);
  useEffect(() => {
    const checkToken = async () => {
      const token = await SecureStore.getItemAsync('userToken');
      if (token) {
        // setAuthToken(token); // Set token in API client
        setUserToken(token);
      }
      setTimeout(() => {
        setIsLoading(false);
      },3000);
    };

    checkToken();
  }, []);

  if (isLoading) {
    // Show a loading spinner while checking token
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {userToken ? (
          // User is authenticated
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: true }}
          />
        ) : (
          // User is not authenticated
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: true }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
