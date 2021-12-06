import React, { Component } from 'react'
import { StyleSheet, AsyncStorage, StatusBar, Text, View, ScrollView, TouchableOpacity, Dimensions, Image, TextInput } from 'react-native'
import { Grid, Col, Form, Item, Label, Icon, Row } from 'native-base'
import { Actions } from 'react-native-router-flux'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import Toast from 'react-native-easy-toast'
import { Colors, Typography } from '../../styles'
import HeaderBack from '../../components/headers/back'
import Button from '../../components/buttons'
import CheckBox from '@react-native-community/checkbox'
import { getProfile, formatPrice, getTotalTransfer } from '../../utils/Global'
import { POST, GET } from '../../services/ApiServices'

export default class ProductCheckout extends Component {
  _isMounted = false

  constructor(props) {
    super(props)
  
    this.state = {
      userdata: null,
      product_data: null,
      bank_data: null,
      request_data: null,
      agree: true,
      promocode: null,
      promodata: {
        grand_total: 0
      },
      inquiry_data: null,
      promoPanel: false
    }
  }

  async componentDidMount() {
    this._isMounted = true
    
    // GET USER
    await getProfile().then((item) => {
      this.setState({ userdata: item })
    })

    // GET PRODUCT DATA
    let product = JSON.parse(await AsyncStorage.getItem('tf_product_data'))
    await this.setState({ product_data: product })
    // console.log(product)

    // GET BANK DATA
    let bank = JSON.parse(await AsyncStorage.getItem('tf_bank_data'))
    await this.setState({ bank_data: bank })
    console.log(bank)

    // GET REQUEST DATA
    let request = JSON.parse(await AsyncStorage.getItem('tf_request_data'))
    await this.setState({ request_data: request })
    console.log(request)

    // INQUIRY
    await POST('oy/inquiry', {
      bank_id: bank.id,
      norek: request.norek
    }, true).then(async (result) => {
      console.log(result)
      await this.setState({ inquiry_data: result })
      await AsyncStorage.setItem('tf_inquiry', JSON.stringify(result))
    }).catch(error => {
      console.log(error)
      this.refs.toast_error.show('Data Inquiry tidak ditemukan', 1000)
    })
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  async deletePromo() {
    this.setState({ promocode: null })
    this.setState({ promodata: { grand_total: 0 } })
  }

  async usePromo() {
    if(this.state.promocode == '' || this.state.promocode == null){
      this.refs.toast_error.show('Masukkan kode promo Anda', 1000)
    }else{
      await POST('check/promo', {
        harga: getTotalTransfer(this.state.request_data, this.state.promodata),
        promo_code: this.state.promocode.toUpperCase(),
        users_id: this.state.userdata.id,
        transaction_type_id: this.state.product_data.id
      }, true).then(async (result) => {
        // console.log(result)
        if(typeof result.grand_total !== 'undefined'){
          this.setState({ promodata: result })
        }else{
          this.refs.toast_error.show('Promo tidak dapat digunakan untuk transaksi ini', 1000)
        }
      }).catch(error => {
        this.refs.toast_error.show('Promo tidak dapat digunakan untuk transaksi ini', 1000)
      })
    }
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  async seeTerms() {

  }
  
  async next() {
    if(this.state.agree){
      if(this.state.promodata != null && parseInt(this.state.promodata.grand_total) > 0){
        await AsyncStorage.setItem('tf_promo_data', JSON.stringify(this.state.promodata))
        await AsyncStorage.setItem('tf_promo_code', this.state.promocode)
      }
      Actions.product_transfer_payment()
    }else{
      this.refs.toast_error.show('Anda belum menyetujui Syarat dan Ketentuan', 1000)
    }
  }

	render() {
		return(
      <View style={styles.container}>

        <HeaderBack title="Checkout" />
        
        <View style={styles.container_form}>

          {/* TITLE PRODUCT */}
          {
            (this.state.product_data != null && typeof this.state.product_data.name !== 'undefined') ?
            <Text style={[styles.titleBoldGreen, {marginBottom: 10}]}>{this.state.product_data.name}</Text>
            : false
          }
          
          {/* DETAIL */}
          {
            (this.state.inquiry_data != null && typeof this.state.inquiry_data.recipient_bank !== 'undefined') ?
            <Row style={{height: 28}}>
              <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                <Text style={styles.title}>Kode Bank</Text>
              </Col>
              <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                <Text style={styles.titleBoldBlack}>{this.state.inquiry_data.recipient_bank}</Text>
              </Col>
            </Row>
            : false
          }
          {
            (this.state.bank_data != null && typeof this.state.bank_data.name !== 'undefined') ?
            <Row style={{height: 28}}>
              <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                <Text style={styles.title}>Nama Bank</Text>
              </Col>
              <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                <Text style={styles.titleBoldBlack}>{this.state.bank_data.name}</Text>
              </Col>
            </Row>
            : false
          }
          {
            (this.state.request_data != null && typeof this.state.request_data.norek !== 'undefined') ?
            <Row style={{height: this.state.request_data.norek.length > 15 ? this.state.request_data.norek.length > 30 ? 60 : 42 : 28}}>
              <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                <Text style={styles.title}>Nomor Rekening</Text>
              </Col>
              <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                <Text style={[styles.titleBoldBlack, {textAlign: "right"}]}>{this.state.request_data.norek}</Text>
              </Col>
            </Row>
            : false
          }
          {
            (this.state.inquiry_data != null && typeof this.state.inquiry_data.recipient_name !== 'undefined') ?
            <Row style={{height: this.state.inquiry_data.recipient_name.length > 15 ? this.state.inquiry_data.recipient_name.length > 30 ? 60 : 42 : 28}}>
              <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                <Text style={styles.title}>Atas Nama</Text>
              </Col>
              <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                <Text style={[styles.titleBoldBlack, {textAlign: "right"}]}>{this.state.inquiry_data.recipient_name}</Text>
              </Col>
            </Row>
            : false
          }
          {
            (this.state.request_data != null && typeof this.state.request_data.note !== 'undefined' && this.state.request_data.note != null) ?
            <Row style={{height: this.state.request_data.note.length > 15 ? this.state.request_data.note.length > 30 ? 60 : 42 : 28}}>
              <Col size={4} style={{alignItems: "flex-start", justifyContent: "center"}}>
                <Text style={styles.title}>Catatan</Text>
              </Col>
              <Col size={8} style={{alignItems: "flex-end", justifyContent: "center"}}>
                <Text style={[styles.titleBoldBlack, {textAlign: "right"}]}>{this.state.request_data.note}</Text>
              </Col>
            </Row>
            : false
          }
          {
            (this.state.request_data != null && typeof this.state.request_data.email !== 'undefined' && this.state.request_data.email != null) ?
            <Row style={{height: 28}}>
              <Col size={4} style={{alignItems: "flex-start", justifyContent: "center"}}>
                <Text style={styles.title}>Email</Text>
              </Col>
              <Col size={8} style={{alignItems: "flex-end", justifyContent: "center"}}>
                <Text style={[styles.titleBoldBlack, {textAlign: "right"}]}>{this.state.request_data.email}</Text>
              </Col>
            </Row>
            : false
          }
          
          {/* TOTAL */}
          {
            (this.state.request_data != null) ? 
            <Row style={{height: 28}}>
              <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                <Text style={styles.title}>Total Transfer</Text>
              </Col>
              <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                <Text style={styles.titleBoldBlack}>{formatPrice(this.state.request_data.req_amount)}</Text>
              </Col>
            </Row>
            : false
          }
          {
            (this.state.request_data != null) ? 
            <Row style={{height: 28}}>
              <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                <Text style={styles.title}>Biaya Admin</Text>
              </Col>
              <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                <Text style={styles.titleBoldBlack}>{formatPrice(parseInt(this.state.request_data.admin) + parseInt(this.state.request_data.markup) + parseInt(this.state.request_data.sales_markup))}</Text>
              </Col>
            </Row>
            : false
          }
          {
            (this.state.request_data != null) ? 
            <Row style={{height: 28}}>
              <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                <Text style={styles.title}>Grand Total</Text>
              </Col>
              <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                <Text style={styles.titleBoldBlack}>{formatPrice(getTotalTransfer(this.state.request_data, this.state.promodata, 'exclude'))}</Text>
              </Col>
            </Row>
            : false
          }

          {/* PROMO */}
          {
            (typeof this.state.promodata.grand_total !== 'undefined' && parseInt(this.state.promodata.grand_total) > 0) ? 
            <Row style={{height: 28}}>
              <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                <Text style={styles.titleBoldRed}>Diskon Promo</Text>
              </Col>
              <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                <Text style={styles.titleBoldRed}>- {formatPrice(this.state.promodata.grand_total)}</Text>
              </Col>
            </Row>
            : false
          }
        </View>
        

        {/* PROMO VIEW */}
        <View style={styles.container_bottom}>
          <Row style={{margin: 20, backgroundColor: '#F1F4F9', padding: 5, borderRadius: 8}}>
            <Col size={1} style={{justifyContent: "center", alignItems: "center"}}>
              <Image style={{ width: 24, height: 24, resizeMode: "contain" }} source={require('../../assets/images/coupon-gray.png')} />
            </Col>
            {
              (typeof this.state.promodata.grand_total !== 'undefined' && parseInt(this.state.promodata.grand_total) > 0) ? 
              <Col size={8} style={{justifyContent: "center", paddingLeft: 5}}>
                <Text style={[styles.titleSmallGray, {fontWeight: "bold"}]}>{this.state.promocode.toUpperCase()}</Text>
                <Text style={[styles.titleSmallGray]}>1 Kode promo terpakai</Text>
              </Col>
              :
              <Col size={8} style={{justifyContent: "center", padding:0, paddingLeft: 5}}>
                <TextInput style={[styles.inputForm, {textTransform: "uppercase"}]} placeholder='Masukkan Kode Promo' placeholderTextColor="#D1D1D1" onChangeText = {(value) => this.setState({promocode: value.toUpperCase()})} />
              </Col>
            }
            {
              (typeof this.state.promodata.grand_total !== 'undefined' && parseInt(this.state.promodata.grand_total) > 0) ? 
              <Col size={3} style={{justifyContent: "center", alignItems: "center"}}>
                <TouchableOpacity onPress={() => this.deletePromo()}>
                  <Label style={{color: '#F63F3F'}}>Batalkan</Label>
                </TouchableOpacity>
              </Col>
              :
              <Col size={3} style={{justifyContent: "center", alignItems: "center"}}>
                <TouchableOpacity onPress={() => this.usePromo()}>
                  <Label style={{color: '#337AD1'}}>Gunakan</Label>
                </TouchableOpacity>
              </Col>
            }
          </Row>

          <View style={{marginLeft: 20, marginRight: 20, marginBottom: 20}}>
            <Text style={styles.titleSmallGray}>Total Pembayaran</Text>
            <Text style={styles.titleBoldGreen}>Rp{formatPrice(getTotalTransfer(this.state.request_data, this.state.promodata))}</Text>
          </View>

          <View style={{marginLeft: 20, marginRight: 20, marginBottom: 20, flexDirection: "row"}}>
            <CheckBox
              value={this.state.agree}
              onValueChange={(value) => this.setState({agree: value})}
              style={styles.checkbox}
              tintColors={{ true: '#EC380B', false: '#858585' }}
            />
            <Text style={styles.labelCheckbox} onPress={() => this.seeTerms()}>
              Saya menerima dan menyetujui Syarat dan ketentuan Abata {"\n"}
              <Text style={styles.labelCheckboxRed}>Klik untuk membaca Syarat dan Ketentuan</Text>
            </Text>
          </View>

          <Button btnLabel='Bayar' onPress={() => this.next()} />
        </View>

        <StatusBar backgroundColor={Colors.PRIMARY} barStyle={"light-content"} />
        <Toast ref="toast_error" style={{backgroundColor:Colors.ALERT, width: '90%'}} position='top' positionValue={35} />
        <Toast ref="toast_success" style={{backgroundColor:Colors.SUCCESS, width: '90%'}} position='top' positionValue={35} />
        <KeyboardSpacer/>
      </View>	
    )
	}
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  container_form : {
    padding: 20,
  },
  container_bottom: {
    position: "absolute",
    bottom: -1,
    left: -1,
    width: Dimensions.get('screen').width + 2,
    paddingTop: 5,
    paddingBottom: 5,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderColor: '#D6D6D6',
  },
  titleSmallBlack: {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontWeight: Typography.FONT_WEIGHT_REGULAR,
    color: '#333333',
    fontSize: 12,
  },
  titleSmallGray: {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontWeight: Typography.FONT_WEIGHT_REGULAR,
    color: '#858585',
    fontSize: 12,
  },
  titleBigBlack: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: '#333333',
    fontSize: 40
  },
  title: {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontWeight: Typography.FONT_WEIGHT_REGULAR,
    color: '#232323',
    fontSize: 16,
  },
  titleBoldBlack: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: '#232323',
    fontSize: 16,
  },
  titleBoldGreen: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: Colors.PRIMARY,
    fontSize: 16,
  },
  titleBoldRed: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: '#F63F3F',
    fontSize: 16,
  },
  
  checkbox: {
    alignSelf: "center",
    fontSize: 12,
    justifyContent: "center"
  },
  labelCheckbox: {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontWeight: Typography.FONT_WEIGHT_REGULAR,
    color: Colors.PRIMARY,
    fontSize: 12,
    paddingTop: 2
  },
  labelCheckboxRed: {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontWeight: Typography.FONT_WEIGHT_REGULAR,
    color: '#EC380B',
    fontSize: 12,
  },
  labelItem: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: '#000',
    fontSize: 16
  },
  labelItemActive: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: Colors.PRIMARY,
    fontSize: 16
  },
  labelItemSmall: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: '#000',
    fontSize: 12
  },
  labelItemSmallActive: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: Colors.PRIMARY,
    fontSize: 12
  },
  labelItemPrice: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: '#FF5C00',
    fontSize: 14
  },
  labelItemSmallPrice: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: '#FF5C00',
    fontSize: 12
  },
  
  boxItem: {
    alignItems: "center", 
    alignContent: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D6D6D6',
    margin: 5,
    padding: 0.5,
    paddingTop: 5,
    paddingBottom: 5,
  },
  inputForm: {
    paddingTop: 0,
    paddingLeft: 0,
    paddingBottom: 0,
    margin: 0,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontWeight: Typography.FONT_WEIGHT_REGULAR,
    fontSize: 16,
    width: '100%'
  }
});
