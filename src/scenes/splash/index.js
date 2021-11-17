import React, { Component } from 'react';
import { StyleSheet, View, StatusBar, Image } from 'react-native';
import { Actions } from 'react-native-router-flux';
import Colors from '../../styles/colors';
import global from '../../utils/Global';

export default class Splash extends Component {
  async componentDidMount() {
    setTimeout(async () => {
      await global.checkLogin().then((value) => {
        if(value){
          Actions.reset('menus')
        }
        else{
          Actions.reset('login')
        }
      })
    }, 3000)
  }

	render() {
		return(
      <View style={styles.splash}>
        <Image style={styles.logo} source={require('../../assets/images/logo-square.png')}/>

        <StatusBar backgroundColor={Colors.PRIMARY} barStyle={"light-content"} />
      </View>
    )
	}
}

const styles = StyleSheet.create({
  splash: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    backgroundColor: '#FFF'
  },
	logo: {
    height: '20%',
    resizeMode: 'contain',
	}
});
