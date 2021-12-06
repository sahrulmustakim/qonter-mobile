import React, { Component } from 'react'
import { StyleSheet, AsyncStorage, StatusBar, Text, View, ScrollView, TouchableOpacity } from 'react-native'
import { Actions } from 'react-native-router-flux'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import Toast from 'react-native-easy-toast'
import { Colors, Typography } from '../../styles'
import HeaderBack from '../../components/headers/back'
import Button from '../../components/buttons'
import CodeInput from 'react-native-confirmation-code-input'
import { POST, GET } from '../../services/ApiServices'
import { getProfile } from '../../utils/Global'

export default class Login extends Component {
  _isMounted = false

  constructor(props) {
    super(props)
  
    this.state = {
      pin: null,
      userdata: null
    }
  }

  async componentDidMount() {
    this._isMounted = true

    // GET USER
    await getProfile().then(async (item) => {
      this.setState({ userdata: item })
    })
  }

  async next() {
    if(this.state.pin == null){
      this.refs.toast_error.show('Masukkan PIN Keamanan Anda', 1000)
      return false
    }

    // REGISTER PIN & OTP
    let update_data = await AsyncStorage.getItem('update_data')
    // console.log(update_data)
    await POST('update/emailphone', {
      users_id: this.state.userdata.id,
      pin: this.state.pin,
      email: update_data.form_email,
      phonenumber: update_data.form_phone
    }, false).then(async (result) => {
      this.refs.toast_success.show('Data berhasil di simpan, silahkan login kembali untuk memperbarui data', 4000)
      setTimeout(async () => {
        await AsyncStorage.clear()
		    Actions.reset('login')
      }, 4000);
    }).catch(error => {
      this.refs.toast_error.show(error.message, 1000)
    })
  }

	render() {
		return(
      <ScrollView style={styles.container} scrollEnabled={false}>

        <HeaderBack title="PIN Keamanan" />
        
        <View style={styles.container_form}>
          <Text style={styles.title}>Masukkan PIN Keamanan</Text>

          <CodeInput
            ref="pinCode"
            keyboardType="numeric"
            secureTextEntry
            codeLength={6}
            activeColor={Colors.PRIMARY}
            inactiveColor='#F1F4F9'
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
    backgroundColor: '#F1F4F9',
    borderRadius: 5,
    borderWidth: 1,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontWeight: Typography.FONT_WEIGHT_REGULAR,
    color: Colors.PRIMARY,
    fontSize: 16,
  },
  borderStyleHighLighted: {
    borderColor: Colors.PRIMARY,
  },
});
