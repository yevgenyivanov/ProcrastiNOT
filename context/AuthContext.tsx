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
import { fetchCollabListsIds,fetchAllCollabLists} from "../api";
import * as Notifications from 'expo-notifications';
import { CollabList } from "@/utils/types";


interface AuthContextProps {
  userToken: string | null;
  triggerSync: number;
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
  const [triggerSync, setTriggerSync] = useState<number>(0);

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
  const establishEventServerConnection = async (userId: string | null, userToken: string | null): Promise<void> => {
    if (!userId) {
      console.error("User ID is null");
      return;
    }
    const socket = io("http://localhost:1234");
    // In Android/Windows:
    // const socket = io ("http://10.0.2.2:1234");
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

    socket.on("list-updated", ({ id }) => {
      console.log(`[EVENT] List ${id} updated`);
      setTriggerSync((prev) => prev + 1);
    });

    socket.on("random-item", ({ item,userId,collabListId }) => {
      showNotification(item,userId,collabListId);
    });

    if (serverEventSocket) {
      console.log(serverEventSocket);
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
    requestNotificationPremissions();
  }, []);

    const showNotification = async (item: string,userId: string, collabListId: string) => {
      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `🐡 ProcrastiNOT: ${collabListId}`,
            body: `🎲 ${userId} has drawn a random value: ${item} 🎲`,
            sound: true,
          },
          trigger: null, // Show immediately
        });
      } catch (error) {
        console.log("Notification error:", error);
      }
    };

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });

      async function requestNotificationPremissions() {
        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
    
        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
    
        if (finalStatus !== "granted") {
          alert("Failed to get push token for notifications!");
          return false;
        }
    
        return true;
      }
    

  return (
    <AuthContext.Provider
      value={{ userToken, triggerSync,storeToken, extractToken, clearUserToken, getUserObjectId, setUserObjectId, establishEventServerConnection, closeEventServerConnection }}
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
