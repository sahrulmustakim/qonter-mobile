import React, { Component } from 'react'
import { StyleSheet, AsyncStorage, StatusBar, Text, View, ScrollView, TouchableOpacity, Dimensions, Image } from 'react-native'
import { Grid, Col, Form, Item, Input, Label, Icon, Row } from 'native-base'
import { Actions } from 'react-native-router-flux'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import Toast from 'react-native-easy-toast'
import { Colors, Typography } from '_styles'
import HeaderBack from '_headers/back'
import Button from '_components/buttons'
import CheckBox from '@react-native-community/checkbox'
import { POST, GET } from '_services/ApiServices'
import { getProfile, formatPrice, getTotalTransaction } from '_utils/Global'
import SwipeablePanel from 'react-native-sheets-bottom'

export default class ProductCheckout extends Component {
  _isMounted = false

  constructor(props) {
    super(props)
  
    this.state = {
      agree: true,
      request_data: null,
      promo_data: {
        grand_total: 0
      },
      saldo: 0,
      dompet: 0,
      userdata: null,
      profile: null,
      payment_method: false,
      payment_method_use: 'saldo',
      postpaid_data: null,
      dompet_status: 'true'
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
        this.setState({ dompet_status: result.user[0].paylaters.status })
      }
    }).catch(error => {
      console.log(error)
    })

    // GET REQUEST DATA
    let request = JSON.parse(await AsyncStorage.getItem('request_data'))
    await this.setState({ request_data: request })
    console.log(request)

    // GET PROMO DATA
    let promo = JSON.parse(await AsyncStorage.getItem('promo_data'))
    await this.setState({ promo_data: promo })

    // POSTPAID DATA
    let postpaid = JSON.parse(await AsyncStorage.getItem('postpaid_data'))
    await this.setState({ postpaid_data: postpaid })
    console.log(postpaid)
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  async paymentMethod(){
    await this.setState({ payment_method: true })
  }

  async select(value) {
    if(value == 'paylater'){
      // if(this.state.request_data.transaction_type.id == 478 || this.state.request_data.transaction_type.id == 474 || this.state.request_data.transaction_type.id == 473 || this.state.request_data.transaction_type.id == 476){
        await this.setState({ payment_method_use: value })
        await this.setState({ payment_method: false })
      // }else{
      //   this.refs.toast_error.show('Maaf saldo Qonter tidak bisa digunakan untuk transaksi ini.', 4000)
      //   await this.setState({ payment_method_use: 'saldo' })
      //   await this.setState({ payment_method: false })
      // }
    }else{
      await this.setState({ payment_method_use: value })
      await this.setState({ payment_method: false })
    }
  }

  async next() {
    let status = false

    // GRAND TOTAL
    let grandtotal = getTotalTransaction(this.state.request_data, this.state.promo_data, this.state.postpaid_data, 'include', 'value')

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
        await AsyncStorage.setItem('payment_method', this.state.payment_method_use)
        Actions.product_pin()
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
                    <Image style={{ width: 24, height: 24, resizeMode: "contain" }} source={require('_assets/images/dbcurrency.png')} />
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
                    <Image style={{ width: 24, height: 24, resizeMode: "contain" }} source={require('_assets/images/dbcurrency.png')} />
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

          {/* PRABAYAR */}
          {
          (this.state.request_data != null && this.state.request_data.transaction_type.type == 'prepaid') ? 
            <View>
              <Text style={[styles.titleBoldGreen, {marginBottom: 10}]}>Detail Pembayaran</Text>
              <Row style={{height: 28}}>
                <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                  <Text style={styles.title}>Pembelian</Text>
                </Col>
                <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                  <Text style={styles.titleBoldBlack}>{this.state.request_data.transaction_type.name}</Text>
                </Col>
              </Row>
              <Row style={{height: 28}}>
                <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                  <Text style={styles.title}>Nomor Pelanggan</Text>
                </Col>
                <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                  <Text style={styles.titleBoldBlack}>{this.state.request_data.request}</Text>
                </Col>
              </Row>
              <Row style={{height: 28}}>
                <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                  <Text style={styles.title}>Produk</Text>
                </Col>
                <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                  <Text style={styles.titleBoldBlack}>{this.state.request_data.product.name}</Text>
                </Col>
              </Row>
              {
                (this.state.postpaid_data != null && typeof this.state.postpaid_data.name !== 'undefined') ?
                <Row style={{height: 28}}>
                  <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                    <Text style={styles.title}>Nama</Text>
                  </Col>
                  <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                    <Text style={styles.titleBoldBlack}>{this.state.postpaid_data.name}</Text>
                  </Col>
                </Row>
                : false
              }
              {
                (this.state.postpaid_data != null && typeof this.state.postpaid_data.segment_power !== 'undefined') ?
                <Row style={{height: 28}}>
                  <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                    <Text style={styles.title}>Segment Power</Text>
                  </Col>
                  <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                    <Text style={styles.titleBoldBlack}>{this.state.postpaid_data.segment_power}</Text>
                  </Col>
                </Row>
                : false
              }
              <Row style={{height: this.state.request_data.product_value.name.length > 20 ? 42 : 28}}>
                <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                  <Text style={styles.title}>Item</Text>
                </Col>
                <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                  <Text style={[styles.titleBoldBlack, {textAlign: "right"}]}>{this.state.request_data.product_value.name}</Text>
                </Col>
              </Row>
              {
                (this.state.promo_data != null && parseInt(this.state.promo_data.grand_total) > 0) ? 
                <Row style={{height: 28}}>
                  <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                    <Text style={styles.title}>Harga</Text>
                  </Col>
                  <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                    <Text style={styles.titleBoldBlack}>Rp{getTotalTransaction(this.state.request_data, this.state.promo_data, this.state.postpaid_data, 'exclude')}</Text>
                  </Col>
                </Row>
                : 
                <Row style={{height: 28}}>
                  <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                    <Text style={styles.title}>Harga</Text>
                  </Col>
                  <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                    <Text style={styles.titleBoldBlack}>Rp{getTotalTransaction(this.state.request_data, this.state.promo_data, this.state.postpaid_data, 'include')}</Text>
                  </Col>
                </Row>
              }
              {
                (this.state.promo_data != null && parseInt(this.state.promo_data.grand_total) > 0) ? 
                <Row style={{height: 28}}>
                  <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                    <Text style={styles.titleBoldRed}>Diskon Promo</Text>
                  </Col>
                  <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                    <Text style={styles.titleBoldRed}>-Rp{formatPrice(this.state.promo_data.grand_total)}</Text>
                  </Col>
                </Row>
                : false
              }
              {
                (this.state.promo_data != null && parseInt(this.state.promo_data.grand_total) > 0) ? 
                <Row style={{height: 28}}>
                  <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                    <Text style={styles.title}>Total</Text>
                  </Col>
                  <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                    <Text style={styles.titleBoldBlack}>Rp{getTotalTransaction(this.state.request_data, this.state.promo_data, this.state.postpaid_data, 'include')}</Text>
                  </Col>
                </Row>
                : false
              }
            </View>
          : false 
          }

          {/* POSTPAID */}
          {
          (this.state.request_data != null && this.state.request_data.transaction_type.type == 'postpaid') ? 
            <View>
              <Text style={[styles.titleBoldGreen, {marginBottom: 10}]}>Detail Pembayaran</Text>
              <Row style={{height: 28}}>
                <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                  <Text style={styles.title}>Produk</Text>
                </Col>
                <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                  <Text style={styles.titleBoldBlack}>{this.state.request_data.transaction_type.name}</Text>
                </Col>
              </Row>
              {
                (this.state.request_data.transaction_type.name != this.state.request_data.product.name) ?
                <Row style={{height: this.state.request_data.product.name.length > 25 ? this.state.request_data.product.name.length > 45 ? 60 : 42 : 28}}>
                  <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                    <Text style={styles.title}>Jenis Layanan</Text>
                  </Col>
                  <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                    <Text style={styles.titleBoldBlack}>{this.state.request_data.product.name}</Text>
                  </Col>
                </Row>
                : false
              }
              <Row style={{height: 28}}>
                <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                  <Text style={styles.title}>Nomor Pelanggan</Text>
                </Col>
                <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                  <Text style={styles.titleBoldBlack}>{this.state.request_data.request}</Text>
                </Col>
              </Row>
              {
                (this.state.request_data != null && this.state.postpaid_data != null) ? 
                <View>
                  <Row style={{height: 28}}>
                    <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                      <Text style={styles.title}>Atas Nama</Text>
                    </Col>
                    <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                      <Text style={styles.titleBoldBlack}>
                        {(this.state.postpaid_data != null) ? this.state.postpaid_data.customer_name.trim() : ''}
                      </Text>
                    </Col>
                  </Row>
                  {
                    (this.state.postpaid_data.desc != null && typeof this.state.postpaid_data.desc.item_name !== 'undefined') ?
                    <Row style={{height: this.state.postpaid_data.desc.item_name.length > 25 ? this.state.postpaid_data.desc.item_name.length > 45 ? 60 : 42 : 28}}>
                      <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                        <Text style={styles.title}>Item</Text>
                      </Col>
                      <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                        <Text style={[styles.titleBoldBlack, {textAlign: "right"}]}>
                          {(this.state.postpaid_data != null) ? this.state.postpaid_data.desc.item_name : ''}
                        </Text>
                      </Col>
                    </Row>
                    : false
                  }
                  {
                    (this.state.postpaid_data.desc != null && typeof this.state.postpaid_data.desc.no_pol !== 'undefined') ?
                    <Row style={{height: 28}}>
                      <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                        <Text style={styles.title}>No Polisi</Text>
                      </Col>
                      <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                        <Text style={styles.titleBoldBlack}>
                          {(this.state.postpaid_data != null) ? this.state.postpaid_data.desc.no_pol : ''}
                        </Text>
                      </Col>
                    </Row>
                    : false
                  }
                  {
                    (this.state.postpaid_data.desc != null && typeof this.state.postpaid_data.desc.no_rangka !== 'undefined') ?
                    <Row style={{height: 28}}>
                      <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                        <Text style={styles.title}>No Rangka</Text>
                      </Col>
                      <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                        <Text style={styles.titleBoldBlack}>
                          {(this.state.postpaid_data != null) ? this.state.postpaid_data.desc.no_rangka : ''}
                        </Text>
                      </Col>
                    </Row>
                    : false
                  }
                  {
                    (this.state.postpaid_data.desc != null && typeof this.state.postpaid_data.desc.tenor !== 'undefined') ?
                    <Row style={{height: 28}}>
                      <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                        <Text style={styles.title}>Tenor</Text>
                      </Col>
                      <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                        <Text style={styles.titleBoldBlack}>
                          {(this.state.postpaid_data != null) ? parseInt(this.state.postpaid_data.desc.tenor) : ''}
                        </Text>
                      </Col>
                    </Row>
                    : false
                  }
                  {
                    (this.state.postpaid_data.desc != null && typeof this.state.postpaid_data.desc.daya !== 'undefined') ?
                    <Row style={{height: 28}}>
                      <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                        <Text style={styles.title}>Daya</Text>
                      </Col>
                      <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                        <Text style={styles.titleBoldBlack}>
                          {(this.state.postpaid_data != null) ? parseInt(this.state.postpaid_data.desc.daya) : ''}
                        </Text>
                      </Col>
                    </Row>
                    : false
                  }
                  {
                    (this.state.postpaid_data.desc != null && this.state.postpaid_data.buyer_sku_code == 'multifinance' && this.state.postpaid_data.desc.detail != null && this.state.postpaid_data.desc.detail.length > 0 && typeof this.state.postpaid_data.desc.detail[0] !== 'undefined') ?
                    <Row style={{height: 28}}>
                      <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                        <Text style={styles.title}>Angsuran Ke</Text>
                      </Col>
                      <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                        <Text style={styles.titleBoldBlack}>
                          {(this.state.postpaid_data != null) ? parseInt(this.state.postpaid_data.desc.detail[0].periode) : ''}
                        </Text>
                      </Col>
                    </Row>
                    : false
                  }
                  {
                    (this.state.postpaid_data.desc != null && this.state.postpaid_data.buyer_sku_code != 'multifinance' && typeof this.state.postpaid_data.desc.alamat !== 'undefined') ?
                    <Row style={{height: this.state.postpaid_data.desc.alamat.length > 25 ? this.state.postpaid_data.desc.alamat.length > 45 ? 60 : 42 : 28}}>
                      <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                        <Text style={styles.title}>Alamat</Text>
                      </Col>
                      <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                        <Text style={styles.titleBoldBlack}>
                          {(this.state.postpaid_data != null) ? this.state.postpaid_data.desc.alamat : ''}
                        </Text>
                      </Col>
                    </Row>
                    : false
                  }
                  {
                    (this.state.postpaid_data.desc != null && this.state.postpaid_data.buyer_sku_code != 'multifinance' && typeof this.state.postpaid_data.desc.jumlah_peserta !== 'undefined') ?
                    <Row style={{height: 28}}>
                      <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                        <Text style={styles.title}>Jumlah Peserta</Text>
                      </Col>
                      <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                        <Text style={styles.titleBoldBlack}>
                          {(this.state.postpaid_data != null) ? this.state.postpaid_data.desc.jumlah_peserta+' Orang' : ''}
                        </Text>
                      </Col>
                    </Row>
                    : false
                  }
                  {
                    (this.state.postpaid_data.desc != null && this.state.postpaid_data.buyer_sku_code != 'multifinance' && this.state.postpaid_data.desc.detail != null && this.state.postpaid_data.desc.detail.length > 0 && typeof this.state.postpaid_data.desc.detail[0].periode !== 'undefined') ?
                    <Row style={{height: 28}}>
                      <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                        <Text style={styles.title}>Periode</Text>
                      </Col>
                      <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                        <Text style={styles.titleBoldBlack}>
                          {(this.state.postpaid_data != null) ? this.state.postpaid_data.desc.detail[0].periode : ''}
                        </Text>
                      </Col>
                    </Row>
                    : false
                  }
                  {
                    (this.state.postpaid_data.desc != null && this.state.postpaid_data.buyer_sku_code != 'multifinance' && typeof this.state.postpaid_data.desc.jatuh_tempo !== 'undefined') ?
                    <Row style={{height: 28}}>
                      <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                        <Text style={styles.title}>Jatuh Tempo</Text>
                      </Col>
                      <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                        <Text style={styles.titleBoldBlack}>
                          {(this.state.postpaid_data != null) ? this.state.postpaid_data.desc.jatuh_tempo : ''}
                        </Text>
                      </Col>
                    </Row>
                    : false
                  }
                  {
                    (this.state.postpaid_data.desc != null && this.state.postpaid_data.buyer_sku_code != 'multifinance' && this.state.postpaid_data.desc.detail != null && this.state.postpaid_data.desc.detail.length > 0 && typeof this.state.postpaid_data.desc.detail[0].meter_awal !== 'undefined') ?
                    <Row style={{height: 28}}>
                      <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                        <Text style={styles.title}>Meter Awal</Text>
                      </Col>
                      <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                        <Text style={styles.titleBoldBlack}>
                          {(this.state.postpaid_data != null) ? parseInt(this.state.postpaid_data.desc.detail[0].meter_awal) : ''}
                        </Text>
                      </Col>
                    </Row>
                    : false
                  }
                  {
                    (this.state.postpaid_data.desc != null && this.state.postpaid_data.buyer_sku_code != 'multifinance' && this.state.postpaid_data.desc.detail != null && this.state.postpaid_data.desc.detail.length > 0 && typeof this.state.postpaid_data.desc.detail[0].meter_akhir !== 'undefined') ?
                    <Row style={{height: 28}}>
                      <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                        <Text style={styles.title}>Meter Akhir</Text>
                      </Col>
                      <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                        <Text style={styles.titleBoldBlack}>
                          {(this.state.postpaid_data != null) ? parseInt(this.state.postpaid_data.desc.detail[0].meter_akhir) : ''}
                        </Text>
                      </Col>
                    </Row>
                    : false
                  }
                </View>
                : false
              }
              {
                (this.state.promo_data != null && parseInt(this.state.promo_data.grand_total) > 0) ? 
                <Row style={{height: 28}}>
                  <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                    <Text style={styles.title}>Harga</Text>
                  </Col>
                  <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                    <Text style={styles.titleBoldBlack}>Rp{getTotalTransaction(this.state.request_data, this.state.promo_data, this.state.postpaid_data, 'exclude')}</Text>
                  </Col>
                </Row>
                : 
                <Row style={{height: 28}}>
                  <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                    <Text style={styles.title}>Harga</Text>
                  </Col>
                  <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                    <Text style={styles.titleBoldBlack}>Rp{getTotalTransaction(this.state.request_data, this.state.promo_data, this.state.postpaid_data, 'include')}</Text>
                  </Col>
                </Row>
              }
              {
                (this.state.promo_data != null && parseInt(this.state.promo_data.grand_total) > 0) ? 
                <Row style={{height: 28}}>
                  <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                    <Text style={styles.titleBoldRed}>Diskon Promo</Text>
                  </Col>
                  <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                    <Text style={styles.titleBoldRed}>-Rp{formatPrice(this.state.promo_data.grand_total)}</Text>
                  </Col>
                </Row>
                : false
              }
              {
                (this.state.promo_data != null && parseInt(this.state.promo_data.grand_total) > 0) ? 
                <Row style={{height: 28}}>
                  <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                    <Text style={styles.title}>Total</Text>
                  </Col>
                  <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                    <Text style={styles.titleBoldBlack}>Rp{getTotalTransaction(this.state.request_data, this.state.promo_data, this.state.postpaid_data, 'include')}</Text>
                  </Col>
                </Row>
                : false
              }
            </View>
          : false 
          }
        </View>

        <View style={styles.container_bottom}>
          <View style={{margin: 20}}>
            <Text style={styles.titleSmallGray}>Total Pembayaran</Text>
            <Text style={styles.titleBoldGreen}>Rp{getTotalTransaction(this.state.request_data, this.state.promo_data, this.state.postpaid_data, 'include')}</Text>
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
                      <Image style={{ width: 45, height: 45, resizeMode: "contain" }} source={require('_assets/images/dbcurrency.png')} />
                    </Col>
                    <Col size={10} style={{justifyContent: "center"}}>
                      <Text style={styles.labelItem}>Saldo</Text>
                      <Text style={styles.labelItemPrice}>Rp{formatPrice(this.state.saldo)}</Text>
                    </Col>
                  </Grid>
                </TouchableOpacity>
              </Col>
            </Row>
            {
              (this.state.userdata != null && this.state.userdata.role_id == 5) ? 
                <Row style={{marginBottom: 5}}>
                  <Col style={(this.state.payment_method_use != null && this.state.payment_method_use == 'paylater') ? styles.boxItemActive : styles.boxItem}>
                    {
                      (this.state.dompet_status == 'true') ? 
                      <TouchableOpacity style={{alignItems: "center", alignContent: "center"}} onPress={() => this.select('paylater')}>
                        <Grid>
                          <Col size={2} style={{alignItems: "center", padding: 5, justifyContent: "center"}}>
                            <Image style={{ width: 45, height: 45, resizeMode: "contain" }} source={require('_assets/images/dbcurrency.png')} />
                          </Col>
                          <Col size={10} style={{justifyContent: "center"}}>
                            <Text style={styles.labelItem}>Qonter</Text>
                            <Text style={styles.labelItemPrice}>Rp{formatPrice(this.state.dompet)}</Text>
                          </Col>
                        </Grid>
                      </TouchableOpacity>
                      :
                      <Grid>
                        <Col size={2} style={{alignItems: "center", padding: 5, justifyContent: "center"}}>
                          <Image style={{ width: 45, height: 45, resizeMode: "contain" }} source={require('_assets/images/dbcurrency.png')} />
                        </Col>
                        <Col size={10} style={{justifyContent: "center"}}>
                          <Text style={styles.labelItem}>Qonter</Text>
                          <Text style={styles.labelItemPrice}>
                            Rp{formatPrice(this.state.dompet)} {' '}
                            {
                              (this.state.dompet_status == 'false') ? 
                              <Text style={{color: '#cc4b37', fontSize: 10, fontWeight: "bold"}}>Diblokir</Text>
                              : false
                            }
                          </Text>
                        </Col>
                      </Grid>
                    }
                  </Col>
                </Row>
              : false
            }
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
