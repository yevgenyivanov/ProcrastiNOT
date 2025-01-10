import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
// import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from "expo-secure-store";

interface AuthContextProps {
  userToken: string | null;
  storeToken: (token: string | null) => Promise<void>;
  extractToken: () => Promise<void>;
  clearUserToken: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [userToken, setUserToken] = useState<string | null>(null);

  const clearUserToken = () => {
    SecureStore.deleteItemAsync("userToken");
    setUserToken(null);
  };

  const extractToken = async () => {
    const token = await SecureStore.getItemAsync("userToken");
    if (token) {
      setUserToken(token);
    }
  };

  const storeToken = async (token: string | null) => {
    if (token) {
      await SecureStore.setItemAsync("userToken", token);
      setUserToken(token);
    }
  };

  useEffect(() => {
    extractToken();
  }, []);

  return (
    <AuthContext.Provider
      value={{ userToken, storeToken, extractToken, clearUserToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
