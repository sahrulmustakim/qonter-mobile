import React, { Component } from 'react';
import { StyleSheet, StatusBar, BackHandler, Text, View, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Actions } from 'react-native-router-flux';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import Toast from 'react-native-easy-toast';
import Colors from '../../styles/colors';
import Typography from '../../styles/typography';
import HeaderNoBack from '../../components/headers/noback';
import ButtonIcon from '../../components/buttons/icon';
import global from '../../utils/Global';
import ApiServices from '../../services/ApiServices';

export default class LoginOtp extends Component {
  constructor(props) {
    super(props)
  
    this.state = {
      userdata: null
    }
  }

  async componentDidMount() {
    // GET USER
    await global.getProfile().then((item) => {
      this.setState({ userdata: item })
    })

    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress)
  }

  handleBackPress() {
    return false
  }

  async next(param) {
    // console.log(this.state.userdata)
    if(this.state.userdata == null){
      // FROM LOGIN
      let phone = await AsyncStorage.getItem('login_telp')
      // console.log(phone)
      if(param == 'email'){
        await ApiServices.POST('login/send/otp', {
          phonenumber: phone
        }, false).then(async (result) => {
          Actions.login_otp_verification()
        }).catch(error => {
          this.refs.toast_error.show(error.message, 1500)
          setTimeout(() => {
            Actions.reset('login')
          }, 1500);
        })
      }else if(param == 'whatsapp'){
        await ApiServices.GET('login/send/otp/wa/'+phone, {}, false).then(async (result) => {
          Actions.login_otp_verification()
        }).catch(error => {
          console.log(error)
          this.refs.toast_error.show(error, 1500)
          setTimeout(() => {
            Actions.reset('login')
          }, 1500);
        })
      }else{
        await ApiServices.GET('login/send/otp/sms/'+phone, {}, false).then(async (result) => {
          Actions.login_otp_verification()
        }).catch(error => {
          console.log(error)
          this.refs.toast_error.show(error, 1500)
          setTimeout(() => {
            Actions.reset('login')
          }, 1500);
        })
      }
    }else{
      // FROM REGISTER
      await ApiServices.POST('sendOtp', {
        id: this.state.userdata.id,
        method: param
      }, false).then((result) => {
        Actions.login_otp_verification()
      }).catch(error => {
        console.log(JSON.stringify(error))
        this.refs.toast_error.show(error.message, 1000)
      })
    }
  }

	render() {
		return(
      <ScrollView style={styles.container} scrollEnabled={false}>

        <HeaderNoBack title="Pilih Metode OTP" />
        
        <View style={styles.container_form}>
          <Text style={styles.titleBig}>Kirim OTP</Text>
          <Text style={styles.subtitle}>Untuk mendapatkan Kode OTP silahkan pilih salah satu metode dibawah ini :</Text>

          <ButtonIcon btnIcon='envelope' btnLabel='Email' onPress={() => this.next('email')} />
        </View>
        {/* <View style={[styles.container_form, {marginTop: 10}]}>
          <ButtonIcon btnIcon='whatsapp' btnLabel='Whatsapp' onPress={() => this.next('whatsapp')} />
        </View> */}

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
  titleBig : {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: Colors.PRIMARY,
    fontSize: 25,
    marginBottom: 10,
    marginTop: '10%'
  },
  subtitle : {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontWeight: Typography.FONT_WEIGHT_REGULAR,
    color: '#595959',
    fontSize: 14,
    marginBottom: '15%',
  },
  container_form : {
    marginTop: 5,
    marginLeft: 25,
    marginRight: 25
  },
  text_effect: {
    borderRadius: 10,
    marginBottom: 4,
    backgroundColor: '#F1F4F9',
  },
  labelInput: {
    fontWeight: "normal",
    borderRadius: 10,
    backgroundColor: '#F1F4F9',
    color: Colors.PRIMARY,
    paddingLeft: 0
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
