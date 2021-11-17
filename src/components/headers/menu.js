import React, { Component } from 'react';
import { StyleSheet, Image } from 'react-native';
import { HStack, IconButton, Icon, Text, Center, Badge } from 'native-base';
import MaterialIcons from 'react-native-vector-icons/dist/MaterialIcons';
import { Actions } from 'react-native-router-flux';
import Colors from '../../styles/colors';
import ApiServices from '../../services/ApiServices';
import global from '../../utils/Global';

export default class HeaderMenu extends Component {
  constructor(props) {
    super(props)
    this.state = {
      notif_unread: 0,
      userdata: null,
      checkNotif: null
    }
  }

  async componentDidMount() {
    // GET USER
    await global.getProfile().then((item) => {
      this.setState({ userdata: item })
    })

    // GET TOTAL UNREAD
    this.state.checkNotif = setInterval(async () => {
      await ApiServices.GET('user/notif/count/'+this.state.userdata.id, {}, true).then(async (result) => {
        // console.log(result)
        this.setState({ notif_unread: result })
      }).catch(error => {
        // console.log(error)
      })
    }, 5000)
  }

  componentWillUnmount(){
    clearInterval(this.state.checkNotif)
  }
  
	render() {
    return(
      <HStack bg={Colors.PRIMARY} px="1" py="2" justifyContent='space-between' alignItems='center'>
        <HStack alignItems='center'>
          <Center w={{
            base: '10%'
          }}>
            <IconButton 
              icon={
                <Icon size="sm" as={
                  <MaterialIcons name='menu' />
                } 
                color="white" />
              } 
              _pressed={{
                bg: "white.600:alpha.20"
              }} 
              onPress={() => { Actions.drawerToggle() }} 
            />
          </Center>
          <Center w={{
            base: '80%'
          }}>
            <Image style={styles.logo} source={require('../../assets/images/logo-title.png')}/>
          </Center>
          <Center w={{
            base: '10%'
          }}>
            {
              this.state.notif_unread > 0 ?
                <Badge 
                  colorScheme="danger"
                  rounded="999px"
                  mb={-5}
                  mr={0}
                  zIndex={1}
                  variant="solid"
                  alignSelf="flex-end"
                  _text={{
                    fontSize: 12,
                  }}
                >
                  {this.state.notif_unread}
                </Badge>
              : false
            }
            <IconButton 
              icon={
                <Icon size="sm" as={
                  <MaterialIcons name='notifications' />
                } 
                color="white" />
              } 
              _pressed={{
                bg: "white.600:alpha.20"
              }} 
              onPress={() => { 
                Actions.notification() 
              }} 
            />
          </Center>
        </HStack>
      </HStack>
    )
	}
}

const styles = StyleSheet.create({
  logo: {
    height: 35,
    width: 120,
    resizeMode: "contain",
	},
})
