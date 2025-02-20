import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { registerUser, loginUser } from "../api";
import { useAuth } from "../context/AuthContext";
import { NavigationProp, ParamListBase } from '@react-navigation/native';

interface LoginScreenProps {
  navigation: NavigationProp<ParamListBase>;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { userToken, storeToken, getUserObjectId, setUserObjectId, establishEventServerConnection } = useAuth();

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
      <TouchableOpacity style={[styles.button, {backgroundColor:"red"}]} onPress={() => Alert.alert("Sign Up with Google")} testID="google-signup-button">
        <Text style={styles.buttonText}>Sign Up with Google</Text>
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