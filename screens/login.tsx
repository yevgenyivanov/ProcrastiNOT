import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { registerUser, loginUser } from "../api";
import { useAuth } from "../context/AuthContext";
import { NavigationProp, ParamListBase } from '@react-navigation/native';

import * as Google from "expo-auth-session/providers/google";
import * as AuthSession from 'expo-auth-session';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { makeRedirectUri } from 'expo-auth-session';
console.log(makeRedirectUri());

interface LoginScreenProps {
  navigation: NavigationProp<ParamListBase>;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  //email login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { userToken, storeToken, getUserObjectId, setUserObjectId, establishEventServerConnection } = useAuth();

  //google auth login -----------------------------------------------------------------------------
  const [token, setToken] = useState("");
  const [userInfo, setUserInfo] = useState(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "24654489274-3s0s4l7asm2rdgegc5mchg38kuulmjh8.apps.googleusercontent.com",
    iosClientId: "tbp",
    
    // webClientId: "",
    
  });

  const handleLogin = () => {
    loginUser(email, password)
      .then((response) => {
        console.log("Login successful", response.token);
        console.log("User ID:", response.userID);
        storeToken(response.token);
        setUserObjectId(response.userID);
        establishEventServerConnection(response.userID, response.token);
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


  // If a user token is obtained, navigate to the Home screen
  useEffect(() => {
    if (userToken) {
      navigation.navigate("Home");
    }
  }, [userToken]);

  //****************************************************************************************************** */
  // GOOGLE
  // If a google user token is obtained navigate to Home
  useEffect(() => {
    handleGoogleSignIn()
  }, [response, token]);

  async function handleGoogleSignIn() {
    const user = await getLocalUser();
    console.log("user", user);
    if (!user) {
      if (response?.type === "success") {
        // setToken(response.authentication.accessToken);
        getUserInfo(response.authentication.accessToken);
        // setEmail(user.email);
        // setPassword(user.email);
        // handleRegister();
        // handleLogin();
      }
    } else { // already signedin
      setUserInfo(user);
      console.log("loaded locally");
      // setEmail(user.email);
      // setPassword(user.email);
      // handleRegister();
      // handleLogin();
    }
      setEmail(user.email);
      setPassword(user.email);
      handleRegister();
      handleLogin();
  }

  // debug func
  const getLocalUser = async () => {
    const data = await AsyncStorage.getItem("@user");
    if (!data) return null;
    return JSON.parse(data);
  };

  const getUserInfo = async (token) => {
    if (!token) return;
    try {
      const response = await fetch(
        "https://www.googleapis.com/userinfo/v2/me",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const user = await response.json();
      await AsyncStorage.setItem("@user", JSON.stringify(user));
      setUserInfo(user);
    } catch (error) {
      // Add your own error handler here
    }
  };

  

  return (
    <View style={styles.container} testID="login-screen">
      <Text style={styles.title}>ProcrastiNOT</Text>
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
      <TouchableOpacity style={styles.button} onPress={handleLogin} testID="login-button">
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.registerButton]} onPress={handleRegister} testID="register-button">
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, {backgroundColor:"red"}]} disabled={!request} onPress={() => {promptAsync();}} testID="google-signup-button">
        <Text style={styles.buttonText}>Sign In with Google</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 32,
    color: "#333",
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#007BFF",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 16,
  },
  registerButton: {
    backgroundColor: "#28a745",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default LoginScreen;