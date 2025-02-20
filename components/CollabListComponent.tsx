import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet
} from "react-native";
import { AbstractList, AbstractListItem, CollabList } from "../utils/types";
import { updateExistingList,updateRandomItem } from "@/api";
import { useAuth } from "../context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import * as Clipboard from 'expo-clipboard';


interface CollabListComponentProps {
  sourceList: CollabList;
  updateAndSyncList: (updatedList: CollabList, index: number) => void;
  listIndex: number;
}

const CollabListComponent: React.FC<CollabListComponentProps> = ({
  sourceList,
  listIndex,
  updateAndSyncList,
}) => {
  const [list, setList] = useState<CollabList>(sourceList);
  const [inputValue, setInputValue] = useState<string>("");
  const [date, setDate] = useState<Date | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [notificationFrequency, setNotificationFrequency] = useState<
    string | null
  >(null);
  const { userToken } = useAuth();
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);

  useEffect(() => {
    setDate(list.date);
    updateProgress(list.items);
  }, [list]);

  // Helper Functions
  const calculateProgress = (currentItems: AbstractListItem[]) => {
    if (!currentItems) return 0;
    const completedCount = currentItems.filter((item) => item.completed).length;
    return currentItems.length
      ? (completedCount / currentItems.length) * 100
      : 0;
  };

  const updateProgress = (currentItems: AbstractListItem[]) => {
    setProgress(calculateProgress(currentItems));
  };

  // Function to add an item
  const addItem = (text: string) => {
    if (text.trim() === "") {
      Alert.alert("Error", "Item cannot be empty!");
      return;
    }
    const newItem = new AbstractListItem(text);
    // const newList = [...list, newItem];

    const newList = CollabList.fromPlainObject({
      ...list,
      items: [...list.items, newItem],
    });
    setList(newList);
    setInputValue("");
    updateProgress(newList.items);
    updateAndSyncList(newList, listIndex);
  };

  // Function to get a random item
  const getRandomItem = () => {
    if (list.items.length === 0) {
      Alert.alert("Info", "No items in the list!");
      return;
    }
    const filteredList = list.items.filter((item) => !item.completed);
    if (filteredList.length === 0) {
      Alert.alert("Info", "No items in filtered list!");
      return;
    }
    const randomItem = filteredList[Math.floor(Math.random() * filteredList.length)];
    return randomItem;
  };

  // Function to delete an item
  const deleteItem = (index: number) => {
    const updatedItems = [...list.items];
    updatedItems.splice(index, 1);
    const updatedList = CollabList.fromPlainObject({
      ...list,
      items: updatedItems,
    });
    setList(updatedList);
    updateProgress(updatedItems);
    updateAndSyncList(updatedList, listIndex);
  };

  // Function to mark an item as completed
  const markAsCompleted = (index: number) => {
    const updatedItems = [...list.items];
    updatedItems[index].completed = !updatedItems[index].completed;
    const updatedList = CollabList.fromPlainObject({
      ...list,
      items: updatedItems,
    });
    setList(updatedList);
    updateProgress(updatedItems);
    updateAndSyncList(updatedList, listIndex);
  };


  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
  };
  
  const handleRandomItem = () => {
    const randomItem = getRandomItem();

    if(!randomItem) return;
    if(!userToken) return;
    if(!list.id) return;
    updateRandomItem(userToken, list.id, randomItem.text);
  };

  return (
    <LinearGradient colors={["#833ab4", "#fcb045"]} style={styles.container}>
      {isEditingTitle ? (
        <TextInput
          style={styles.title}
          value={list.title}
          onChangeText={(text) =>
            setList(CollabList.fromPlainObject({ ...list, title: text }))
          }
          onBlur={() => {
            setIsEditingTitle(false);
            updateAndSyncList(list, listIndex);
          }}
          onSubmitEditing={() => {
            setIsEditingTitle(false);
            updateAndSyncList(list, listIndex);
          }}
          autoFocus
        />
      ) : (
        <TouchableOpacity onPress={() => setIsEditingTitle(true)}>
          <Text style={styles.title}>{list.title ? list.title : ""}</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.subTitle}>
        Created on: {date ? date.toLocaleDateString() : ""}
      </Text>
      <Text style={styles.subTitle}>
        Opened by: {list.owner ? list.owner : "Unknown"}{" "}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "flex-start",justifyContent:'flex-start'}}>
        <Text style={[styles.subTitle]}>
          Invite code: {list.id ? list.id : "Unknown"}{" "}
        </Text>
        <TouchableOpacity
          onPress={() => {
        if (list.id) {
          copyToClipboard(list.id);
        }
          }}
        >
          <Text style={styles.copyButton}>Copy</Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginTop: 15,
        }}
      >
        <Text style={styles.progress}>📊 Progress: {progress.toFixed(1)}%</Text>
        <TouchableOpacity
          onPress={() => {handleRandomItem()}}
        >
          <Text style={styles.copyButton}>🎲 Random Item</Text>
        </TouchableOpacity>
      </View>

      {/* Add Item Input */}
      <View style={{ flexDirection: "row" }}>
        <TextInput
          style={styles.input}
          placeholder="Add new item..."
          value={inputValue}
          onChangeText={setInputValue}
        />

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => addItem(inputValue)}
        >
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>
      {/* List of Items */}
      {list.items.map((item, index) => (
        <View key={index} style={styles.listItem}>
          <Text style={item.completed ? styles.completedItem : styles.itemText}>
            {item.text}
          </Text>
          <TouchableOpacity onPress={() => markAsCompleted(index)}>
            <Text style={styles.actionText}>✔️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteItem(index)}>
            <Text style={styles.actionText}>❌</Text>
          </TouchableOpacity>
        </View>
      ))}
    </LinearGradient>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    width: "100%",
    justifyContent: "center",
    flexDirection: "column",
    flex: 1,
    padding: 10,
    borderRadius: 20,
    marginVertical: 10,
  },
  title: {
    justifyContent: "center",
    alignItems: "center",
    fontSize: 24,
    color: "white",
    textAlign: "left",
    // marginBottom: 10,
  },
  subTitle: {
    fontSize: 14,
    color: "white",
    opacity: 0.5,
    marginBottom: 10,
  },
  progress: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: "lightgrey",
    textAlign: "left",
    paddingLeft: 10,
    color: "black",
    backgroundColor: "white",
    borderWidth: 1,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    // padding: 10,
    marginBottom: 10,
  },
  addButton: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    padding: 10,
  },
  buttonText: {
    fontSize: 15,
    color: "white",
    fontWeight: "bold",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "black",
  },
  itemText: {
    fontSize: 16,
    color: "#1e252b",
  },
  completedItem: {
    fontSize: 16,
    textDecorationLine: "line-through",
    color: "lightgreen",
  },
  actionText: {
    fontSize: 20,
    marginHorizontal: 5,
    color: "#1e252b",
  },
  randomButton: {
    backgroundColor: "#03dac6",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  notificationButton: {
    backgroundColor: "#ff5722",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  textBlack: {
    color: "#000",
  },
  copyButton: {
    color: "white",
    fontSize: 12,
    padding: 5,
    backgroundColor: "black",
    borderRadius: 5,
    marginLeft: 5,
  }
});

export default CollabListComponent;
