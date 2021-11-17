import React, { Component } from 'react'
import { StyleSheet, AsyncStorage, StatusBar, Text, View, ScrollView, RefreshControl, TouchableOpacity, Dimensions, Image, BackHandler, PermissionsAndroid, Alert } from 'react-native'
import { Grid, Col, Form, Item, Input, Label, Icon, Row, Badge } from 'native-base'
import { Actions } from 'react-native-router-flux'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import Toast from 'react-native-easy-toast'
import { Colors, Typography, Mixins } from '_styles'
import HeaderBack from '_headers/back'
import Button from '_components/buttons'
import ButtonFill from '_components/buttons/fill'
import { POST, GET } from '_services/ApiServices'
import { getProfile, formatPrice, getTotalTransfer } from '_utils/Global'
import Moment from 'moment'
import RNFetchBlob from 'rn-fetch-blob'
import { server_api } from '_configs/env'

export default class HistoryDetail extends Component {
  _isMounted = false

  constructor(props) {
    super(props)
  
    this.state = {
      userdata: null
    }
  }

  async componentDidMount() {
    this._isMounted = true

    // GET USER
    await getProfile().then((item) => {
      this.setState({ userdata: item })
    })
    console.log(this.props.detail)
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  actualDownload = () => {
    const { dirs } = RNFetchBlob.fs;
    RNFetchBlob.config({
      fileCache: true,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        mediaScannable: true,
        title: 'ABATA-'+this.props.detail.ref_id_TP+'.pdf',
        path: dirs.DownloadDir+'/ABATA-'+this.props.detail.ref_id_TP+'.pdf',
      },
    })
    .fetch('GET', server_api.baseURL+'user/struk/'+this.props.detail.id, {})
    .then((res) => {
      this.refs.toast_success.show('Struk berhasil disimpan di '+res.path(), 4000)
    })
    .catch((e) => {
      console.log(e)
    });
  }

  async print() {
    if(!this.props.detail) return;
    Actions.history_print({detail : this.props.detail})
    /*try {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        this.actualDownload();
      } else {
        Alert.alert('Permission Denied!', 'You need to give storage permission to download the file');
      }
    } catch (err) {
      console.warn(err);
    }*/
  }

