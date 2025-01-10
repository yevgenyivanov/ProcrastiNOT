import React from 'react';
import { View, Text, Button } from 'react-native';
import ListComponent from '../components/list';
import { AbstractList,AbstractListItem } from '../utils/types';
import {useAuth} from '../context/AuthContext';

const HomeScreen = () => {

  const {clearUserToken} = useAuth();

  const testItem1 = new AbstractListItem('item 1');
  const testItem2 = new AbstractListItem('item 2');
  const testItem3 = new AbstractListItem('item 3');
  const testList = new AbstractList('testList');
  testList.items.push(testItem1);
  testList.items.push(testItem2);
  testList.items.push(testItem3);

  return (
    <View style={{justifyContent:'center',alignItems:'center',flex:1}}>
      <Text>home screen</Text>
      <Button title="Logout" onPress={clearUserToken}/>
      <ListComponent
        importedList={testList}/>
    </View>
  );
};

export default HomeScreen;