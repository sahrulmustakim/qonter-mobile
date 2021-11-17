import React, { Component } from 'react';
import { StyleSheet, StatusBar, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Actions } from 'react-native-router-flux';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import Toast from 'react-native-easy-toast';
import Colors from '../../styles/colors';
import Typography from '../../styles/typography';
import HeaderBack from '../../components/headers/back';
import Button from '../../components/buttons/index';
import CodeInput from 'react-native-confirmation-code-input';
import global from '../../utils/Global';
import ApiServices from '../../services/ApiServices';

export default class Login extends Component {
  constructor(props) {
    super(props)
  
    this.state = {
      pin: null,
      userid: null,
      phonenumber: null
    }
  }

  async next() {
    if(this.state.pin == null){
      this.refs.toast_error.show('Konfirmasi PIN Keamanan tidak lengkap', 1000)
      return false
    }else{
      let pin = await AsyncStorage.getItem('login_pin')
      // console.warn(pin)
      if(this.state.pin != pin){
        this.refs.toast_error.show('Konfirmasi PIN Keamanan salah', 1000)
        return false
      }
    }

    // GET USER ID
    await global.getProfile().then((item) => {
      this.setState({ userid: item.id })
      this.setState({ phonenumber: item.phonenumber })
    })

    // REGISTER PIN & OTP
    let login_otp = await AsyncStorage.getItem('login_otp')
    let login_pin = await AsyncStorage.getItem('login_pin')
    await ApiServices.POST('pin', {
      id: this.state.userid,
      pin: login_pin,
      otp_code: login_otp
    }, false).then(async (result) => {
      // console.log(result)
      // await AsyncStorage.setItem('userdata_verify', JSON.stringify(result))
    
      let deviceId = await AsyncStorage.getItem('deviceId')  
      await ApiServices.POST('login/otp', {
        phonenumber: this.state.phonenumber,
        otp_code: login_otp,
        imei: deviceId
      }, false).then(async (result) => {
        await AsyncStorage.setItem('token', result.auth.token)
        Actions.reset('menus')
      }).catch(error => {
        this.refs.toast_error.show(error.message, 1000)
      })
      
    }).catch(async (error) => {
      this.refs.toast_error.show(error.message, 1000)
      await AsyncStorage.clear()
      Actions.reset('login')
    })
  }

	render() {
		return(
      <ScrollView style={styles.container} scrollEnabled={false}>

        <HeaderBack title="PIN Keamanan" />
        
        <View style={styles.container_form}>
          <Text style={styles.title}>Konfirmasi PIN Keamanan</Text>

          <CodeInput
            ref="pinCode"
            keyboardType="numeric"
            secureTextEntry
            codeLength={6}
            activeColor={Colors.WHITE}
            inactiveColor={Colors.WHITE}
            autoFocus={true}
            ignoreCase={true}
            inputPosition='center'
            size={50}
            space={10}
            onFulfill={(code) => this.setState({ pin: code })}
            containerStyle={{ marginBottom: 10 }}
            codeInputStyle={styles.borderStyleBase}
          />
          
        </View>
        <View style={styles.container_form}>
          <Button btnLabel='Simpan' onPress={() => this.next()} />
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
  },
  title : {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: Colors.PRIMARY,
    fontSize: 16,
    marginTop: '10%',
    textAlign:'center',
  },
  subtitle : {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontWeight: Typography.FONT_WEIGHT_REGULAR,
    color: '#595959',
    fontSize: 18,
    marginTop: 10,
    textAlign:'center',
  },
  container_form : {
    marginTop: 5,
    marginLeft: 25,
    marginRight: 25
  },
  borderStyleBase: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: 5,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontWeight: Typography.FONT_WEIGHT_REGULAR,
    color: Colors.WHITE,
    fontSize: 16,
  },
  borderStyleHighLighted: {
    borderColor: Colors.PRIMARY,
  },
});
