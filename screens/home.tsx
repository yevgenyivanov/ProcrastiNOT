import React, { useEffect, useState } from 'react';
import { View, Text, Button, SafeAreaView, FlatList } from 'react-native';
import ListComponent from '../components/list';
import { AbstractList,AbstractListItem } from '../utils/types';
import {useAuth} from '../context/AuthContext';
import { fetchAllLists, addNewList,overrideAllLists } from '@/services/api';
import { ScrollView } from 'react-native-gesture-handler';

const HomeScreen = () => {

  const {userToken,clearUserToken} = useAuth();
  const [lists,setLists] = useState<AbstractList[]>([]);

  // const testItem1 = new AbstractListItem('item 1');
  // const testItem2 = new AbstractListItem('item 2');
  // const testItem3 = new AbstractListItem('item 3');
  // const testList = new AbstractList('testList');
  // testList.items.push(testItem1);
  // testList.items.push(testItem2);
  // testList.items.push(testItem3);

  // addNewList(userToken,'testList',[testItem1,testItem2,testItem3]);

  const getLists  = async () => {
    fetchAllLists(userToken).then((lists) => {
      const plainLists = lists.map(list => AbstractList.fromPlainObject(list));
      console.log(plainLists[0].title);
      console.log(plainLists[0].date);
      setLists(plainLists);
    }).catch((error) => {
      console.error(error);
    });
  }

  const saveLists = () => {
    console.log(lists[0].items);
    overrideAllLists(userToken, lists).then(response => {
      console.log(response);
    }).catch(error => {
      console.error(error);
    });
  }

  const updateList = (updatedList: AbstractList, index: number) => {
    setLists(prevLists => {
      const newLists = [...prevLists];
      newLists[index] = updatedList;
      console.log(newLists);
      return newLists;
    });
  };


  useEffect(() => {
    getLists();
  },[]);
  
  return (
    <SafeAreaView style={{justifyContent:'center',alignItems:'center',flex:1,margin: 20,}}>
      <Button title="Logout" onPress={clearUserToken}/>
      <Button title="Add List" onPress={() => addNewList(userToken,'New List',[]).then(() => getLists())}/>
      <Button title="Save Lists" onPress={() => saveLists()}></Button>
      <FlatList
        data={lists}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item,index }) => <ListComponent index={index} importedList={item} updateList={updateList}/>}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;