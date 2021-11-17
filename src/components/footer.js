import React, { Component } from 'react';
import { Dimensions, StyleSheet, Image, View, TouchableOpacity } from 'react-native';
import { Icon, Text } from 'native-base';
import MaterialIcons from 'react-native-vector-icons/dist/MaterialIcons';
import { Actions } from 'react-native-router-flux';
import Colors from '../styles/colors';
import Typography from '../styles/typography';

const items = [{
  title: 'Home',
  icon: 'home',
  route: 'home'
},{
  title: 'Transaksi',
  icon: 'history',
  route: 'history'
},{
  title: 'Chat',
  icon: 'chat',
  route: 'chat'
},{
  title: 'Profil',
  icon: 'person-pin',
  route: 'profile'
}]

export default class Footer extends Component {
  constructor(props) {
    super(props)
    let scene = 'home'
    if(Actions.currentScene != 'Splash'){
      scene = Actions.currentScene
    }
    this.state = {
      currentRoute : scene
    }
  }

  displayMenu(item, index) {
    return (
      <TouchableOpacity key={index} style={styles.menus} onPress={() => (this.state.currentRoute == item.route) ? false : Actions[item.route].call()}>
        <Icon as={MaterialIcons} name={item.icon} style={(this.state.currentRoute == item.route) ? styles.imgMenuActive : styles.imgMenu} />
        <Text style={(this.state.currentRoute == item.route) ? styles.textMenuActive : styles.textMenu}>{item.title}</Text>
      </TouchableOpacity>
    )
  }
  
	render() {
    return(
			<View style={styles.footerMenus}>
        {items.map((item, index) => this.displayMenu(item, index))}
      </View>
    )
	}
}

const screenWidth = Math.round(Dimensions.get('window').width)
const styles = StyleSheet.create({
  footerMenus: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    width: screenWidth,
    height: 60,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C1C1C1'
  },
  menus: {
    width: '25%',
    alignItems: 'center',
  },
  textMenu: {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontWeight: Typography.FONT_WEIGHT_REGULAR,
    color: '#8E8E8E',
    fontSize: 14,
  },
  textMenuActive: {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontWeight: Typography.FONT_WEIGHT_REGULAR,
    color: Colors.PRIMARY,
    fontSize: 14,
  },
  imgMenu: {
    height: 24,
    width: 22,
    color: '#8E8E8E',
    fontSize: 22,
    alignItems: 'center'
  },
  imgMenuActive: {
    height: 24,
    width: 22,
    color: Colors.PRIMARY,
    fontSize: 22,
    alignItems: 'center'
  }
})
