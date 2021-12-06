import React, { Component } from 'react'
import { StyleSheet, AsyncStorage, StatusBar, Text, View, ScrollView, RefreshControl, TouchableOpacity, Dimensions, Image, BackHandler, PermissionsAndroid, Alert } from 'react-native'
import { Grid, Col, Form, Item, Input, Label, Icon, Row, Badge } from 'native-base'
import { Actions } from 'react-native-router-flux'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import Toast from 'react-native-easy-toast'
import { Colors, Typography } from '../../styles'
import HeaderBack from '../../components/headers/noback'
import Button from '../../components/buttons'
import ButtonFill from '../../components/buttons/fill'
import { POST, GET } from '../../services/ApiServices'
import { getProfile, formatPrice, getTotalTransaction, getProvitTransaction } from '../../utils/Global'
import Moment from 'moment'
import RNFetchBlob from 'rn-fetch-blob'
import { server_api } from '_configs/env'

export default class ProductStatus extends Component {
  _isMounted = false

  constructor(props) {
    super(props)
  
    this.state = {
      pin: null,
      userdata: null,
      request: null,
      promo: null,
      promo_code: null,
      postpaid_data: null,
      payment: null,
      transaction_request: null,
      transaction_response: null,
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
    await this.setState({ request: request })

    // GET PROMO DATA
    let promo = JSON.parse(await AsyncStorage.getItem('promo_data'))
    let promo_code = await AsyncStorage.getItem('promo_code')
    await this.setState({ promo: promo })
    await this.setState({ promo_code: promo_code })

    // POSTPAID DATA
    let postpaid = JSON.parse(await AsyncStorage.getItem('postpaid_data'))
    await this.setState({ postpaid_data: postpaid })
    console.log(postpaid)

    // GET PAYMENT METHOD
    let payment = await AsyncStorage.getItem('payment_method')
    await this.setState({ payment: payment })

    // GET TRANSACTION DATA
    let transaction_request = JSON.parse(await AsyncStorage.getItem('transaction_request'))
    let transaction_response = JSON.parse(await AsyncStorage.getItem('transaction_response'))
    await this.setState({ transaction_request: transaction_request })
    await this.setState({ transaction_response: transaction_response })
    
    // console.log('TRX RESPONSE -> '+JSON.stringify(this.state.transaction_response))

    // GET STATUS TRX
    await GET('detail/trx/'+this.state.transaction_response.id, {}, true).then(async (result) => {
      this.setState({ transaction_response: result[0] })
    }).catch(error => {
      console.log(error)
      this.refs.toast_error.show('Pengecekan status transaksi gagal', 1000)
    })

    // console.log('REQUEST -> '+JSON.stringify(this.state.request))
    // console.log('PROMO -> '+JSON.stringify(this.state.promo))
    // console.log('TRX REQUEST -> '+JSON.stringify(this.state.transaction_request))
    console.log('TRX RESPONSE -> '+JSON.stringify(this.state.transaction_response))

    // TIMER STATUS
    if(this.state.transaction_response != null && typeof this.state.transaction_response.status !== 'undefined' && this.state.transaction_response.status.toLowerCase() == 'pending'){
      let maxCheck = 1
      const timer = setInterval(async () => {
        if(maxCheck > 3){
          clearInterval(timer)
        }else{
          await GET('detail/trx/'+this.state.transaction_response.id, {}, true).then(async (result) => {
            this.setState({ transaction_response: result[0] })
          }).catch(error => {
            console.log(error)
          })
          console.log('Check Status Transaction '+maxCheck)
          maxCheck++
        }
      }, 10000);
    }

    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress)
  }

  componentWillUnmount() {
    this._isMounted = false
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
  }

  handleBackPress() {
    Actions.reset('menus')
  }

  _onRefresh = () => {
    Actions.refresh({key: Moment.utc().format('YYYYMMDDhhmmss')})
  }

  async next() {
    Actions.reset('menus')
  }

