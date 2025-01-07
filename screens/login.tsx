import React, { useState } from 'react';
import { View, Text } from 'react-native';
import ListComponent from '../components/list';

const LoginScreen = () => {
  return (
    <View style={{flex: 1}}>
      <Text>login screen</Text>
      <ListComponent
        title = 'list1' initialData={[
          { id: 1, text: 'Example Task 1', completed: false }
        ]}/>
    </View>
  );
};

export default LoginScreen;
