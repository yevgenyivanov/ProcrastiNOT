import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Alert, 
  StyleSheet 
} from 'react-native';

// TODO: progress state issue , notifications, pressing completed again should uncomplete, get random item can return completed item, list class

const ListComponent = ({title, initialData}) => {
  const [list, setList] = useState(initialData || []);
  const [inputValue, setInputValue] = useState('');
  const [progress, setProgress] = useState(0);
  const [creationDate] = useState(new Date());
  const [notificationFrequency, setNotificationFrequency] = useState(null);

  // Helper Functions
  const calculateProgress = (newList: any) => {
    if(!newList) return 0;
    const completedCount = newList.filter(item => item.completed).length;
    return newList.length ? (completedCount / newList.length) * 100 : 0;
  };

  const updateProgress = (newList: any) => {
    setProgress(calculateProgress(newList));
  };

  // Function to add an item
  const addItem = (text) => {
    if (text.trim() === '') {
      Alert.alert('Error', 'Item cannot be empty!');
      return;
    }
    const newItem = { id: Date.now(), text, completed: false };
    const newList = [...list, newItem];
    setList(newList); 
    setInputValue('');
    updateProgress(list);
  };

  // Function to get a random item
  const getRandomItem = () => {
    if (list.length === 0) {
      Alert.alert('Info', 'No items in the list!');
      return;
    }
    const randomItem = list[Math.floor(Math.random() * list.length)];
    Alert.alert('Random Item', randomItem.text);
  };

  // Function to delete an item
  const deleteItem = (id) => {
    const updatedList = list.filter(item => item.id !== id);
    setList(updatedList);
    updateProgress(updatedList);
  };

  // Function to mark an item as completed
  const markAsCompleted = (id) => {
    const updatedList = list.map(item =>
      item.id === id ? { ...item, completed: true } : item
    );
    setList(updatedList);
    updateProgress(updatedList);
  };

  // Function to set notification frequency
  const setNotification = (frequency) => {
    setNotificationFrequency(frequency);
    Alert.alert('Notification Set', `Reminder set to: ${frequency}`);
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>To-Do List</Text>
      <Text style={styles.subTitle}>Created on: {creationDate.toLocaleDateString()}</Text>
      <Text style={styles.progress}>
        Progress: {progress.toFixed(1)}%
      </Text>
      
      {/* Add Item Input */}

      <TextInput
        style={styles.input}
        placeholder="Add a new item"
        value={inputValue}
        onChangeText={setInputValue}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => addItem(inputValue)}
      >
        <Text style={styles.buttonText}>Add Item</Text>
      </TouchableOpacity>

      {/* List of Items */}
      <FlatList
        data={list}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={item.completed ? styles.completedItem : styles.itemText}>
              {item.text}
            </Text>
            <TouchableOpacity onPress={() => markAsCompleted(item.id)}>
              <Text style={styles.actionText}>✔️</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteItem(item.id)}>
              <Text style={styles.actionText}>❌</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Action Buttons */}
      <TouchableOpacity style={styles.randomButton} onPress={getRandomItem}>
        <Text style={styles.buttonText}>Get Random Item</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.notificationButton}
        onPress={() => setNotification('Every Saturday')}
      >
        <Text style={styles.buttonText}>Set Weekly Notification</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    color: '#555',
    fontWeight: 'bold',
    // marginBottom: 10,
  },
  subTitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 20,
  },
  progress: {
    fontSize: 16,
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#6200ee',
    color: 'black',
    borderWidth: 1,
    borderRadius: 5,
    // padding: 10,
    marginBottom: 10,
  },
  addButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6200ee',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 12,
    color: 'black',
    fontWeight: 'bold',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  itemText: {
    fontSize: 16,
    color: '#1e252b',
  },
  completedItem: {
    fontSize: 16,
    textDecorationLine: 'line-through',
    color: '#aaa',
  },
  actionText: {
    fontSize: 20,
    marginHorizontal: 5,
    color: '#1e252b',
  },
  randomButton: {
    backgroundColor: '#03dac6',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  notificationButton: {
    backgroundColor: '#ff5722',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  textBlack:{
    color: '#000'
  }
});

export default ListComponent;
