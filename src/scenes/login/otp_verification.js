import React, { Component } from 'react';
import { StyleSheet, StatusBar, Text, View, ScrollView, TouchableOpacity, Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Actions } from 'react-native-router-flux';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import Toast from 'react-native-easy-toast';
import Colors from '../../styles/colors';
import Typography from '../../styles/typography';
import HeaderBack from '../../components/headers/back';
import Button from '../../components/buttons/index';
import CodeInput from 'react-native-confirmation-code-input';
import moment from 'moment';
import global from '../../utils/Global';
import ApiServices from '../../services/ApiServices';

export default class Login extends Component {
  constructor(props) {
    super(props)
  
    this.state = {
      code: null,
      eventDate:moment.duration().add({days:0,hours:0,minutes:1,seconds:30}), 
      days:0,
      hours:0,
      mins:0,
      secs:0,
      phone: '0854 2158 5545',
      userdata: null,
      imei : ''
    }
  }

  async componentDidMount() {
    await global.checkLogin().then(async (value) => {
      if(value){
        // FROM REGISTER
        await global.getProfile().then((item) => {
          this.setState({ phone: item.phonenumber })
          this.setState({ userdata: item })
        })
      }else{
        // FROM LOGIN
        let phone = await AsyncStorage.getItem('login_telp')
        this.setState({ phone: phone })
      }
    })

    this.updateTimer()
  }

  updateTimer=()=>{
    const x = setInterval(()=>{
      let { eventDate} = this.state

      if(eventDate <= 0){
        clearInterval(x)
      }else {
        eventDate = eventDate.subtract(1,"s")
        const days = eventDate.days()
        const hours = eventDate.hours()
        const mins = eventDate.minutes()
        const secs = eventDate.seconds()
        
        this.setState({
          days,
          hours,
          mins,
          secs,
          eventDate
        })
      }
    },1000)
  }

  async next() {
    let deviceId = await AsyncStorage.getItem('deviceId')
    // console.log(deviceId)
    // console.log(this.state)
    if(this.state.code == null){
      this.refs.toast_error.show('Silahkan masukkan Kode OTP', 1000)
      return false
    }

    if(this.state.userdata == null){
      // FROM LOGIN
      await ApiServices.POST('login/otp', {
        phonenumber: this.state.phone,
        otp_code: this.state.code,
        imei: deviceId
      }, false).then(async (result) => {
        console.log(result)
        await AsyncStorage.setItem('login_otp', this.state.code)
        await AsyncStorage.setItem('userdata', JSON.stringify(result.userdata))
        await AsyncStorage.setItem('token', result.auth.token)
        Actions.reset('menus')
      }).catch(error => {
        // console.log(error)
        this.refs.toast_error.show(error.message, 1000)
        this.refs.otpCode.clear()
        Actions.reset('login')
      })
    }else{
      // FROM REGISTER
      await ApiServices.POST('verifOtp', {
        id: this.state.userdata.id,
        otp: this.state.code,
        imei: deviceId
      }, false).then(async (result) => {
        // console.log(JSON.stringify(result))
        await AsyncStorage.setItem('login_otp', this.state.code)
        Actions.login_pin()
      }).catch(error => {
        this.refs.toast_error.show(error.message, 1000)
        this.refs.otpCode.clear()
      })
    }
  }

  async sendOtp() {
    await ApiServices.POST('sendOtp', {
      id: this.state.userdata.id,
      method: 'email'
    }, false).then((result) => {
      this.refs.toast_success.show('Kode OTP berhasil dikirim ulang ke Email Anda', 1000)
    }).catch(error => {
      this.refs.toast_error.show(error.message, 1000)
    })
  }

	render() {
    const { days, hours, mins, secs } = this.state
		return(
      <ScrollView style={styles.container} scrollEnabled={false}>

        <HeaderBack title="Verifikasi OTP" />
        
        <View style={styles.container_form}>
          {/* <Text style={styles.subtitle}>Kode telah dikirim ke nomor {this.state.phone}</Text> */}
          <Text style={styles.subtitle}>Kode telah dikirim ke Email, silahkan cek Email Anda</Text>

          <CodeInput
            ref="otpCode"
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
            onFulfill={(code) => this.setState({ code: code })}
            containerStyle={{ marginBottom: 10 }}
            codeInputStyle={styles.borderStyleBase}
          />

          { 
            (this.state.eventDate <= 0) ? 
            <TouchableOpacity onPress={() => this.sendOtp()}>
              <Text style={styles.timer}>Kirim ulang kode</Text>
            </TouchableOpacity>
            : 
            <Text style={styles.timer}>Kirim ulang setelah {`${mins} : ${secs}`}</Text> 
          }
          
        </View>
        <View style={[styles.container_form, {marginTop: 10}]}>
          <Button btnLabel='Lanjutkan' onPress={() => this.next()} />
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
  subtitle : {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontWeight: Typography.FONT_WEIGHT_REGULAR,
    color: '#595959',
    fontSize: 18,
    marginTop: '10%',
    textAlign:'center',
  },
  timer: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: '#333333',
    fontSize: 16,
    marginBottom: 25,
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
