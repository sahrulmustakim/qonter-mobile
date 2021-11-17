import React, { Component } from 'react';
import { VStack, HStack, Button, IconButton, Icon, Text, Center, Box } from 'native-base';
import MaterialIcons from 'react-native-vector-icons/dist/MaterialIcons';
import { Actions } from 'react-native-router-flux';
import Colors from '../../styles/colors';

export default class HeaderBack extends Component {
  constructor(props) {
    super(props)
  }
  
	render() {
    return(
      <HStack bg={Colors.PRIMARY} px="1" py="2" justifyContent='space-between' alignItems='center'>
        <HStack space="2" alignItems='center'>
          <Center w="10">
            <IconButton 
              icon={
                <Icon size="sm" as={
                  <MaterialIcons name='arrow-back' />
                } 
                color="white" />
              } 
              _pressed={{
                bg: "white.600:alpha.20"
              }} 
              onPress={() => { Actions.pop() }} 
            />
          </Center>
          <Center w="80">
            <Text color="white" fontSize="20" fontWeight='bold'>{this.props.title}</Text>
          </Center>
        </HStack>
      </HStack>
    )
	}
}
