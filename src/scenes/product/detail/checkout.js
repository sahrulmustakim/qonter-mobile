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
import { getProfile, formatPrice, getTotalTransaction } from '../../utils/Global'
import { POST, GET } from '../../services/ApiServices'

export default class ProductCheckout extends Component {
  _isMounted = false

  constructor(props) {
    super(props)
  
    this.state = {
      userdata: null,
      request_data: null,
      agree: true,
      promocode: null,
      promodata: {
        grand_total: 0
      },
      promoPanel: false,
      postpaid_data: null
    }
  }

  async componentDidMount() {
    this._isMounted = true
    
    // GET USER
    await getProfile().then((item) => {
      this.setState({ userdata: item })
    })

    // GET REQUEST DATA
    let request = JSON.parse(await AsyncStorage.getItem('request_data'))
    await this.setState({ request_data: request })
    console.log(request)

    // POSTPAID DATA
    let postpaid = JSON.parse(await AsyncStorage.getItem('postpaid_data'))
    await this.setState({ postpaid_data: postpaid })
    console.log(postpaid)
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
        harga: getTotalTransaction(this.state.request_data, this.state.promodata, this.state.postpaid_data, 'exclude', 'value'),
        promo_code: this.state.promocode.toUpperCase(),
        users_id: this.state.userdata.id,
        transaction_type_id: this.state.request_data.transaction_type.id
      }, true).then(async (result) => {
        console.log(result)
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
        await AsyncStorage.setItem('promo_data', JSON.stringify(this.state.promodata))
        await AsyncStorage.setItem('promo_code', this.state.promocode)
      }
      Actions.product_payment()
    }else{
      this.refs.toast_error.show('Anda belum menyetujui Syarat dan Ketentuan', 1000)
    }
  }

	render() {
		return(
      <View style={styles.container}>

        <HeaderBack title="Checkout" />
        
        {
          (this.state.request_data != null && this.state.request_data.transaction_type.type == 'prepaid') ? 
            // PRABAYAR
            <View style={styles.container_form}>
              <Text style={[styles.titleBoldGreen, {marginBottom: 10}]}>{this.state.request_data.transaction_type.name}</Text>
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
                (parseInt(this.state.promodata.grand_total) > 0) ? 
                <Row style={{height: 28}}>
                  <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                    <Text style={styles.title}>Harga</Text>
                  </Col>
                  <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                    <Text style={styles.titleBoldBlack}>Rp{getTotalTransaction(this.state.request_data, this.state.promodata, this.state.postpaid_data, 'exclude')}</Text>
                  </Col>
                </Row>
                : 
                <Row style={{height: 28}}>
                  <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                    <Text style={styles.title}>Harga</Text>
                  </Col>
                  <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                    <Text style={styles.titleBoldBlack}>Rp{getTotalTransaction(this.state.request_data, this.state.promodata, this.state.postpaid_data, 'include')}</Text>
                  </Col>
                </Row>
              }
              {
                (parseInt(this.state.promodata.grand_total) > 0) ? 
                <Row style={{height: 28}}>
                  <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                    <Text style={styles.titleBoldRed}>Diskon Promo</Text>
                  </Col>
                  <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                    <Text style={styles.titleBoldRed}>-Rp{formatPrice(this.state.promodata.grand_total)}</Text>
                  </Col>
                </Row>
                : false
              }
            </View>
          : false
        }

        {
          (this.state.request_data != null && this.state.request_data.transaction_type.type == 'postpaid') ? 
          // PASCABAYAR
          <View style={styles.container_form}>
            <Text style={[styles.titleBoldGreen, {marginBottom: 10}]}>{this.state.request_data.transaction_type.name}</Text>
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
              (this.state.postpaid_data != null && typeof this.state.postpaid_data.third_party !== 'undefined') ? 
              <View>
                <Row style={{height: 28}}>
                  <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                    <Text style={styles.title}>Nama Pelanggan</Text>
                  </Col>
                  <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                    <Text style={[styles.titleBoldBlack, {textAlign: "right"}]}>
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
                  (this.state.postpaid_data.desc != null && this.state.postpaid_data.buyer_sku_code != 'multifinance' && typeof this.state.postpaid_data.desc.alamat !== 'undefined' && this.state.postpaid_data.desc.alamat !== 'undefined') ?
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
                  (this.state.postpaid_data.desc != null && this.state.postpaid_data.buyer_sku_code != 'multifinance' && typeof this.state.postpaid_data.desc.jumlah_peserta !== 'undefined' && this.state.postpaid_data.desc.jumlah_peserta !== 'undefined') ?
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
                  <Row style={{height: this.state.postpaid_data.desc.jatuh_tempo.length > 25 ? this.state.postpaid_data.desc.jatuh_tempo.length > 45 ? 60 : 42 : 28}}>
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
              (this.state.postpaid_data != null) ? 
              <Row style={{height: 28}}>
                <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                  <Text style={styles.title}>Total Tagihan</Text>
                </Col>
                <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                  <Text style={styles.titleBoldBlack}>{getTotalTransaction(this.state.request_data, this.state.promodata, this.state.postpaid_data, 'exclude')}</Text>
                </Col>
              </Row>
              : false
            }
            {
              (parseInt(this.state.promodata.grand_total) > 0) ? 
              <Row style={{height: 28}}>
                <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                  <Text style={styles.titleBoldRed}>Diskon Promo</Text>
                </Col>
                <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                  <Text style={styles.titleBoldRed}>-Rp{formatPrice(this.state.promodata.grand_total)}</Text>
                </Col>
              </Row>
              : false
            }
          </View>
          : false
        }

        {/* PROMO VIEW */}
        <View style={styles.container_bottom}>
          <Row style={{margin: 20, backgroundColor: '#F1F4F9', padding: 5, borderRadius: 8}}>
            <Col size={1} style={{justifyContent: "center", alignItems: "center"}}>
              <Image style={{ width: 24, height: 24, resizeMode: "contain" }} source={require('../../assets/images/coupon-gray.png')} />
            </Col>
            {
              (parseInt(this.state.promodata.grand_total) > 0) ? 
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
              (parseInt(this.state.promodata.grand_total) > 0) ? 
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
            <Text style={styles.titleBoldGreen}>Rp{getTotalTransaction(this.state.request_data, this.state.promodata, this.state.postpaid_data, 'include')}</Text>
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
