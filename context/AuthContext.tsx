import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
// import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from "expo-secure-store";
import { io, Socket } from "socket.io-client";
import { fetchCollabListsIds } from "../api";


interface AuthContextProps {
  userToken: string | null;
  storeToken: (token: string | null) => Promise<void>;
  extractToken: () => Promise<void>;
  clearUserToken: () => void;
  getUserObjectId: () => string | null;
  setUserObjectId: (id: string) => void;
  establishEventServerConnection: (userId: string | null,userToken: string | null) => Promise<void>;
  closeEventServerConnection: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [serverEventSocket, setServerEventSocket] = useState<Socket | null>(null);

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

  const getUserObjectId = ()  => {
    return userId;
  }

  const setUserObjectId = (id: string) => {
    setUserId(id);
  }

  const establishEventServerConnection = async (userId: string | null,userToken: string|null): Promise<void> => {
    if (!userId) {
      console.error("User ID is null");
      return;
    }
    const socket = io("http://localhost:1234");
    socket.on("connect", () => {
      console.log("🔌 Connected to server");
      socket.emit("say-hello", userId);
      fetchCollabListsIds(userToken).then((collabListIds) => {
        collabListIds.forEach((listId) => {
          socket.emit("event-list", listId);
        });
      });
      setServerEventSocket(socket);
    });
    if(serverEventSocket) {
      console.log(serverEventSocket)
      socket.on("connect_error", (err) => {
        console.error("Connection error:", err);

      });
    }
  };

  const closeEventServerConnection = () => {
    if (serverEventSocket) {
      serverEventSocket.disconnect();
      setServerEventSocket(null);
    }
  }

  useEffect(() => {
    extractToken();
  }, []);

  return (
    <AuthContext.Provider
      value={{ userToken, storeToken, extractToken, clearUserToken, getUserObjectId, setUserObjectId, establishEventServerConnection, closeEventServerConnection }}
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
