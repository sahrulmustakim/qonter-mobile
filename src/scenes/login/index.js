import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, BackHandler, StatusBar, ScrollView, Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Actions } from 'react-native-router-flux';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { Hideo } from 'react-native-textinput-effects';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import Toast from 'react-native-easy-toast';
import Colors from '../../styles/colors';
import Typography from '../../styles/typography';
import ButtonFill from '../../components/buttons/fill';
import global from '../../utils/Global';
import ApiServices from '../../services/ApiServices';
import DeviceInfo from 'react-native-device-info';

export default class Login extends Component {
  constructor(props) {
    super(props)
  
    this.state = {
      telp: null,
      remember: true
    }
  }

  async componentDidMount() {
    this._isMounted = true

    await global.checkLogin().then((value) => {
      if(value){
        // Actions.reset('menus')
      }
    })

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE ,
        {
          'title': 'Qonter Verification',
          'message': 'Qonter needs access to your personal data. '
        }
      )
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log(granted)
      }
      else {
        console.log(granted)
      }
    } catch (err) {
      console.log(err)
    }

    let deviceId = await DeviceInfo.getAndroidId()
    await AsyncStorage.setItem('deviceId', deviceId)

    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress)
  }

  handleBackPress() {
    if(Actions.currentScene == 'login'){
      BackHandler.exitApp()
      return true
    }else{
      return false
    }
  }

  async next() {
    if(this.state.telp == null || this.state.telp == ''){
      this.refs.toast_error.show('Silahkan mengisi Nomor Telepon Anda..', 3000)
      return false
    }

    let login_telp = null
    if(this.state.telp.substring(0, 1) == '0'){
      login_telp = '62'+this.state.telp.substring(1, this.state.telp.length)
    }else{
      login_telp = this.state.telp
    }

    await ApiServices.POST('detect/phone', {
      phonenumber: login_telp
    }, false).then(async (result) => {
      await AsyncStorage.setItem('login_telp', login_telp)
      Actions.login_otp()
    }).catch(error => {
      console.log(JSON.stringify(error))
      this.refs.toast_error.show(error.message, 1000)
    })
  }

	register() {
		Actions.register()
  }

	render() {
		return(
      <ScrollView style={styles.container} scrollEnabled={false}>
        <View style={styles.container_logo}>
          <Image style={styles.logo} source={require('../../assets/images/logo-title-blue.png')}/>
        </View>
        
        <View style={styles.container_form}>
          <Text style={styles.titleBig}>Login</Text>

          <Hideo style={styles.text_effect}
            placeholder={'Nomor Telepon'}
            iconClass={FontAwesomeIcon}
            iconName={'user'}
            iconSize={20}
            iconColor={Colors.PRIMARY}
            iconBackgroundColor={'none'}
            inputStyle={styles.labelInput}
            keyboardType="phone-pad"
            ref={(input) => { this.telp = input; }}
            onChangeText = {(value) => this.setState({telp: value})}
          />

          <ButtonFill btnLabel='Masuk' onPress={() => this.next()} />
        </View>

        <View style={styles.signupTextCont}>
          <Text style={styles.signupText}>Tidak memiliki akun?</Text>
          <TouchableOpacity onPress={this.register}><Text style={styles.signupButton}> Daftar</Text></TouchableOpacity>
        </View>

        <StatusBar backgroundColor={Colors.PRIMARY} barStyle={"light-content"} />
        <Toast ref="toast_error" style={{backgroundColor:Colors.ALERT, width: '90%'}} position='top' positionValue={35} />
        <Toast ref="toast_success" style={{backgroundColor:Colors.SUCCESS, width: '90%'}} position='top' positionValue={35} />
        <KeyboardSpacer/>
      </ScrollView>	
    )
	}
}

const styles = StyleSheet.create({
  container : {
    flex: 1,
    backgroundColor: '#FFF'
  },
  container_logo : {
    alignItems:'center',
    marginTop: '28%',
    marginBottom: '28%'
  },
	logo: {
    height: 80,
    resizeMode: "contain",
    paddingBottom: 50,
    alignItems: 'center'
	},
  titleBig : {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: Colors.PRIMARY,
    fontSize: 30,
    marginBottom: 10
  },
  container_form : {
    marginTop: 5,
    marginLeft: 25,
    marginRight: 25
  },
  text_effect: {
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: '#EFEFEF',
    borderWidth: 1,
    borderColor: Colors.PRIMARY
  },
  labelInput: {
    fontWeight: "normal",
    borderRadius: 10,
    backgroundColor: '#EFEFEF',
    color: Colors.PRIMARY,
    paddingLeft: 0,
    marginRight: 1
  },
  checkboxContainer: {
    flexDirection: "row",
    marginBottom: 25,
  },
  checkbox: {
    alignSelf: "center",
    color: '#C4C4C4',
    opacity: 0.5,
    fontSize: 12
  },
  labelCheckbox: {
    margin: 8,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontWeight: Typography.FONT_WEIGHT_REGULAR,
    color: Colors.PRIMARY,
    fontSize: 14,
  },
  container_button: {
    marginTop: 10
  },
  signupTextCont : {
  	flexGrow: 1,
    alignItems:'flex-end',
    justifyContent :'center',
    paddingVertical: 16,
    flexDirection:'row'
  },
  signupText: {
  	color: Colors.SECONDARY,
  	fontSize: 16
  },
  forgetButton: {
    color: Colors.PRIMARY,
  	fontSize: 14,
  	fontWeight: "700"
  },
  signupButton: {
  	color: Colors.PRIMARY,
  	fontSize: 16,
  	fontWeight: "bold"
  }
});
