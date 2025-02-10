import React, { useEffect, useState } from "react";
import { View, Text, Button, SafeAreaView, FlatList } from "react-native";
import ListComponent from "../components/ListComponent";
import { AbstractList, AbstractListItem } from "../utils/types";
import { useAuth } from "../context/AuthContext";
import {
  fetchAllLists,
  createList,
  updateExistingList,
  createCollabList,
  fetchAllCollabLists,
} from "@/api";
import { ScrollView } from "react-native-gesture-handler";
import { create, get } from "axios";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import { io } from "socket.io-client";

interface HomeScreenProps {
  navigation: NavigationProp<ParamListBase>;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { userToken, clearUserToken,closeEventServerConnection } = useAuth();
  const [lists, setLists] = useState<AbstractList[]>([]);

  const fetchUserLists = async () => {
    fetchAllLists(userToken)
      .then((lists) => {
        const plainLists = lists.map((list) =>
          AbstractList.parseMongoDBObject(list)
        );
        setLists(plainLists);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const updateAndSyncList = (updatedList: AbstractList, index: number) => {
    if (index >= lists.length || index < 0) return;
    setLists((prevLists) => {
      const newLists = [...prevLists];
      newLists[index] = updatedList;
      if (newLists[index].id) {
        // If the list has a MongoDB ID, we send an API request to update the list
        // and then update the state to represent the updated list
        updateExistingList(
          userToken,
          newLists[index].id,
          newLists[index].title,
          newLists[index].items
        );
        return newLists;
      }
      return prevLists;
    });
  };

  const createNewList = () => {
    createList(userToken, "New List", []).then(() => fetchUserLists());
  };

  const handleLogOut = () => {
    clearUserToken();
    closeEventServerConnection();
    navigation.navigate("Login");
  };



  useEffect(() => {
    if(!userToken) {
      navigation.navigate("Login");
      return;
    };
    fetchUserLists();
  }, [userToken]);

  return (
    <SafeAreaView
      style={{
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
        margin: 20,
      }}
    >
      <Button title="Logout" onPress={handleLogOut} />
      <Button title="Add List" onPress={() => createNewList()} />
      <Button
        title="Create Collab list"
        onPress={() => createCollabList(userToken, "CollabList")}
      />
      <Button
        title="Fetch Collab Lists"
        onPress={() => fetchAllCollabLists(userToken)}
      />
      {/* <Button title="Save Lists" onPress={() => sync()}></Button> */}
      <FlatList
        data={lists}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <ListComponent
            listIndex={index}
            sourceList={item}
            updateAndSyncList={updateAndSyncList}
          />
        )}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;
