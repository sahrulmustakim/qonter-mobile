import React, { Component } from 'react'
import { StyleSheet, AsyncStorage, StatusBar, Text, View, ScrollView, RefreshControl, TouchableOpacity, Dimensions, Image, BackHandler, PermissionsAndroid, Alert } from 'react-native'
import { Grid, Col, Form, Item, Input, Label, Icon, Row, Badge, Button } from 'native-base'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import Toast from 'react-native-easy-toast'
import { Colors, Typography, Mixins } from '../../styles'
import HeaderBack from '../../components/headers/back'

import { getProfile, formatPrice, getTotalTransfer } from '../../utils/Global'
import Moment from 'moment'
import RNFetchBlob from 'rn-fetch-blob'
// import {BluetoothManager,BluetoothEscposPrinter,BluetoothTscPrinter} from 'react-native-bluetooth-escpos-printer';
import Select2 from 'react-native-select-two'
import DialogInput from 'react-native-dialog-input';
import { server_api } from '_configs/env'
import {padding} from "../../styles/mixins";

export default class HistoryDetailPrint extends Component {
  _isMounted = false

  constructor(props) {
    super(props)
  
    this.state = {
      userdata: null,
      devices: [],
      selectedDevice: null,
      sellprice: 0,
      isDialogVisible: false
    }
  }