  actualDownload = () => {
    const { dirs } = RNFetchBlob.fs;
    RNFetchBlob.config({
      fileCache: true,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        mediaScannable: true,
        title: 'ABATA-'+this.state.transaction_response.ref_id_TP+'.pdf',
        path: dirs.DownloadDir+'/ABATA-'+this.state.transaction_response.ref_id_TP+'.pdf',
      },
    })
    .fetch('GET', server_api.baseURL+'user/struk/'+this.state.transaction_response.id, {})
    .then((res) => {
      this.refs.toast_success.show('Struk berhasil disimpan di '+res.path(), 4000)
    })
    .catch((e) => {
      console.log(e)
    });
  }

  async print() {
    try {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        this.actualDownload();
      } else {
        Alert.alert('Permission Denied!', 'You need to give storage permission to download the file');
      }
    } catch (err) {
      console.warn(err);
    }
  }

	render() {
		return(
      <View style={styles.container}>

        <HeaderBack title="Pembayaran" />
        
        <ScrollView 
          ref={ref => {this.scrollView = ref}}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this._onRefresh}
            />
          }
          style={styles.container} 
          scrollEnabled={true}>
          <View style={[styles.container_form, { borderBottomWidth: 9, borderBottomColor: '#F0F0F0', alignItems: "center" }]}>
            <Row style={{height: 75}}>
              <Col size={4} style={{alignItems: "flex-start", justifyContent: "center"}}>
                <Image style={{ width: 75, height: 85, resizeMode: "contain", marginBottom: 10 }} source={require('../../assets/images/success.png')} />
              </Col>
              <Col size={10} style={{alignItems: "flex-start", justifyContent: "center"}}>
                <Text style={[styles.titleBoldGreen, { marginBottom: 5, textAlign: "left" }]}>Pembayaran Berhasil</Text>
                {
                  (this.state.transaction_response != null && typeof this.state.transaction_response.status !== 'undefined' && this.state.transaction_response.status.toLowerCase() == 'pending') ? 
                  <Text style={[styles.titleSmallGray, { marginBottom: 5, textAlign: "left" }]}>Transaksi sedang di proses. Saldo Anda tidak akan berkurang selama transaksi masih pending.</Text>
                  : false
                }
                {
                  (this.state.transaction_response != null && typeof this.state.transaction_response.status !== 'undefined' && this.state.transaction_response.status.toLowerCase() == 'success') ? 
                  <Text style={[styles.titleSmallGray, { marginBottom: 5, textAlign: "left" }]}>Transaksi berhasil di proses. Silahkan cek di menu riwayat transaksi.</Text>
                  : false
                }
                {
                  (this.state.transaction_response != null && typeof this.state.transaction_response.status !== 'undefined' && this.state.transaction_response.status.toLowerCase() == 'failed') ? 
                  <Text style={[styles.titleSmallGray, { marginBottom: 5, textAlign: "left" }]}>Transaksi gagal di proses. Saldo tidak berkurang. Silahkan cek di menu riwayat transaksi.</Text>
                  : false
                }
                {
                  (this.state.transaction_response != null && typeof this.state.transaction_response.status !== 'undefined' && this.state.transaction_response.status.toLowerCase() == 'failed' && typeof this.state.transaction_response.message != 'undefined' && this.state.transaction_response.message != null) ? 
                  <Text style={[styles.titleSmallBlack, { marginBottom: 5, textAlign: "left" }]}>{this.state.transaction_response.message}</Text>
                  : false
                }
                {
                  (this.state.transaction_response != null) ? 
                  <View style={{marginTop: 5, alignItems: "center", justifyContent: "center", alignContent: "center"}}>
                    {
                      (typeof this.state.transaction_response.status !== 'undefined' && this.state.transaction_response.status.toLowerCase() == 'pending') ? 
                      <Badge warning>
                        <Text style={[styles.titleBoldBlack, { textAlign: "center", fontSize: 14, paddingLeft: 5, paddingRight: 5 }]}>{this.state.transaction_response.status.toUpperCase()}</Text>
                      </Badge>
                      : false
                    }
                    {
                      (typeof this.state.transaction_response.status !== 'undefined' && this.state.transaction_response.status.toLowerCase() == 'success') ? 
                      <Badge success>
                        <Text style={[styles.titleBoldBlack, { textAlign: "center", fontSize: 14, paddingLeft: 5, paddingRight: 5 }]}>{this.state.transaction_response.status.toUpperCase()}</Text>
                      </Badge>
                      : false
                    }
                    {
                      (typeof this.state.transaction_response.status !== 'undefined' && this.state.transaction_response.status.toLowerCase() == 'failed') ? 
                      <Badge danger>
                        <Text style={[styles.titleBoldBlack, { textAlign: "center", fontSize: 14, paddingLeft: 5, paddingRight: 5 }]}>{this.state.transaction_response.status.toUpperCase()}</Text>
                      </Badge>
                      : false
                    }
                  </View>
                  : 
                  false
                }
              </Col>
            </Row>
          </View>
          <View style={styles.container_form}>
            <Row style={{height: 28}}>
              <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                <Text style={[styles.titleBoldGreen, {marginBottom: 10}]}>{(this.state.request != null) ? this.state.request.transaction_type.name : ''}</Text>
              </Col>
              <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                <Text style={[styles.titleBoldGreen, {marginBottom: 10}]}>
                  {(this.state.transaction_response != null) ? Moment(this.state.transaction_response.created_at).format('DD MMMM YYYY') : ''}
                </Text>
              </Col>
            </Row>
            <Row style={{height: 28}}>
              <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                <Text style={styles.title}>No Transaksi</Text>
              </Col>
              <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                <Text style={styles.titleBoldBlack}>{(this.state.transaction_response != null) ? this.state.transaction_response.ref_id_TP : ''}</Text>
              </Col>
            </Row>

            {/* PRABAYAR */}
            {
              (this.state.request != null && this.state.request.transaction_type.type == 'prepaid') ? 
              <View>
                <Row style={{height: 28}}>
                  <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                    <Text style={styles.title}>Pembelian</Text>
                  </Col>
                  <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                    <Text style={styles.titleBoldBlack}>{this.state.request.transaction_type.name}</Text>
                  </Col>
                </Row>
                <Row style={{height: 28}}>
                  <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                    <Text style={styles.title}>Nomor Pelanggan</Text>
                  </Col>
                  <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                    <Text style={styles.titleBoldBlack}>{(this.state.transaction_request != null) ? this.state.transaction_request.user_code : ''}</Text>
                  </Col>
                </Row>
                <Row style={{height: 28}}>
                  <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                    <Text style={styles.title}>Produk</Text>
                  </Col>
                  <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                    <Text style={styles.titleBoldBlack}>{this.state.request.product.name}</Text>
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
                <Row style={{height: this.state.request.product_value.name.length > 20 ? 42 : 28}}>
                  <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                    <Text style={styles.title}>Item</Text>
                  </Col>
                  <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                    <Text style={[styles.titleBoldBlack, {textAlign: "right"}]}>{this.state.request.product_value.name}</Text>
                  </Col>
                </Row>
              </View>
              : false
            }

            {
              // POSTPAID
              (this.state.request != null && this.state.request.transaction_type.type == 'postpaid' && this.state.request.product.operator != 'prepaid') ? 
              <View>
                <Row style={{height: this.state.request.product.name.length > 25 ? this.state.request.product.name.length > 45 ? 60 : 42 : 28}}>
                  <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                    <Text style={styles.title}>Jenis Layanan</Text>
                  </Col>
                  <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                    <Text style={styles.titleBoldBlack}>
                      {this.state.request.product.name}
                    </Text>
                  </Col>
                </Row>
                <Row style={{height: 28}}>
                  <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                    <Text style={styles.title}>Nomor Pelanggan</Text>
                  </Col>
                  <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                    <Text style={styles.titleBoldBlack}>{this.state.request.request}</Text>
                  </Col>
                </Row>
                {
                  (this.state.request != null && this.state.postpaid_data != null) ? 
                  <View>
                    <Row style={{height: 28}}>
                      <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                        <Text style={styles.title}>Nama Pelanggan</Text>
                      </Col>
                      <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                        <Text style={styles.titleBoldBlack}>
                          {(this.state.postpaid_data != null) ? this.state.postpaid_data.customer_name : ''}
                        </Text>
                      </Col>
                    </Row>
                    {
                      (this.state.postpaid_data.desc != null && this.state.postpaid_data.desc.alamat !== 'undefined' && this.state.postpaid_data.desc.alamat != null && this.state.postpaid_data.desc.alamat != '') ?
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
                      (this.state.postpaid_data.desc != null && typeof this.state.postpaid_data.desc.jumlah_peserta !== 'undefined' && this.state.postpaid_data.desc.jumlah_peserta != null) ?
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
                      (this.state.postpaid_data.desc != null && this.state.postpaid_data.desc.detail != null && this.state.postpaid_data.desc.detail.length > 0 && typeof this.state.postpaid_data.desc.detail[0].periode !== 'undefined') ?
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
                      (this.state.postpaid_data.desc != null && typeof this.state.postpaid_data.desc.jatuh_tempo !== 'undefined' && this.state.postpaid_data.desc.jatuh_tempo != null) ?
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
                      (this.state.postpaid_data.desc != null && this.state.postpaid_data.desc.detail != null && this.state.postpaid_data.desc.detail.length > 0 && typeof this.state.postpaid_data.desc.detail[0].meter_awal !== 'undefined') ?
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
                      (this.state.postpaid_data.desc != null && this.state.postpaid_data.desc.detail != null && this.state.postpaid_data.desc.detail.length > 0 && typeof this.state.postpaid_data.desc.detail[0].meter_akhir !== 'undefined') ?
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
              </View>
              : false
            }

            {/* HARGA */}
            <Row style={{height: 28}}>
              <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                <Text style={styles.title}>Harga</Text>
              </Col>
              <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                {
                  (this.state.promo_code != null) ? 
                  <Text style={styles.titleBoldBlack}>Rp{(this.state.transaction_request != null) ? formatPrice(this.state.transaction_request.harga_awal) : ''}</Text>
                  :
                  <Text style={styles.titleBoldBlack}>Rp{(this.state.transaction_request != null) ? formatPrice(this.state.transaction_request.grand_total) : ''}</Text>
                }
              </Col>
            </Row>
            {
              (this.state.promo != null && parseInt(this.state.promo.grand_total) > 0) ? 
              <Row style={{height: 28}}>
                <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                  <Text style={styles.title}>Diskon Promo</Text>
                </Col>
                <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                  <Text style={styles.titleBoldGreen}>-Rp{formatPrice(this.state.promo.grand_total)}</Text>
                </Col>
              </Row>
              : false
            }
            {
              (this.state.promo_code != null) ? 
              <Row style={{height: 28}}>
                <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                  <Text style={styles.title}>Total</Text>
                </Col>
                <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                  <Text style={styles.titleBoldBlack}>Rp{(this.state.transaction_request != null) ? formatPrice(this.state.transaction_request.grand_total) : ''}</Text>
                </Col>
              </Row>
              : false
            }
            {
              (this.state.request != null && this.state.transaction_response != null && typeof this.state.transaction_response.response !== 'undefined' && this.state.transaction_response.response != null && typeof this.state.transaction_response.response.sn !== 'undefined' && this.state.transaction_response.response.sn != null) ?
              <Row style={{height: this.state.transaction_response.response.sn.length > 20 ? this.state.transaction_response.response.sn.length > 40 ? 60 : 42 : 28}}>
                <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                  <Text style={styles.titleBoldGreen}>Nomor Pembelian</Text>
                </Col>
                <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                  <Text style={[styles.titleBoldGreen, {textAlign: "right"}]}>
                    {this.state.transaction_response.response.sn}
                  </Text>
                </Col>
              </Row>
              : false
            }
          </View>
        </ScrollView>

        <View style={styles.container_bottom}>
          {
            (this.state.transaction_response != null && typeof this.state.transaction_response.status !== 'undefined' && typeof this.state.transaction_response.status !== 'undefined' && this.state.transaction_response.status.toLowerCase() == 'success') ? 
            <View style={{marginBottom: 10}}>
              <ButtonFill btnLabel='Riwayat Transaksi' onPress={() => Actions.history()} />
            </View>
            : false
          }
          <Button btnLabel='Halaman Utama' onPress={() => Actions.reset('menus')} />
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
    padding: 25
  },
  container_bottom: {
    position: "absolute",
    bottom: 10,
    width: '100%'
  },
  titleSmallBlack: {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontWeight: Typography.FONT_WEIGHT_REGULAR,
    color: '#333333',
    fontSize: 14,
  },
  titleSmallGray: {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontWeight: Typography.FONT_WEIGHT_REGULAR,
    color: '#858585',
    fontSize: 14,
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
    fontSize: 18,
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
});
