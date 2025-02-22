import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
} from "react-native";
import { AbstractList, AbstractListItem } from "../utils/types";
import { updateExistingList } from "@/api";
import { useAuth } from "../context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";

// TODO: notifications, get random item can return completed item, list class

interface ListComponentProps {
  sourceList: AbstractList;
  updateAndSyncList: (updatedList: AbstractList, index: number) => void;
  listIndex: number;
}

const ListComponent: React.FC<ListComponentProps> = ({
  sourceList,
  listIndex,
  updateAndSyncList,
}) => {
  const [list, setList] = useState<AbstractList>(sourceList);
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

    const newList = AbstractList.fromPlainObject({
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
    const randomItem =
      filteredList[Math.floor(Math.random() * filteredList.length)];
    Alert.alert("Random Item", randomItem.text);
  };

  // Function to delete an item
  const deleteItem = (index: number) => {
    const updatedItems = [...list.items];
    updatedItems.splice(index, 1);
    const updatedList = AbstractList.fromPlainObject({
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
    const updatedList = AbstractList.fromPlainObject({
      ...list,
      items: updatedItems,
    });
    setList(updatedList);
    updateProgress(updatedItems);
    updateAndSyncList(updatedList, listIndex);
  };

  // Function to set notification frequency
  const setNotification = (frequency: string) => {
    setNotificationFrequency(frequency);
    Alert.alert("Notification Set", `Reminder set to: ${frequency}`);
  };

  return (
    <LinearGradient colors={["blue", "#fcb045"]} style={styles.container}>
      {isEditingTitle ? (
        <TextInput
          style={styles.title}
          value={list.title}
          onChangeText={(text) =>
            setList(AbstractList.fromPlainObject({ ...list, title: text }))
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
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Text style={styles.progress}>Progress: {progress.toFixed(1)}%</Text>
        {/* <TouchableOpacity style={styles.randomButton} onPress={getRandomItem}>
          <Text style={styles.buttonText}>Get Random Item</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => setNotification("Every Saturday")}
        >
          <Text style={styles.buttonText}>Set Weekly Notification</Text>
        </TouchableOpacity> */}
      </View>
      {/* Add Item Input */}

      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          backgroundColor: "white",
          borderRadius: 10,
          padding: 5,
          borderWidth: 1,
          borderColor: "lightgrey",
          marginBottom: 10,
        }}
      >
        <View style={{ flexDirection: "row" }}>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "flex-start",
              paddingLeft: 10,
            }}
          >
            <TextInput
              placeholder="New item..."
              keyboardType="default"
              onChangeText={setInputValue}
              value={inputValue}
            />
          </View>
          <TouchableOpacity
            onPress={() => addItem(inputValue)}
            style={{
              height: 40,
              paddingHorizontal: 15,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "blue",
              borderRadius: 10,
              marginRight: 5,
            }}
          >
            <Text style={{ color: "white" }}>Add</Text>
          </TouchableOpacity>
        </View>
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
    marginBottom: 20,
  },
  progress: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "white",
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
    borderBottomColor: "white",
    
  },
  itemText: {
    fontSize: 16,
    color: "white",
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
});

export default ListComponent;
