import React, { Component } from 'react'
import { StyleSheet, AsyncStorage, StatusBar, Text, View, ScrollView, TouchableOpacity, Dimensions, Image } from 'react-native'
import { Grid, Col, Form, Item, Input, Label, Icon, Row } from 'native-base'
import { Actions } from 'react-native-router-flux'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import Toast from 'react-native-easy-toast'
import { Colors, Typography } from '../../styles'
import HeaderBack from '../../components/headers/back'
import Button from '../../components/buttons'
import CheckBox from '@react-native-community/checkbox'
import { POST, GET } from '../../services/ApiServices'
import { getProfile, formatPrice, getTotalTransfer } from '../../utils/Global'
import SwipeablePanel from 'react-native-sheets-bottom'

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
      promo_code: null,
      promo_data: {
        grand_total: 0
      },
      saldo: 0,
      dompet: 0,
      profile: null,
      payment_method: false,
      payment_method_use: 'saldo',
      inquiry_data: null
    }
  }

  async componentDidMount() {
    this._isMounted = true

    // GET USER
    await getProfile().then((item) => {
      this.setState({ userdata: item })
    })

    // GET PROFILE
    await POST('profile', {
      id: this.state.userdata.id
    }, true).then(async (result) => {
      this.setState({ profile: result })
      
      // SALDO
      if(result.user[0].balances != null){
        this.setState({ saldo: result.user[0].balances.amount })
      }
      
      // DOMPET
      if(result.user[0].paylaters != null){
        this.setState({ dompet: result.user[0].paylaters.amount })
      }
    }).catch(error => {
      console.log(error)
    })

    // GET PRODUCT DATA
    let product = JSON.parse(await AsyncStorage.getItem('tf_product_data'))
    await this.setState({ product_data: product })

    // GET BANK DATA
    let bank = JSON.parse(await AsyncStorage.getItem('tf_bank_data'))
    await this.setState({ bank_data: bank })

    // GET REQUEST DATA
    let request = JSON.parse(await AsyncStorage.getItem('tf_request_data'))
    await this.setState({ request_data: request })

    // GET INQUIRY DATA
    let inquiry = JSON.parse(await AsyncStorage.getItem('tf_inquiry'))
    await this.setState({ inquiry_data: inquiry })
    
    // GET PROMO DATA
    let promo = JSON.parse(await AsyncStorage.getItem('tf_promo_data'))
    let promocode = await AsyncStorage.getItem('tf_promo_code')
    await this.setState({ promo_data: promo })
    await this.setState({ promo_code: promocode })
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  async paymentMethod(){
    await this.setState({ payment_method: true })
  }

  async select(value) {
    await this.setState({ payment_method_use: value })
    await this.setState({ payment_method: false })
  }

  async next() {
    let status = false

    // GRAND TOTAL
    let grandtotal = getTotalTransfer(this.state.request_data, this.state.promo_data, 'include')

    if(this.state.payment_method_use == 'saldo'){
      if(parseInt(this.state.saldo) < parseInt(grandtotal)){
        status = true
      }
    }
    else if(this.state.payment_method_use == 'paylater'){
      if(parseInt(this.state.dompet) < parseInt(grandtotal)){
        status = true
      }
    }

    if(status){
      this.refs.toast_error.show('Maaf Saldo Anda tidak cukup untuk transaksi ini, silahkan pilih metode pembayaran yang lain.', 1000)
    }else{
      if(this.state.agree){
        await AsyncStorage.setItem('tf_payment_method', this.state.payment_method_use)
        Actions.product_transfer_pin()
      }else{
        this.refs.toast_error.show('Anda belum menyetujui Syarat dan Ketentuan', 1000)
      }
    }
  }

	render() {
		return(
      <View style={styles.container}>

        <HeaderBack title="Pembayaran" />
        
        <View style={styles.container_form}>

          <View style={{borderRadius: 5, borderColor: '#858585', borderWidth: 1, marginBottom: 15, padding: 10}}>
            <TouchableOpacity onPress={() => this.paymentMethod()}>
              <Row style={{height: 20, justifyContent: "flex-start"}}>
                <Col size={10} style={{justifyContent: "center", alignItems: "flex-start"}}>
                  <Text style={[styles.titleBoldGreen, {}]}>Metode Pembayaran</Text>
                </Col>
                <Col size={2} style={{justifyContent: "center", alignItems: "flex-end"}}>
                  <Icon type="MaterialIcons" name="more-vert" style={{color: '#333333', fontSize: 20}} />
                </Col>
              </Row>
              {
                (this.state.payment_method_use == 'saldo') ? 
                <Row style={{height: 30}}>
                  <Col size={1} style={{justifyContent: "center", alignItems: "flex-start"}}>
                    <Image style={{ width: 24, height: 24, resizeMode: "contain" }} source={require('../../assets/images/dbcurrency.png')} />
                  </Col>
                  <Col size={5} style={{justifyContent: "center"}}>
                    <Text style={[styles.titleBoldBlack]}>Saldo</Text>
                  </Col>
                  <Col size={5} style={{justifyContent: "center", alignItems: "flex-end"}}>
                    <Text style={[styles.titleBoldBlack, {}]}>Rp{formatPrice(this.state.saldo)}</Text>
                  </Col>
                </Row>
                :
                <Row style={{height: 30}}>
                  <Col size={1} style={{justifyContent: "center", alignItems: "flex-start"}}>
                    <Image style={{ width: 24, height: 24, resizeMode: "contain" }} source={require('../../assets/images/dbcurrency.png')} />
                  </Col>
                  <Col size={5} style={{justifyContent: "center"}}>
                    <Text style={[styles.titleBoldBlack]}>Qonter</Text>
                  </Col>
                  <Col size={5} style={{justifyContent: "center", alignItems: "flex-end"}}>
                    <Text style={[styles.titleBoldBlack, {}]}>Rp{formatPrice(this.state.dompet)}</Text>
                  </Col>
                </Row>
              }
            </TouchableOpacity>
          </View>

          {/* DETAIL */}
          {
            (this.state.product_data != null && typeof this.state.product_data.name !== 'undefined') ?
            <Row style={{height: 28}}>
              <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                <Text style={styles.title}>Produk</Text>
              </Col>
              <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                <Text style={styles.titleBoldBlack}>{this.state.product_data.name}</Text>
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
            (this.state.request_data != null && typeof this.state.request_data.norek !== 'undefined' && this.state.inquiry_data != null && typeof this.state.inquiry_data.recipient_bank !== 'undefined') ?
            <Row style={{height: this.state.request_data.norek.length > 15 ? this.state.request_data.norek.length > 30 ? 60 : 42 : 28}}>
              <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                <Text style={styles.title}>Nomor Rekening</Text>
              </Col>
              <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                <Text style={[styles.titleBoldBlack, {textAlign: "right"}]}>{this.state.inquiry_data.recipient_bank} - {this.state.request_data.norek}</Text>
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
            (this.state.promo_data != null && typeof this.state.promo_data.grand_total !== 'undefined' && parseInt(this.state.promo_data.grand_total) > 0) ? 
            <Row style={{height: 28}}>
              <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                <Text style={styles.titleBoldRed}>Diskon Promo</Text>
              </Col>
              <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                <Text style={styles.titleBoldRed}>- {formatPrice(this.state.promo_data.grand_total)}</Text>
              </Col>
            </Row>
            : false
          }
        </View>

        <View style={styles.container_bottom}>
          <View style={{margin: 20}}>
            <Text style={styles.titleSmallGray}>Total Pembayaran</Text>
            <Text style={styles.titleBoldGreen}>Rp{formatPrice(getTotalTransfer(this.state.request_data, this.state.promo_data, 'include'))}</Text>
          </View>

          <View style={{marginLeft: 20, marginRight: 20, marginBottom: 20, flexDirection: "row"}}>
            <CheckBox
              value={this.state.agree}
              onValueChange={(value) => this.setState({agree: value})}
              style={styles.checkbox}
              tintColors={{ true: '#EC380B', false: '#858585' }}
            />
            <Text style={styles.labelCheckbox}>Saya menerima dan menyetujui Syarat dan ketentuan Abata {"\n"}<Text style={styles.labelCheckboxRed}>Klik untuk membaca Syarat dan Ketentuan</Text></Text>
          </View>

          <Button btnLabel='Bayar' onPress={() => this.next()} />
        </View>

        {/* PAYMENT METHOD */}
        <SwipeablePanel
          fullWidth
          isActive={this.state.payment_method}
          openLarge={false}
        >
          <View style={{paddingLeft: 20, paddingRight: 20}}>
            <Text style={[styles.titleBoldGreen, {marginBottom: 10, textAlign: "center"}]}>Pilih Metode Pembayaran</Text>
            <Row style={{marginBottom: 5}}>
              <Col style={(this.state.payment_method_use != null && this.state.payment_method_use == 'saldo') ? styles.boxItemActive : styles.boxItem}>
                <TouchableOpacity style={{alignItems: "center", alignContent: "center"}} onPress={() => this.select('saldo')}>
                  <Grid>
                    <Col size={2} style={{alignItems: "center", padding: 5, justifyContent: "center"}}>
                      <Image style={{ width: 45, height: 45, resizeMode: "contain" }} source={require('../../assets/images/dbcurrency.png')} />
                    </Col>
                    <Col size={10} style={{justifyContent: "center"}}>
                      <Text style={styles.labelItem}>Saldo</Text>
                      <Text style={styles.labelItemPrice}>Rp{formatPrice(this.state.saldo)}</Text>
                    </Col>
                  </Grid>
                </TouchableOpacity>
              </Col>
            </Row>
            <Row style={{marginBottom: 5}}>
              <Col style={(this.state.payment_method_use != null && this.state.payment_method_use == 'paylater') ? styles.boxItemActive : styles.boxItem}>
                <TouchableOpacity style={{alignItems: "center", alignContent: "center"}} onPress={() => this.select('paylater')}>
                  <Grid>
                    <Col size={2} style={{alignItems: "center", padding: 5, justifyContent: "center"}}>
                      <Image style={{ width: 45, height: 45, resizeMode: "contain" }} source={require('../../assets/images/dbcurrency.png')} />
                    </Col>
                    <Col size={10} style={{justifyContent: "center"}}>
                      <Text style={styles.labelItem}>Qonter</Text>
                      <Text style={styles.labelItemPrice}>Rp{formatPrice(this.state.dompet)}</Text>
                    </Col>
                  </Grid>
                </TouchableOpacity>
              </Col>
            </Row>
          </View>
        </SwipeablePanel>

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
  titleGreen: {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontWeight: Typography.FONT_WEIGHT_REGULAR,
    color: Colors.PRIMARY,
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
  boxItemActive: {
    alignItems: "center", 
    alignContent: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
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
