import React, { Component } from 'react'
import { StyleSheet, AsyncStorage, StatusBar, Text, View, ScrollView, TouchableOpacity, PermissionsAndroid, Platform } from 'react-native'
import { Actions } from 'react-native-router-flux'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import Toast from 'react-native-easy-toast'
import { Colors, Typography } from '_styles'
import HeaderBack from '_headers/back'
import Button from '_components/buttons'
import CodeInput from 'react-native-confirmation-code-input'
import { POST, GET } from '_services/ApiServices'
import { getProfile, formatPrice, getTotalTransfer } from '_utils/Global'
import Geolocation from '@react-native-community/geolocation'

export default class ProductPin extends Component {
  _isMounted = false

  constructor(props) {
    super(props)
  
    this.state = {
      pin: null,
      userdata: null,
      location: null
    }
  }

  async componentDidMount() {
    this._isMounted = true

    // GET USER
    await getProfile().then((item) => {
      this.setState({ userdata: item })
    })
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  async next() {
    if(this.state.userdata.blokir_trx == 1){
      this.refs.toast_error.show('Maaf Akun Anda tidak bisa melakukan transaksi.', 1000)
      return false
    }

    if(this.state.pin == null){
      this.refs.toast_error.show('Konfirmasi PIN Keamanan tidak lengkap', 1000)
      return false
    }else{
      // Request Location
      var self = this
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          'title': 'Qonter Permission Access',
          'message': 'Qonter Permission Access'
        }
      )
      // console.log(granted)
      if (granted) {
        try {
          // console.log('jalan')
          await Geolocation.getCurrentPosition(
            position => {
              // console.log(position)
              self.setState({
                location: {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                }
              })
            },
            error => { 
              console.log(error) 
            }
          )
        } catch (error) {
          console.log(error)
        }
      } 
      else {
        this.refs.toast_error.show('Permintaan akses di tolak.', 1000)
        return false
      }

      // GET PRODUCT DATA
      let product = JSON.parse(await AsyncStorage.getItem('tf_product_data'))

      // GET BANK DATA
      let bank = JSON.parse(await AsyncStorage.getItem('tf_bank_data'))

      // GET REQUEST DATA
      let request = JSON.parse(await AsyncStorage.getItem('tf_request_data'))
      
      // GET PROMO DATA
      let promo = JSON.parse(await AsyncStorage.getItem('tf_promo_data'))
      let promocode = await AsyncStorage.getItem('tf_promo_code')

      // GET PAYMENT METHOD
      let payment = await AsyncStorage.getItem('tf_payment_method')
      if(payment == 'saldo'){
        payment = 'balance'
      }
      
      // PAID
      let request_pay = {
        user_id: request.user_id,
        bank_id: request.bank_id,
        amount: request.req_amount,
        provit: request.markup,
        sales_komisi: request.sales_markup,
        grand_total: request.amount,
        norek: request.norek,
        note: request.note,
        email: request.email,
        payment_method: payment,
        pin_code: this.state.pin,
        location: JSON.stringify(this.state.location)
      }
      console.log(request_pay)
      await POST('pay/tf', request_pay, true).then(async (result) => {
        // console.log('RESPONSE > '+JSON.stringify(result))
        await AsyncStorage.setItem('tf_response_data', JSON.stringify(result))
        Actions.product_transfer_status()
      }).catch(async (error) => {
        console.log(JSON.stringify(error))
        this.refs.toast_error.show(error.message, 1000)
        await this.setState({ pin: null })
        this.refs.pinCode.clear()
      })
    }
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
            codeLength={6}
            secureTextEntry
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
    width: 45,
    height: 45,
    backgroundColor: '#F1F4F9',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#F1F4F9',
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontWeight: Typography.FONT_WEIGHT_REGULAR,
    color: Colors.PRIMARY,
    fontSize: 16,
  },
  borderStyleHighLighted: {
    borderColor: Colors.PRIMARY,
  },
});
