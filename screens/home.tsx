import React, { useEffect, useState } from "react";
import { View, Text, Button, SafeAreaView, FlatList, StyleSheet } from "react-native";
import ListComponent from "../components/ListComponent";
import CollabListComponent from "../components/CollabListComponent";
import { AbstractList, AbstractListItem, CollabList } from "../utils/types";
import { useAuth } from "../context/AuthContext";
import {
  fetchAllLists,
  createList,
  updateExistingList,
  createCollabList,
  fetchAllCollabLists,
  updateCollabList,
} from "@/api";
import { ScrollView } from "react-native-gesture-handler";
import { create, get } from "axios";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import { io } from "socket.io-client";
import JoinCollabListSection from "../components/JoinCollabListSection";
interface HomeScreenProps {
  navigation: NavigationProp<ParamListBase>;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { userToken, clearUserToken, closeEventServerConnection, triggerSync } =
    useAuth();
  const [lists, setLists] = useState<AbstractList[]>([]);
  const [collabLists, setCollabLists] = useState<CollabList[]>([]);
  const [showJoinCollabListField, setShowJoinCollabListField] = useState<boolean>(false);

  const fetchUserLists = async () => {
    try {
      const [newLists, newCollabLists] = await Promise.all([
        fetchAllLists(userToken),
        fetchAllCollabLists(userToken),
      ]);
      
      setLists(newLists.map((list) => AbstractList.parseMongoDBObject(list)));
      const newnewCollabLists = newCollabLists.map((list) => CollabList.parseMongoDBObject(list));

      setCollabLists([...newnewCollabLists]);
    } catch (error) {
      console.error(error);
    }
  };

  
  const handleSyncCollabList = (updatedList: CollabList, index: number) => {
    if (index >= collabLists.length || index < 0) return;
    //Handles the new update on the clientside and then sends the update to the server so the rest of the users can sync..
    setCollabLists((prevLists) => {
      const newLists = [...prevLists];
      newLists[index] = updatedList;
      if (newLists[index].id) {
        // If the list has a MongoDB ID, we send an API request to update the list
        // and then update the state to represent the updated list
        updateCollabList(
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

  const handleSyncAbstractList = (updatedList: AbstractList, index: number) => {
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

  const createNewCollabList = () => {
    createCollabList(userToken, "New Collab List").then(() => fetchUserLists());
  };

  const handleLogOut = () => {
    clearUserToken();
    closeEventServerConnection();
    navigation.navigate("Login");
  };

  useEffect(() => {
    if (!userToken) {
      navigation.navigate("Login");
      return;
    }
    setCollabLists([]); //Without this, it doesnt render properly.
    fetchUserLists();
  }, [userToken, triggerSync]);
  
  const handleJoinCollabList = async (newCategory: string) => {
    //<api_call_to_join_collab_list>.then(() => fetchUserLists());
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navbar}>
      <Text style={{fontSize: 20,textAlign:'center'}}>Good Evening, Bob!</Text>
      <View style={{flexDirection: 'row', justifyContent: 'space-between',paddingTop: 10}}>
      <Button title="Logout" onPress={handleLogOut} />
      <Button title="Join a Collab List" onPress={() => setShowJoinCollabListField(!showJoinCollabListField)}/>
      </View>
      </View>
      <JoinCollabListSection
        onSubmit={handleJoinCollabList}
        isVisible={showJoinCollabListField}
      />
      <ScrollView style={{ width: '100%' }}>
      <Text style={{textAlign: 'left', fontSize: 20, fontWeight: 'bold', marginBottom: 10}}>
        My Personal Lists
      </Text>
      <Button title="+ Create Personal List" onPress={createNewList} />
      {lists.map((item, index) => (
        <ListComponent
        key={item.id || index.toString()}
        listIndex={index}
        sourceList={item}
        updateAndSyncList={handleSyncAbstractList}
        />
      ))}
        <Text style={{textAlign: 'left', fontSize: 20, fontWeight: 'bold', marginBottom: 10,marginTop: 20}}>
        My Collaborative Lists
      </Text>
      <Button title="+ Create Collaborative list" onPress={createNewCollabList} />
      {collabLists.map((item, index) => (
        <CollabListComponent
        key={item.id || index.toString()}
        listIndex={index}
        sourceList={item}
        updateAndSyncList={handleSyncCollabList}
        />
      ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    margin: 20,
  },
  navbar: {
    flexDirection: "column",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
});

export default HomeScreen;