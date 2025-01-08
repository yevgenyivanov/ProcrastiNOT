import React, { useState } from 'react';
import { View, Text } from 'react-native';
import ListComponent from '../components/list';
import { AbstractList,AbstractListItem } from '../utils/types';

const LoginScreen = () => {
  const testItem1 = new AbstractListItem('item 1');
  const testItem2 = new AbstractListItem('item 2');
  const testItem3 = new AbstractListItem('item 3');
  const testList = new AbstractList('testList');
  testList.items.push(testItem1);
  testList.items.push(testItem2);
  testList.items.push(testItem3);

  return (
    <View style={{flex: 1}}>
      <Text>login screen</Text>
      <ListComponent
        importedList={testList}/>
    </View>
  );
};

export default LoginScreen;