	render() {
		return(
      <View style={styles.container}>

        <HeaderBack title="Transaksi Detail" />
        
        <ScrollView style={styles.container} scrollEnabled={true}>
          {
            (typeof this.props.detail !== 'undefined' && this.props.detail != null) ?
              <View style={styles.container_form}>
                <Row style={{height: 28}}>
                  <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                    <Text style={[styles.titleBoldGreen, {marginBottom: 10}]}>{(this.props.detail.referer_table == 'transfer_histories') ? 'Kirim Uang' : this.props.detail.transaction_types.name}</Text>
                  </Col>
                  <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                    <Text style={[styles.titleBoldGreen, {marginBottom: 10}]}>
                      {Moment(this.props.detail.created_at).format('DD MMMM YYYY HH:mm')}
                    </Text>
                  </Col>
                </Row>

                {/* DETAIL */}
                {
                  (typeof this.props.detail.ref_id_TP !== 'undefined' && this.props.detail.ref_id_TP != null) ?
                  <Row style={{height: 28}}>
                    <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                      <Text style={styles.title}>Nomor Transaksi</Text>
                    </Col>
                    <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                      <Text style={styles.titleBoldBlack}>{this.props.detail.ref_id_TP}</Text>
                    </Col>
                  </Row>
                  : false
                }
                {
                  (typeof this.props.detail.detail_product !== 'undefined' && this.props.detail.detail_product.name != null) ?
                  <Row style={{height: 28}}>
                    <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                      <Text style={styles.title}>Produk</Text>
                    </Col>
                    <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                      <Text style={styles.titleBoldBlack}>{this.props.detail.detail_product.name}</Text>
                    </Col>
                  </Row>
                  : false
                }
                {
                  (typeof this.props.detail.transaction_types !== 'undefined' && typeof this.props.detail.transaction_types.type !== 'undefined' && this.props.detail.transaction_types.type == 'postpaid' && typeof this.props.detail.detail !== 'undefined' && this.props.detail.detail.name != null) ?
                  <Row style={{height: 28}}>
                    <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                      <Text style={styles.title}>Produk</Text>
                    </Col>
                    <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                      <Text style={styles.titleBoldBlack}>{this.props.detail.detail.name}</Text>
                    </Col>
                  </Row>
                  : false
                }
                {
                  (typeof this.props.detail.response !== 'undefined' && this.props.detail.response != null && typeof this.props.detail.response.hp !== 'undefined' && this.props.detail.response.hp != null) ?
                  <Row style={{height: 28}}>
                    <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                      <Text style={styles.title}>Nomor Handphone</Text>
                    </Col>
                    <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                      <Text style={styles.titleBoldBlack}>{(typeof this.props.detail.response.hp !== 'undefined') ? this.props.detail.response.hp : ''}</Text>
                    </Col>
                  </Row>
                  : false
                }
                {
                  (typeof this.props.detail.transaction_types !== 'undefined' && typeof this.props.detail.transaction_types.type !== 'undefined' && this.props.detail.transaction_types.type == 'prepaid' && typeof this.props.detail.detail !== 'undefined' && this.props.detail.detail.name != null) ?
                  <Row style={{height: this.props.detail.detail.name.length > 25 ? this.props.detail.detail.name.length > 45 ? 60 : 42 : 28}}>
                    <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                      <Text style={styles.title}>Item</Text>
                    </Col>
                    <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                      <Text style={[styles.titleBoldBlack,{textAlign: "right"}]}>{this.props.detail.detail.name}</Text>
                    </Col>
                  </Row>
                  : false
                }

                {/* DETAIL -> RESPONSE */}
                {
                  (typeof this.props.detail.response !== 'undefined' && this.props.detail.response != null && typeof this.props.detail.response.recipient_account !== 'undefined' && this.props.detail.response.recipient_account != null) ?
                  <Row style={{height: 28}}>
                    <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                      <Text style={styles.title}>Nomor Rekening</Text>
                    </Col>
                    <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                      <Text style={styles.titleBoldBlack}>{(this.props.detail.response.recipient_account !== 'undefined') ? this.props.detail.response.recipient_account : ''}</Text>
                    </Col>
                  </Row>
                  : false
                }
                {
                  (typeof this.props.detail.response !== 'undefined' && this.props.detail.response != null && typeof this.props.detail.response.recipient_name !== 'undefined' && this.props.detail.response.recipient_name != null) ?
                  <Row style={{height: 28}}>
                    <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                      <Text style={styles.title}>Atas Nama</Text>
                    </Col>
                    <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                      <Text style={styles.titleBoldBlack}>{(this.props.detail.response.recipient_name !== 'undefined') ? this.props.detail.response.recipient_name : ''}</Text>
                    </Col>
                  </Row>
                  : false
                }
                {
                  (typeof this.props.detail.response !== 'undefined' && this.props.detail.response != null && typeof this.props.detail.response.amount !== 'undefined' && this.props.detail.response.amount != null) ?
                  <Row style={{height: 28}}>
                    <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                      <Text style={styles.title}>Jumlah</Text>
                    </Col>
                    <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                      <Text style={styles.titleBoldBlack}>{(this.props.detail.response.amount !== 'undefined') ? 'Rp'+formatPrice(this.props.detail.response.amount) : '0'}</Text>
                    </Col>
                  </Row>
                  : false
                }
                {
                  (typeof this.props.detail.response !== 'undefined' && this.props.detail.response != null && typeof this.props.detail.response.amount !== 'undefined' && this.props.detail.response.amount != null) ?
                  <Row style={{height: 28}}>
                    <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                      <Text style={styles.title}>Admin</Text>
                    </Col>
                    <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                      <Text style={styles.titleBoldBlack}>{(this.props.detail.response.amount !== 'undefined') ? 'Rp'+formatPrice(this.props.detail.grand_total - this.props.detail.response.amount) : '0'}</Text>
                    </Col>
                  </Row>
                  : false
                }
                {
                  (typeof this.props.detail.response !== 'undefined' && this.props.detail.response != null && typeof this.props.detail.response.customer_no !== 'undefined' && this.props.detail.response.customer_no != null) ?
                  <Row style={{height: 28}}>
                    <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                      <Text style={styles.title}>Nomor Pelanggan</Text>
                    </Col>
                    <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                      <Text style={styles.titleBoldBlack}>{this.props.detail.response.customer_no}</Text>
                    </Col>
                  </Row>
                  : false
                }
                {
                  (typeof this.props.detail.response !== 'undefined' && this.props.detail.response != null && typeof this.props.detail.response.customer_name !== 'undefined' && this.props.detail.response.customer_name != null) ?
                  <Row style={{height: 28}}>
                    <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                      <Text style={styles.title}>Nama Pelanggan</Text>
                    </Col>
                    <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                      <Text style={styles.titleBoldBlack}>{this.props.detail.response.customer_name}</Text>
                    </Col>
                  </Row>
                  : false
                }
                {
                  (typeof this.props.detail.response !== 'undefined' && this.props.detail.response != null && typeof this.props.detail.response.desc !== 'undefined' && typeof this.props.detail.response.desc.alamat !== 'undefined' && this.props.detail.response.desc.alamat != null) ?
                  <Row style={{height: 28}}>
                    <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                      <Text style={styles.title}>Alamat</Text>
                    </Col>
                    <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                      <Text style={styles.titleBoldBlack}>{this.props.detail.response.desc.alamat}</Text>
                    </Col>
                  </Row>
                  : false
                }
                {
                  (typeof this.props.detail.response !== 'undefined' && this.props.detail.response != null && typeof this.props.detail.response.desc !== 'undefined' && typeof this.props.detail.response.desc.item_name !== 'undefined' && this.props.detail.response.desc.item_name != null) ?
                  <Row style={{height: this.props.detail.response.desc.item_name.length > 25 ? this.props.detail.response.desc.item_name.length > 45 ? 60 : 42 : 28}}>
                    <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                      <Text style={styles.title}>Item</Text>
                    </Col>
                    <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                      <Text style={[styles.titleBoldBlack,{textAlign: "right"}]}>{this.props.detail.response.desc.item_name}</Text>
                    </Col>
                  </Row>
                  : false
                }
                {
                  (typeof this.props.detail.response !== 'undefined' && this.props.detail.response != null && typeof this.props.detail.response.desc !== 'undefined' && typeof this.props.detail.response.desc.no_rangka !== 'undefined' && this.props.detail.response.desc.no_rangka != null) ?
                  <Row style={{height: 28}}>
                    <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                      <Text style={styles.title}>No Rangka</Text>
                    </Col>
                    <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                      <Text style={styles.titleBoldBlack}>
                        {this.props.detail.response.desc.no_rangka}
                      </Text>
                    </Col>
                  </Row>
                  : false
                }
                {
                  (typeof this.props.detail.response !== 'undefined' && this.props.detail.response != null && typeof this.props.detail.response.desc !== 'undefined' && typeof this.props.detail.response.desc.no_pol !== 'undefined' && this.props.detail.response.desc.no_pol != null) ?
                  <Row style={{height: 28}}>
                    <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                      <Text style={styles.title}>No Polisi</Text>
                    </Col>
                    <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                      <Text style={styles.titleBoldBlack}>
                        {this.props.detail.response.desc.no_pol}
                      </Text>
                    </Col>
                  </Row>
                  : false
                }
                {
                  (typeof this.props.detail.response !== 'undefined' && this.props.detail.response != null && typeof this.props.detail.response.desc !== 'undefined' && typeof this.props.detail.response.desc.tenor !== 'undefined' && this.props.detail.response.desc.tenor != null) ?
                  <Row style={{height: 28}}>
                    <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                      <Text style={styles.title}>Tenor</Text>
                    </Col>
                    <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                      <Text style={styles.titleBoldBlack}>
                        {parseInt(this.props.detail.response.desc.tenor)}
                      </Text>
                    </Col>
                  </Row>
                  : false
                }
                {
                  (typeof this.props.detail.response !== 'undefined' && this.props.detail.response != null && typeof this.props.detail.response.desc !== 'undefined' && typeof this.props.detail.response.desc.daya !== 'undefined' && this.props.detail.response.desc.daya != null) ?
                  <Row style={{height: 28}}>
                    <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                      <Text style={styles.title}>Daya</Text>
                    </Col>
                    <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                      <Text style={styles.titleBoldBlack}>
                        {this.props.detail.response.desc.daya}
                      </Text>
                    </Col>
                  </Row>
                  : false
                }
                {
                  (typeof this.props.detail.response !== 'undefined' && this.props.detail.response != null && typeof this.props.detail.response.desc !== 'undefined' && typeof this.props.detail.response.desc.jumlah_peserta !== 'undefined' && this.props.detail.response.desc.jumlah_peserta != null) ?
                  <Row style={{height: 28}}>
                    <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                      <Text style={styles.title}>Jumlah Peserta</Text>
                    </Col>
                    <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                      <Text style={styles.titleBoldBlack}>{parseInt(this.props.detail.response.desc.jumlah_peserta)} Orang</Text>
                    </Col>
                  </Row>
                  : false
                }
                {
                  (typeof this.props.detail.response !== 'undefined' && this.props.detail.response != null && typeof this.props.detail.response.desc !== 'undefined' && typeof this.props.detail.response.desc.detail !== 'undefined' && typeof this.props.detail.response.desc.detail[0].periode !== 'undefined' && this.props.detail.response.desc.detail[0].periode != null) ?
                  <Row style={{height: 28}}>
                    <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                      <Text style={styles.title}>Periode</Text>
                    </Col>
                    <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                      <Text style={styles.titleBoldBlack}>{parseInt(this.props.detail.response.desc.detail[0].periode)}</Text>
                    </Col>
                  </Row>
                  : false
                }
                {
                  (typeof this.props.detail.response !== 'undefined' && this.props.detail.response != null && typeof this.props.detail.response.desc !== 'undefined' && typeof this.props.detail.response.desc.jatuh_tempo !== 'undefined' && this.props.detail.response.desc.jatuh_tempo != null) ?
                  <Row style={{height: 28}}>
                    <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                      <Text style={styles.title}>Jatuh Tempo</Text>
                    </Col>
                    <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                      <Text style={styles.titleBoldBlack}>
                        {this.props.detail.response.desc.jatuh_tempo}
                      </Text>
                    </Col>
                  </Row>
                  : false
                }
                {
                  (typeof this.props.detail.response !== 'undefined' && this.props.detail.response != null && typeof this.props.detail.response.desc !== 'undefined' && typeof this.props.detail.response.desc.detail !== 'undefined' && typeof this.props.detail.response.desc.detail[0].meter_awal !== 'undefined' && this.props.detail.response.desc.detail[0].meter_awal != null) ?
                  <Row style={{height: 28}}>
                    <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                      <Text style={styles.title}>Meter Awal</Text>
                    </Col>
                    <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                      <Text style={styles.titleBoldBlack}>
                        {this.props.detail.response.desc.detail[0].meter_awal}
                      </Text>
                    </Col>
                  </Row>
                  : false
                }
                {
                  (typeof this.props.detail.response !== 'undefined' && this.props.detail.response != null && typeof this.props.detail.response.desc !== 'undefined' && typeof this.props.detail.response.desc.detail !== 'undefined' && typeof this.props.detail.response.desc.detail[0].meter_akhir !== 'undefined' && this.props.detail.response.desc.detail[0].meter_akhir != null) ?
                  <Row style={{height: 28}}>
                    <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                      <Text style={styles.title}>Meter Akhir</Text>
                    </Col>
                    <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                      <Text style={styles.titleBoldBlack}>
                        {this.props.detail.response.desc.detail[0].meter_akhir}
                      </Text>
                    </Col>
                  </Row>
                  : false
                }
                {
                  (typeof this.props.detail.response !== 'undefined' && this.props.detail.response != null && typeof this.props.detail.response.sn !== 'undefined' && this.props.detail.response.sn != null && this.props.detail.response.sn != '') ?
                  <Row style={{height: this.props.detail.response.sn.length > 25 ? this.props.detail.response.sn.length > 45 ? 60 : 42 : 28}}>
                    <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                      <Text style={styles.titleBoldGreen}>Nomor Pembelian</Text>
                    </Col>
                    <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                      <Text style={[styles.titleBoldGreen, {textAlign: 'right'}]}>
                        {this.props.detail.response.sn}
                      </Text>
                    </Col>
                  </Row>
                  : false
                }

                {/* HARGA */}
                {
                  (typeof this.props.detail.promo_code !== 'undefined' && this.props.detail.promo_code != null) ? 
                  <Row style={{height: 28}}>
                    <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                      <Text style={styles.title}>Promo</Text>
                    </Col>
                    <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                      <Text style={styles.titleBoldGreen}>{this.props.detail.promo_code}</Text>
                    </Col>
                  </Row>
                  : false
                }
                {
                  (typeof this.props.detail.grand_total !== 'undefined' && this.props.detail.grand_total != null && parseInt(this.props.detail.grand_total) > 0) ? 
                  <Row style={{height: 28}}>
                    <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                      <Text style={styles.title}>Total</Text>
                    </Col>
                    <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                      <Text style={styles.titleBoldGreen}>Rp{formatPrice(this.props.detail.grand_total)}</Text>
                    </Col>
                  </Row>
                  : false
                }

                {/* STATUS */}
                {
                  (typeof this.props.detail.status !== 'undefined' && this.props.detail.status != null) ? 
                  <Row style={{height: 28}}>
                    <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                      <Text style={styles.title}>Status</Text>
                    </Col>
                    <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                      <Text style={(this.props.detail.status.toLowerCase() == 'success') ? styles.titleBoldGreen : (this.props.detail.status.toLowerCase() == 'pending') ? styles.titleBoldOrange : styles.titleBoldRed }>{this.props.detail.status.toUpperCase()}</Text>
                    </Col>
                  </Row>
                  : false
                }
                {
                  (typeof this.props.detail.response !== 'undefined' && this.props.detail.response != null && this.props.detail.status.toUpperCase() == 'FAILED') ? 
                  <Row style={{height: this.props.detail.response.message.length > 25 ? this.props.detail.response.message.length > 45 ? 60 : 42 : 28}}>
                    <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
                      <Text style={styles.title}>Message</Text>
                    </Col>
                    <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
                      <Text style={[styles.titleBoldRed, { textAlign:"right" }]}>{(typeof this.props.detail.response.message !== 'undefined') ? this.props.detail.response.message : (typeof this.props.detail.response.message) ? this.props.detail.response.message : ''}</Text>
                    </Col>
                  </Row>
                  : false
                }
              </View>
            : false
          }
        </ScrollView>

        <View style={styles.container_bottom}>
          {
            (typeof this.props.detail !== 'undefined' && typeof this.props.detail.status !== 'undefined' && this.props.detail.status != null && this.props.detail.status == 'success') ? 
            <View style={{marginBottom: 10}}>
              <ButtonFill btnLabel='Cetak Struk' onPress={() => this.print()} />
            </View>
            : false
          }
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
  titleBoldOrange: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: '#FEC007',
    fontSize: 16,
  },
  titleBoldGreen: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: Colors.PRIMARY,
    fontSize: Mixins.scaleFont(16),
  },
  titleBoldRed: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: '#F63F3F',
    fontSize: 16,
  },
});
