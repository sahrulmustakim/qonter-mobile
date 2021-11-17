import React, { Component } from 'react';
import { HStack, Text, Center } from 'native-base';
import Colors from '../../styles/colors';

export default class HeaderNoBack extends Component {
  constructor(props) {
    super(props)
  }
  
	render() {
    return(
      <HStack bg={Colors.PRIMARY} px="1" py="2" justifyContent='space-between' alignItems='center'>
        <HStack space="1" alignItems='center'>
          <Center w="100%">
            <Text color="white" fontSize="20" fontWeight='bold'>{this.props.title}</Text>
          </Center>
        </HStack>
      </HStack>
    )
	}
}
