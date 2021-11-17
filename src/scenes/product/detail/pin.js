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
import { getProfile, formatPrice, getTotalTransaction, getProvitTransaction } from '_utils/Global'
import Geolocation from '@react-native-community/geolocation'

export default class ProductPin extends Component {
  _isMounted = false

  constructor(props) {
    super(props)
  
    this.state = {
      pin: null,
      userdata: null,
      location: null,
      trxtoken: null
    }
  }

  async componentDidMount() {
    this._isMounted = true

    // GET USER
    await getProfile().then((item) => {
      this.setState({ userdata: item })
    })

    console.log(this.state.userdata)

    // GET REQUEST DATA
    let request = await JSON.parse(await AsyncStorage.getItem('request_data'))

    // GET PROMO DATA
    let promo = await JSON.parse(await AsyncStorage.getItem('promo_data'))

    // POSTPAID DATA
    let postpaid = null
    if(request.transaction_type.type == 'postpaid'){
      postpaid = await JSON.parse(await AsyncStorage.getItem('postpaid_data'))
      // console.log('POSTPAID > '+postpaid)
    }

    // REQUEST TOKEN
    await POST('request/token', {
      user_id: this.state.userdata.id,
      total: getTotalTransaction(request, promo, postpaid, 'include', 'value')
    }, true).then(async (result) => {
      this.setState({ trxtoken: result })
      await AsyncStorage.setItem('trxtoken', JSON.stringify(result))
    }).catch(error => {
      console.log(error)
    })

    console.log(this.state.trxtoken)
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  async next() {
    if(this.state.userdata.blokir_trx == 1){
      this.refs.toast_error.show('Maaf Akun Anda tidak bisa melakukan transaksi.', 4000)
      return false
    }

    if(this.state.pin == null){
      this.refs.toast_error.show('Konfirmasi PIN Keamanan tidak lengkap', 4000)
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
        this.refs.toast_error.show('Permintaan akses di tolak.', 4000)
        return false
      }

      // GET REQUEST DATA
      let request = await JSON.parse(await AsyncStorage.getItem('request_data'))

      // GET PROMO DATA
      let promo = await JSON.parse(await AsyncStorage.getItem('promo_data'))
      let promo_code = await AsyncStorage.getItem('promo_code')

      // POSTPAID DATA
      let postpaid = null
      if(request.transaction_type.type == 'postpaid'){
        postpaid = await JSON.parse(await AsyncStorage.getItem('postpaid_data'))
        // console.log('POSTPAID > '+postpaid)
      }

      // GET PAYMENT METHOD
      let payment = await AsyncStorage.getItem('payment_method')
      if(payment == 'saldo'){
        payment = 'balance'
      }
      
      if(request.transaction_type.type == 'prepaid'){
        // PREPAID
        let transaction_request = {
          users_id: this.state.userdata.id,
          payment_method: payment,
          uniq_code: request.product_value.uniq_code,
          user_code: request.request,
          promo_code: promo_code,
          grand_total: getTotalTransaction(request, promo, postpaid, 'include', 'value'),
          product_values_id: request.product_value.id,
          harga_awal: parseInt(request.product_value.price),
          provit: parseInt(request.product_value.price_markup),
          sales_komisi: parseInt(request.product_value.sales_markup),
          pin_code: this.state.pin,
          location: JSON.stringify(this.state.location)
        }
        console.log(transaction_request)
        await AsyncStorage.setItem('transaction_request', JSON.stringify(transaction_request))
        await POST('pay/prepaid', transaction_request, true).then(async (result) => {
          await AsyncStorage.setItem('transaction_response', JSON.stringify(result))
          Actions.product_status()
        }).catch(async (error) => {
          console.log(JSON.stringify(error))
          this.refs.toast_error.show(error.message, 5000)
          await this.setState({ pin: null })
          this.refs.pinCode.clear()
        })
      }else{
        // POSTPAID
        let transaction_request = {
          users_id: this.state.userdata.id,
          uniq_code: request.product_value.uniq_code,
          user_code: request.request,
          product_values_id: request.product_value.id,
          params_code: null,
          payment_method: payment,
          promo_code: promo_code,
          grand_total: getTotalTransaction(request, promo, postpaid, 'include', 'value'),
          harga_awal: getTotalTransaction(request, promo, postpaid, 'exclude', 'value'),
          provit: parseInt(postpaid.price_markup),
          sales_komisi: parseInt(postpaid.sales_markup),
          pin_code: this.state.pin,
          location: JSON.stringify(this.state.location)
        }
        console.log(transaction_request)
        await AsyncStorage.setItem('transaction_request', JSON.stringify(transaction_request))
        await POST('pay/postpaid', transaction_request, true).then(async (result) => {
          await AsyncStorage.setItem('transaction_response', JSON.stringify(result))
          Actions.product_status()
        }).catch(async (error) => {
          console.log(error)
          this.refs.toast_error.show(error.message, 5000)
          await this.setState({ pin: null })
          this.refs.pinCode.clear()
        })
      }
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
