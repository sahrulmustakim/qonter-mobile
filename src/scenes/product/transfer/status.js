import React, { Component } from 'react'
import { StyleSheet, AsyncStorage, StatusBar, Text, View, ScrollView, RefreshControl, TouchableOpacity, Dimensions, Image, BackHandler, PermissionsAndroid, Alert } from 'react-native'
import { Grid, Col, Form, Item, Input, Label, Icon, Row, Badge } from 'native-base'
import { Actions } from 'react-native-router-flux'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import Toast from 'react-native-easy-toast'
import { Colors, Typography } from '_styles'
import HeaderBack from '_headers/noback'
import Button from '_components/buttons'
import ButtonFill from '_components/buttons/fill'
import { POST, GET } from '_services/ApiServices'
import { getProfile, formatPrice, getTotalTransfer } from '_utils/Global'
import Moment from 'moment'
import RNFetchBlob from 'rn-fetch-blob'
import { server_api } from '_configs/env'

export default class ProductStatus extends Component {
  _isMounted = false

  constructor(props) {
    super(props)
  
    this.state = {
      userdata: null,
      product_data: null,
      bank_data: null,
      request_data: null,
      promo_code: null,
      promo_data: null,
      response_data: null,
      payment_data: null
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

    // GET BANK DATA
    let bank = JSON.parse(await AsyncStorage.getItem('tf_bank_data'))
    await this.setState({ bank_data: bank })

    // GET REQUEST DATA
    let request = JSON.parse(await AsyncStorage.getItem('tf_request_data'))
    await this.setState({ request_data: request })
    
    // GET PROMO DATA
    let promo = JSON.parse(await AsyncStorage.getItem('tf_promo_data'))
    let promocode = await AsyncStorage.getItem('tf_promo_code')
    await this.setState({ promo_data: promo })
    await this.setState({ promo_code: promocode })

    // GET PAYMENT METHOD
    let payment = await AsyncStorage.getItem('tf_payment_method')
    await this.setState({ payment_code: payment })

    // GET RESPONSE DATA
    let response = JSON.parse(await AsyncStorage.getItem('tf_response_data'))
    await this.setState({ response_data: response })
    console.log(response)

    // TIMER STATUS
    if(this.state.response_data != null && typeof this.state.response_data.status !== 'undefined' && this.state.response_data.status.toLowerCase() == 'pending'){
      let maxCheck = 1
      const timer = setInterval(async () => {
        if(maxCheck > 6){
          clearInterval(timer)
        }else{
          await GET('detail/trx/'+this.state.response_data.id, {}, true).then(async (result) => {
            await AsyncStorage.setItem('tf_response_data', JSON.stringify(result[0]))
            this.setState({ response_data: result[0] })
          }).catch(error => {
            console.log(error)
          })
          console.log('Check Status Transaction '+maxCheck)
          maxCheck++
        }
      }, 5000);
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
        title: 'ABATA-'+this.state.response_data.ref_id_TP+'.pdf',
        path: dirs.DownloadDir+'/ABATA-'+this.state.response_data.ref_id_TP+'.pdf',
      },
    })
    .fetch('GET', server_api.baseURL+'user/struk/transfer/'+this.state.response_data.id, {})
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
                <Image style={{ width: 75, height: 85, resizeMode: "contain", marginBottom: 10 }} source={require('_assets/images/success.png')} />
              </Col>
              <Col size={10} style={{alignItems: "flex-start", justifyContent: "center"}}>
                <Text style={[styles.titleBoldGreen, { marginBottom: 5, textAlign: "left" }]}>Pembayaran Berhasil</Text>
                {
                  (this.state.response_data != null && typeof this.state.response_data.status !== 'undefined' && this.state.response_data.status.toLowerCase() == 'pending') ? 
                  <Text style={[styles.titleSmallGray, { marginBottom: 5, textAlign: "left" }]}>Transaksi sedang di proses. Saldo Anda tidak akan berkurang selama transaksi masih pending.</Text>
                  : false
                }
                {
                  (this.state.response_data != null && typeof this.state.response_data.status !== 'undefined' && this.state.response_data.status.toLowerCase() == 'success') ? 
                  <Text style={[styles.titleSmallGray, { marginBottom: 5, textAlign: "left" }]}>Transaksi berhasil di proses. Silahkan cek di menu riwayat transaksi.</Text>
                  : false
                }
                {
                  (this.state.response_data != null && typeof this.state.response_data.status !== 'undefined' && this.state.response_data.status.toLowerCase() == 'failed') ? 
                  <Text style={[styles.titleSmallGray, { marginBottom: 5, textAlign: "left" }]}>Transaksi gagal di proses. Saldo tidak berkurang. Silahkan cek di menu riwayat transaksi.</Text>
                  : false
                }
                {
                  (this.state.response_data != null && typeof this.state.response_data.response !== 'undefined' && this.state.response_data.response != null && this.state.response_data.status.toLowerCase() == 'failed' && typeof this.state.response_data.response.status.message != 'undefined' && this.state.response_data.response.status.message != null) ? 
                  <Text style={[styles.titleSmallBlack, { marginBottom: 5, textAlign: "left" }]}>{this.state.response_data.response.status.message}</Text>
                  : false
                }
                {
                  (this.state.response_data != null) ? 
                  <View style={{marginTop: 5, alignItems: "center", justifyContent: "center", alignContent: "center"}}>
                    {
                      (typeof this.state.response_data.status !== 'undefined' && this.state.response_data.status.toLowerCase() == 'pending') ? 
                      <Badge warning>
                        <Text style={[styles.titleBoldBlack, { textAlign: "center", fontSize: 14, paddingLeft: 5, paddingRight: 5 }]}>{this.state.response_data.status.toUpperCase()}</Text>
                      </Badge>
                      : false
                    }
                    {
                      (typeof this.state.response_data.status !== 'undefined' && this.state.response_data.status.toLowerCase() == 'success') ? 
                      <Badge success>
                        <Text style={[styles.titleBoldBlack, { textAlign: "center", fontSize: 14, paddingLeft: 5, paddingRight: 5 }]}>{this.state.response_data.status.toUpperCase()}</Text>
                      </Badge>
                      : false
                    }
                    {
                      (typeof this.state.response_data.status !== 'undefined' && this.state.response_data.status.toLowerCase() == 'failed') ? 
                      <Badge danger>
                        <Text style={[styles.titleBoldBlack, { textAlign: "center", fontSize: 14, paddingLeft: 5, paddingRight: 5 }]}>{this.state.response_data.status.toUpperCase()}</Text>
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
                <Text style={[styles.titleBoldGreen, {marginBottom: 10}]}>Kirim Uang</Text>
              </Col>
              <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                <Text style={[styles.titleBoldGreen, {marginBottom: 10}]}>
                  {(this.state.response_data != null) ? Moment(this.state.response_data.created_at).format('DD MMMM YYYY') : ''}
                </Text>
              </Col>
            </Row>
            <Row style={{height: 28}}>
              <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                <Text style={styles.title}>No Transaksi</Text>
              </Col>
              <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                <Text style={styles.titleBoldBlack}>{(this.state.response_data != null && typeof this.state.response_data.ref_id_TP !== 'undefined' && this.state.response_data.ref_id_TP != null) ? this.state.response_data.ref_id_TP : ''}</Text>
              </Col>
            </Row>

            {/* DETAIL */}
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
              (this.state.response_data != null && typeof this.state.response_data.response.recipient_name !== 'undefined') ?
              <Row style={{height: this.state.response_data.response.recipient_name.length > 15 ? this.state.response_data.response.recipient_name.length > 30 ? 60 : 42 : 28}}>
                <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                  <Text style={styles.title}>Atas Nama</Text>
                </Col>
                <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                  <Text style={[styles.titleBoldBlack, {textAlign: "right"}]}>{this.state.response_data.response.recipient_name}</Text>
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

            {/* HARGA */}
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
            <Row style={{height: 28}}>
              <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                <Text style={styles.title}>Grand Total</Text>
              </Col>
              <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                <Text style={styles.titleBoldBlack}>Rp{formatPrice(getTotalTransfer(this.state.request_data, this.state.promo_data, 'exclude'))}</Text>
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
              (this.state.promo != null && parseInt(this.state.promo.grand_total) > 0) ? 
              <Row style={{height: 28}}>
                <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                  <Text style={styles.title}>Total Pembayaran</Text>
                </Col>
                <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                  <Text style={styles.titleBoldBlack}>Rp{formatPrice(getTotalTransfer(this.state.request_data, this.state.promo_data, 'include'))}</Text>
                </Col>
              </Row>
              : false
            }
          </View>
        </ScrollView>

        <View style={styles.container_bottom}>
          {
            (this.state.response_data != null && typeof this.state.response_data.status !== 'undefined' && this.state.response_data.status.toLowerCase() == 'success') ? 
            <View style={{marginBottom: 10}}>
              <ButtonFill btnLabel='Cetak Struk' onPress={() => this.print()} />
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
