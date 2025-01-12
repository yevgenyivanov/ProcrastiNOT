import React, { useState,useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { registerUser, loginUser } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { NavigationProp, ParamListBase } from '@react-navigation/native';

interface LoginScreenProps {
  navigation: NavigationProp<ParamListBase>;
}

const LoginScreen: React.FC<LoginScreenProps> = ({navigation}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { userToken, storeToken } = useAuth();

  const handleLogin = () => {
    loginUser(email, password)
      .then((response) => {
        console.log("Login successful", response);
        storeToken(response.token);
      })
      .catch((error) => {
        console.error("Login failed", error);
      });
  };

  const handleRegister = () => {
    registerUser(email, password)
      .then((response) => {
        console.log("Registration successful", response);
      })
      .catch((error) => {
        console.error("Registration failed", error);
      });
  };

  //If a user token is obtained, navigate to the Home screen
  useEffect(() => {
    if (userToken) {
      navigation.navigate("Home");
    };
  }, [userToken]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
      <Button title="Register" onPress={handleRegister} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
});

export default LoginScreen;