  async componentDidMount(){
    this._isMounted = true

    // GET USER
    await getProfile().then((item) => {
      this.setState({ userdata: item })
    }).then(() => {
      this.getPairedDevices()
    })

    console.log(this.props)
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
  async setPrice(price){

    await Promise.resolve(price).then(() => {
      this.props.detail.grand_total = price
    }).then(()=>{
      this.setState({isDialogVisible:false})
    })
  }

  async DialogPrice(params){
    await this.setState({isDialogVisible:params})
  }

  async getPairedDevices(){
    // BluetoothManager.enableBluetooth().then(async (r)=>{
    //   if(!r[0]) return;
    //   const getConnectedDevice = await AsyncStorage.getItem("printer")
    //   let paired = r.map(item => {
    //     const devices = JSON.parse(item)
    //     return {
    //       id: devices.address,
    //       name: devices.name,
    //       checked: getConnectedDevice == devices.address ? true : false,
    //     }
    //   })
    //   this.setState({ devices : paired})
    // }).catch(err =>{
    //   this.refs.toast_error.show(error.message, 1500)
    // });
  }

  async selectDevice(item) {
    await AsyncStorage.setItem("printer", item[0])
    await this.setState({selectedDevice: item})
  }

  async dataPrint(){
    let product, name

    if(((this.props || {}).detail || {}).detail_product && (((this.props || {}).detail || {}).detail_product || {}).name){
      product = (((this.props || {}).detail || {}).detail_product || {}).name
    }else{
      product = ((this.props || {}).detail || {}).name
    }

    if(((this.props || {}).detail || {}).response && ((this.props || {}).detail || {}).response && (((this.props || {}).detail || {}).response || {}).recipient_name && (((this.props || {}).detail || {}).response || {}).recipient_name) {
      name = (((this.props || {}).detail || {}).response || {}).recipient_name
    }
    console.log(product, name)

    return {
      name : ((this.state || {}).userdata || {}).name,
      address : ((this.state || {}).userdata || {}).address,
      dateTime : Moment(this.props.detail.created_at).format('DD MMMM YYYY HH:mm'),
      transactionType : (this.props.detail.referer_table == 'transfer_histories') ? 'Kirim Uang' : this.props.detail.transaction_types.name,
      product : (this.props.detail.referer_table == 'transfer_histories') ? 'Transfer Bank' : this.props.detail.detail_product.name,
      item : (this.props.detail.referer_table == 'transfer_histories') ? '-' : this.props.detail.detail.name,
      nohp : (typeof this.props.detail.response !== 'undefined' && this.props.detail.response != null && typeof this.props.detail.response.hp !== 'undefined' && this.props.detail.response.hp != null) ? this.props.detail.response.hp : '',
      hp : (this.props.detail.referer_table == 'transfer_histories') ? this.props.detail.response.recipient_account : this.props.detail.response.customer_no,
      sn : (typeof this.props.detail.response !== 'undefined' && this.props.detail.response != null && typeof this.props.detail.response.sn !== 'undefined' && this.props.detail.response.sn != null && this.props.detail.response.sn != '') ? this.props.detail.response.sn : '',
      recipient: name,
    }
  }
  async print() {
    const getDevice = await AsyncStorage.getItem("printer")
    // const data = await this.dataPrint()

    // BluetoothManager.connect(getDevice).then(async (s)=>{
    //   await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
    //   await BluetoothEscposPrinter.setBlob(0);

    //   await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
    //   await BluetoothEscposPrinter.printText(`MITRA ABATA\n\r`,{});
    //   await BluetoothEscposPrinter.printText(`${data.name}\n\r`,{});
    //   await BluetoothEscposPrinter.printText(`${data.address}\n\r\n\r`,{});
    //   await BluetoothEscposPrinter.printText(`${data.dateTime}\n\r`,{});
    //   await BluetoothEscposPrinter.printText(`STRUK PEMBELIAN\n\r`,{});
    //   await BluetoothEscposPrinter.printText("--------------------------------\n\r",{});
    //   let columnWidths = [16,16];
      
    //   {
    //     (typeof this.props.detail.ref_id_TP !== 'undefined' && this.props.detail.ref_id_TP != null) ?
    //     await BluetoothEscposPrinter.printColumn(columnWidths,
    //       [BluetoothEscposPrinter.ALIGN.LEFT,BluetoothEscposPrinter.ALIGN.RIGHT],
    //       ["Nomor Transaksi", this.props.detail.ref_id_TP],{})
    //     : false
    //   }
    //   {
    //     (typeof this.props.detail.detail_product !== 'undefined' && this.props.detail.detail_product.name != null) ?
    //     await BluetoothEscposPrinter.printColumn(columnWidths,
    //       [BluetoothEscposPrinter.ALIGN.LEFT,BluetoothEscposPrinter.ALIGN.RIGHT],
    //       ["Jenis", this.props.detail.detail_product.name],{})
    //     : false
    //   }
    //   {
    //     (typeof this.props.detail.transaction_types !== 'undefined' && typeof this.props.detail.transaction_types.type !== 'undefined' && this.props.detail.transaction_types.type == 'postpaid' && typeof this.props.detail.detail !== 'undefined' && this.props.detail.detail.name != null) ?
    //     await BluetoothEscposPrinter.printColumn(columnWidths,
    //       [BluetoothEscposPrinter.ALIGN.LEFT,BluetoothEscposPrinter.ALIGN.RIGHT],
    //       ["Produk", this.props.detail.detail.name],{})
    //     : false
    //   }
    //   {
    //     (typeof this.props.detail.response !== 'undefined' && this.props.detail.response != null && typeof this.props.detail.response.hp !== 'undefined' && this.props.detail.response.hp != null) ?
    //     await BluetoothEscposPrinter.printColumn(columnWidths,
    //       [BluetoothEscposPrinter.ALIGN.LEFT,BluetoothEscposPrinter.ALIGN.RIGHT],
    //       ["Nomor Handphone", (typeof this.props.detail.response.hp !== 'undefined') ? this.props.detail.response.hp : ''],{})
    //     : false
    //   }
    //   {
    //     (typeof this.props.detail.transaction_types !== 'undefined' && typeof this.props.detail.transaction_types.type !== 'undefined' && this.props.detail.transaction_types.type == 'prepaid' && typeof this.props.detail.detail !== 'undefined' && this.props.detail.detail.name != null) ?
    //     await BluetoothEscposPrinter.printColumn(columnWidths,
    //       [BluetoothEscposPrinter.ALIGN.LEFT,BluetoothEscposPrinter.ALIGN.RIGHT],
    //       ["Produk Item", this.props.detail.detail.name],{})
    //     : false
    //   }

    //   {/* DETAIL -> RESPONSE */}
    //   {
    //     (typeof this.props.detail.response !== 'undefined' && this.props.detail.response != null && typeof this.props.detail.response.recipient_account !== 'undefined' && this.props.detail.response.recipient_account != null) ?
    //     await BluetoothEscposPrinter.printColumn(columnWidths,
    //       [BluetoothEscposPrinter.ALIGN.LEFT,BluetoothEscposPrinter.ALIGN.RIGHT],
    //       ["Nomor Rekening", (this.props.detail.response.recipient_account !== 'undefined') ? this.props.detail.response.recipient_account : ''],{})
    //     : false
    //   }
    //   {
    //     (typeof this.props.detail.response !== 'undefined' && this.props.detail.response != null && typeof this.props.detail.response.recipient_name !== 'undefined' && this.props.detail.response.recipient_name != null) ?
    //     await BluetoothEscposPrinter.printColumn(columnWidths,
    //       [BluetoothEscposPrinter.ALIGN.LEFT,BluetoothEscposPrinter.ALIGN.RIGHT],
    //       ["Atas Nama", (this.props.detail.response.recipient_name !== 'undefined') ? this.props.detail.response.recipient_name : ''],{})
    //     : false
    //   }
    //   {
    //     (typeof this.props.detail.response !== 'undefined' && this.props.detail.response != null && typeof this.props.detail.response.amount !== 'undefined' && this.props.detail.response.amount != null) ?
    //     await BluetoothEscposPrinter.printColumn(columnWidths,
    //       [BluetoothEscposPrinter.ALIGN.LEFT,BluetoothEscposPrinter.ALIGN.RIGHT],
    //       ["Jumlah", (this.props.detail.response.amount !== 'undefined') ? 'Rp'+formatPrice(this.props.detail.response.amount) : '0'],{})
    //     : false
    //   }
    //   {
    //     (typeof this.props.detail.response !== 'undefined' && this.props.detail.response != null && typeof this.props.detail.response.amount !== 'undefined' && this.props.detail.response.amount != null) ?
    //     await BluetoothEscposPrinter.printColumn(columnWidths,
    //       [BluetoothEscposPrinter.ALIGN.LEFT,BluetoothEscposPrinter.ALIGN.RIGHT],
    //       ["Biaya Admin", (this.props.detail.response.amount !== 'undefined') ? 'Rp'+formatPrice(this.props.detail.grand_total - this.props.detail.response.amount) : '0'],{})
    //     : false
    //   }
    //   {
    //     (typeof this.props.detail.response !== 'undefined' && this.props.detail.response != null && typeof this.props.detail.response.customer_no !== 'undefined' && this.props.detail.response.customer_no != null) ?
    //     await BluetoothEscposPrinter.printColumn(columnWidths,
    //       [BluetoothEscposPrinter.ALIGN.LEFT,BluetoothEscposPrinter.ALIGN.RIGHT],
    //       ["Nomor Pelanggan", this.props.detail.response.customer_no],{})
    //     : false
    //   }
    //   {
    //     (typeof this.props.detail.response !== 'undefined' && this.props.detail.response != null && typeof this.props.detail.response.customer_name !== 'undefined' && this.props.detail.response.customer_name != null) ?
    //     await BluetoothEscposPrinter.printColumn(columnWidths,
    //       [BluetoothEscposPrinter.ALIGN.LEFT,BluetoothEscposPrinter.ALIGN.RIGHT],
    //       ["Nama Pelanggan", this.props.detail.response.customer_name],{})
    //     : false
    //   }
    //   {
    //     (typeof this.props.detail.response !== 'undefined' && this.props.detail.response != null && typeof this.props.detail.response.desc !== 'undefined' && typeof this.props.detail.response.desc.alamat !== 'undefined' && this.props.detail.response.desc.alamat != null) ?
    //     await BluetoothEscposPrinter.printColumn(columnWidths,
    //       [BluetoothEscposPrinter.ALIGN.LEFT,BluetoothEscposPrinter.ALIGN.RIGHT],
    //       ["Alamat", this.props.detail.response.desc.alamat],{})
    //     : false
    //   }
    //   {
    //     (typeof this.props.detail.response !== 'undefined' && this.props.detail.response != null && typeof this.props.detail.response.desc !== 'undefined' && typeof this.props.detail.response.desc.item_name !== 'undefined' && this.props.detail.response.desc.item_name != null) ?
    //     await BluetoothEscposPrinter.printColumn(columnWidths,
    //       [BluetoothEscposPrinter.ALIGN.LEFT,BluetoothEscposPrinter.ALIGN.RIGHT],
    //       ["Item", this.props.detail.response.desc.item_name],{})
    //     : false
    //   }
    //   {
    //     (typeof this.props.detail.response !== 'undefined' && this.props.detail.response != null && typeof this.props.detail.response.desc !== 'undefined' && typeof this.props.detail.response.desc.no_rangka !== 'undefined' && this.props.detail.response.desc.no_rangka != null) ?
    //     await BluetoothEscposPrinter.printColumn(columnWidths,
    //       [BluetoothEscposPrinter.ALIGN.LEFT,BluetoothEscposPrinter.ALIGN.RIGHT],
    //       ["No Rangka", this.props.detail.response.desc.no_rangka],{})
    //     : false
    //   }
    //   {
    //     (typeof this.props.detail.response !== 'undefined' && this.props.detail.response != null && typeof this.props.detail.response.desc !== 'undefined' && typeof this.props.detail.response.desc.no_pol !== 'undefined' && this.props.detail.response.desc.no_pol != null) ?
    //     await BluetoothEscposPrinter.printColumn(columnWidths,
    //       [BluetoothEscposPrinter.ALIGN.LEFT,BluetoothEscposPrinter.ALIGN.RIGHT],
    //       ["No Polisi", this.props.detail.response.desc.no_pol],{})
    //     : false
    //   }
    //   {
    //     (typeof this.props.detail.response !== 'undefined' && this.props.detail.response != null && typeof this.props.detail.response.desc !== 'undefined' && typeof this.props.detail.response.desc.tenor !== 'undefined' && this.props.detail.response.desc.tenor != null) ?
    //     await BluetoothEscposPrinter.printColumn(columnWidths,
    //       [BluetoothEscposPrinter.ALIGN.LEFT,BluetoothEscposPrinter.ALIGN.RIGHT],
    //       ["Tenor", parseInt(this.props.detail.response.desc.tenor)],{})
    //     : false
    //   }
    //   {
    //     (typeof this.props.detail.response !== 'undefined' && this.props.detail.response != null && typeof this.props.detail.response.desc !== 'undefined' && typeof this.props.detail.response.desc.daya !== 'undefined' && this.props.detail.response.desc.daya != null) ?
    //     await BluetoothEscposPrinter.printColumn(columnWidths,
    //       [BluetoothEscposPrinter.ALIGN.LEFT,BluetoothEscposPrinter.ALIGN.RIGHT],
    //       ["Daya", this.props.detail.response.desc.daya],{})
    //     : false
    //   }
    //   {
    //     (typeof this.props.detail.response !== 'undefined' && this.props.detail.response != null && typeof this.props.detail.response.desc !== 'undefined' && typeof this.props.detail.response.desc.jumlah_peserta !== 'undefined' && this.props.detail.response.desc.jumlah_peserta != null) ?
    //     await BluetoothEscposPrinter.printColumn(columnWidths,
    //       [BluetoothEscposPrinter.ALIGN.LEFT,BluetoothEscposPrinter.ALIGN.RIGHT],
    //       ["Jumlah Peserta", parseInt(this.props.detail.response.desc.jumlah_peserta)+' Orang'],{})
    //     : false
    //   }
    //   {
    //     (typeof this.props.detail.response !== 'undefined' && this.props.detail.response != null && typeof this.props.detail.response.desc !== 'undefined' && typeof this.props.detail.response.desc.detail !== 'undefined' && typeof this.props.detail.response.desc.detail[0].periode !== 'undefined' && this.props.detail.response.desc.detail[0].periode != null) ?
    //     await BluetoothEscposPrinter.printColumn(columnWidths,
    //       [BluetoothEscposPrinter.ALIGN.LEFT,BluetoothEscposPrinter.ALIGN.RIGHT],
    //       ["Periode", parseInt(this.props.detail.response.desc.detail[0].periode)],{})
    //     : false
    //   }
    //   {
    //     (typeof this.props.detail.response !== 'undefined' && this.props.detail.response != null && typeof this.props.detail.response.desc !== 'undefined' && typeof this.props.detail.response.desc.jatuh_tempo !== 'undefined' && this.props.detail.response.desc.jatuh_tempo != null) ?
    //     await BluetoothEscposPrinter.printColumn(columnWidths,
    //       [BluetoothEscposPrinter.ALIGN.LEFT,BluetoothEscposPrinter.ALIGN.RIGHT],
    //       ["Jatuh Tempo", this.props.detail.response.desc.jatuh_tempo],{})
    //     : false
    //   }
    //   {
    //     (typeof this.props.detail.response !== 'undefined' && this.props.detail.response != null && typeof this.props.detail.response.desc !== 'undefined' && typeof this.props.detail.response.desc.detail !== 'undefined' && typeof this.props.detail.response.desc.detail[0].meter_awal !== 'undefined' && this.props.detail.response.desc.detail[0].meter_awal != null) ?
    //     await BluetoothEscposPrinter.printColumn(columnWidths,
    //       [BluetoothEscposPrinter.ALIGN.LEFT,BluetoothEscposPrinter.ALIGN.RIGHT],
    //       ["Meter Awal", this.props.detail.response.desc.detail[0].meter_awal],{})
    //     : false
    //   }
    //   {
    //     (typeof this.props.detail.response !== 'undefined' && this.props.detail.response != null && typeof this.props.detail.response.desc !== 'undefined' && typeof this.props.detail.response.desc.detail !== 'undefined' && typeof this.props.detail.response.desc.detail[0].meter_akhir !== 'undefined' && this.props.detail.response.desc.detail[0].meter_akhir != null) ?
    //     await BluetoothEscposPrinter.printColumn(columnWidths,
    //       [BluetoothEscposPrinter.ALIGN.LEFT,BluetoothEscposPrinter.ALIGN.RIGHT],
    //       ["Meter Akhir", this.props.detail.response.desc.detail[0].meter_akhir],{})
    //     : false
    //   }
    //   {
    //     (typeof this.props.detail.response !== 'undefined' && this.props.detail.response != null && typeof this.props.detail.response.sn !== 'undefined' && this.props.detail.response.sn != null && this.props.detail.response.sn != '') ?
    //     await BluetoothEscposPrinter.printColumn(columnWidths,
    //       [BluetoothEscposPrinter.ALIGN.LEFT,BluetoothEscposPrinter.ALIGN.RIGHT],
    //       ["Nomor Pembelian", this.props.detail.response.sn],{})
    //     : false
    //   }
      
    //   await  BluetoothEscposPrinter.printText("\n\r",{});
    //   await  BluetoothEscposPrinter.printText("--------------------------------\n\r",{});
    //   await BluetoothEscposPrinter.printColumn([16,16],
    //       [BluetoothEscposPrinter.ALIGN.LEFT,BluetoothEscposPrinter.ALIGN.RIGHT],
    //       ["Total",`Rp${formatPrice(parseInt(((this.props || {}).detail || {}).grand_total || 0))}`],{});
    //   await  BluetoothEscposPrinter.printText("\n\r",{});
    //   await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
    //   await  BluetoothEscposPrinter.printText("Harap simpan struk ini sebagai tanda bukti pembayaran yang sah\n\r",{});
    //   await  BluetoothEscposPrinter.printText("\n\r\n\r\n\r\n\r",{});
    // },(e)=>{
    //   //this.refs.toast_error.show(e, 1500)
    //   alert(e);
    // })
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

        <HeaderBack title="Cetak Transaksi" />
        
        <ScrollView style={styles.container} scrollEnabled={true}>
          {
            (typeof this.props.detail !== 'undefined' && this.props.detail != null) ?
              <View style={styles.container_form}>
                <Row style={{padding:10, marginBottom: 20 }}>
                  <Col>
                    <Text style={{fontSize: 20, textAlign:"center", fontFamily: Typography.FONT_FAMILY_REGULAR, fontWeight: Typography.FONT_WEIGHT_REGULAR}}>{((this.state || {}).userdata || {}).name}</Text>
                    <Text style={{fontSize: 16, textAlign:"center", fontFamily: Typography.FONT_FAMILY_REGULAR, fontWeight: Typography.FONT_WEIGHT_REGULAR}}>{((this.state || {}).userdata || {}).address}</Text>
                  </Col>
                </Row>
                <Row style={{ height:28 }}>
                  <Col size={4} style={{alignItems: "flex-start", justifyContent: "center"}}>
                    <Text style={[styles.titleBoldGreen, {marginBottom: 10}]}>{(this.props.detail.referer_table == 'transfer_histories') ? 'Kirim Uang' : this.props.detail.transaction_types.name}</Text>
                  </Col>
                  <Col size={8} style={{alignItems: "flex-end", justifyContent: "center" }}>
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
                      <Text style={styles.title}>Jenis</Text>
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
                      <Text style={styles.title}>Biaya Admin</Text>
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
                  <Row style={{height: this.props.detail.response.sn.length > 25 ? this.props.detail.response.sn.length > 45 ? this.props.detail.response.sn.length > 70 ? 125 : 42 : 42 : 28}}>
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
                      <Text style={styles.titleBoldGreen}>Rp{formatPrice(parseInt(((this.props || {}).detail || {}).grand_total || 0))}</Text>
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
          <Form style={{marginBottom: 12}}>
            {
              (this.state.devices.length > 1) ?
                  <Item stackedLabel style={styles.formItem}>
                    <Label style={styles.labelForm}>Pilih Printer</Label>
                    <Select2
                        isSelectSingle={true}
                        style={{borderWidth: 0, paddingLeft: 0, marginTop: 5}}
                        colorTheme={Colors.PRIMARY}
                        popupTitle="Pilih Printer"
                        title="Pilih Printer"
                        searchPlaceHolderText="Pilih Printer"
                        listEmptyTitle="Data kosong"
                        cancelButtonText="Tutup"
                        selectButtonText="Pilih"
                        data={this.state.devices}
                        onSelect={data => {
                          this.selectDevice(data)
                        }}
                        onRemoveItem={data => {
                          this.setState({selectedDevice: null})
                        }}
                    />
                  </Item>
                  : false
            }
          </Form>
          {
            (typeof this.props.detail !== 'undefined' && typeof this.props.detail.status !== 'undefined' && this.props.detail.status != null && this.props.detail.status == 'success') ? 
            <View style={{marginBottom: 10}}>
              <Grid style={{margin:10}}>
              <Col size={6} style={{alignItems: "flex-start", justifyContent: "center",marginLeft: 5, marginRight: 5}}>
                <Button btnLabel='Cetak Struk' onPress={() => this.DialogPrice(true)} bordered success style={styles.buttomButton}>
                  <Text style={styles.titleButton}>Set Harga Jual</Text>
                </Button>
              </Col>
              <Col size={6} style={{alignItems: "flex-start", justifyContent: "center", marginLeft: 5, marginRight: 5}}>
                <Button btnLabel='Cetak Struk' onPress={() => this.print()} bordered success style={styles.buttomButton}>
                  <Text style={styles.titleButton}>Cetak</Text>
                </Button>
              </Col>
              </Grid>
            </View>
            : false
          }
        </View>

        <StatusBar backgroundColor={Colors.PRIMARY} barStyle={"light-content"} />
        <Toast ref="toast_error" style={{backgroundColor:Colors.ALERT, width: '90%'}} position='top' positionValue={35} />
        <Toast ref="toast_success" style={{backgroundColor:Colors.SUCCESS, width: '90%'}} position='top' positionValue={35} />
        <KeyboardSpacer/>
        <DialogInput isDialogVisible={this.state.isDialogVisible}
                     title={"Masukan harga jual"}
                     message={`Harga Total : Rp${formatPrice((this.props.detail || {}).grand_total)}`}
                     hintInput={"Harga jual"}
                     textInputProps={{keyboardType: 'numeric'}}
                     submitInput={ (inputText) => {this.setPrice(inputText)} }
                     closeDialog={ () => { this.DialogPrice(false) }}>
        </DialogInput>
      </View>	
    )
	}
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  page:{
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,

    elevation: 4,
  },
  container_form : {
    margin:15,
    paddingTop: 15,
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 35,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    borderRadius:5,
    elevation: 4,
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
  formItem: {
    marginLeft: 15,
    marginRight: 15,
    marginBottom: 8,
    paddingBottom: 0
  },
  labelForm: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: '#484848',
    fontSize: 12
  },
  titleButton: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: Colors.PRIMARY,
    fontSize: 16,
  },
  buttomButton: {
    borderRadius: 8,
    width: '100%',
    height: 42,
    justifyContent: "center"
  },
});

