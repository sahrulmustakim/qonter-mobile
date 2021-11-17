import React, { Component } from 'react'
import { StyleSheet, AsyncStorage, StatusBar, Text, View, ScrollView, TouchableOpacity, Dimensions, Image } from 'react-native'
import { Grid, Col, Form, Item, Input, Label, Icon, Row, Spinner } from 'native-base'
import { Actions } from 'react-native-router-flux'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import Toast from 'react-native-easy-toast'
import { Colors, Typography } from '_styles'
import HeaderBack from '_headers/back'
import Button from '_components/buttons/index'
import ButtonFill from '_components/buttons/fill'
import Moment from "moment"
import Clipboard from "@react-native-community/clipboard"
import { server_api } from '_configs/env'
import { POST, GET } from '_services/ApiServices'
import ImagePicker from 'react-native-image-picker'
import RNFetchBlob from 'rn-fetch-blob'

export default class Payment extends Component {
  _isMounted = false

  constructor(props) {
    super(props)
  
    this.state = {
      photo: { uri: null },
      change_photo: false,
      loading: true,
    }
  }

  componentDidMount() {
    this._isMounted = true

    console.log(this.props.response)
    this.setState({ loading: false })
  }

  copyText(text) {
    Clipboard.setString(text)
    this.refs.toast_success.show('Berhasil di salin', 1000)
  }

  async upload() {
    this.setState({ loading: true })
    const header = {
      'Content-Type': 'multipart/form-data',
      'Accept': 'application/json',
    }

    const params = []
    params.push({ name : 'id', data : String(this.props.response.id) })
    if(this.state.change_photo){
      params.push({ 
        name: 'photo',
        filename: 'topup-'+this.props.response.id+'-' + Date.now() + '.jpg',
        type: 'image/jpg',
        data: RNFetchBlob.wrap(this.state.photo.uri),
      })

      console.warn(params)
      let resp = await RNFetchBlob.fetch('POST', server_api.baseURL+'topup/upload', header, params)
      let result = JSON.parse(resp.data)
      console.warn(result)
      if(result.status){
        this.refs.toast_success.show('Bukti pembayaran berhasil dikirim, silahkan menunggu konfirmasi selanjutnya.', 3000)  
        setTimeout(() => {
          Actions.reset('menus')
        }, 3000);
      }else{
        this.refs.toast_error.show(result.message, 1000)
      }
    }else{
      this.refs.toast_error.show('Lampirkan bukti bayar Anda terlebih dahulu.', 1000)
    }

    this.setState({ loading: false })
  }

  changeFoto(){
    const options = {
      title: 'Pilih Foto',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    }

    ImagePicker.showImagePicker(options, (response) => {
      // console.log(response.path)
      // console.log(response.uri)
      if (response.didCancel) {
        console.log('User cancelled image picker')
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error)
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton)
      } else {
        const source = { uri: response.uri }
        this.setState({photo: source})
        this.setState({change_photo: true})
      }
    })
  }

  async done() {
    Actions.reset('menus')
  }

	render() {
		return(
      <View style={styles.container}>

        <HeaderBack title="Pembayaran" />
        
        {
          (this.props.payment.type == 'transfer') ?  
          <View style={styles.container_top}>
            <Text style={styles.titleSmallBlack}>Batas Waktu Pembayaran</Text>
            <Text style={styles.titleBigBlack}>{Moment().add(1, 'hour').format('dddd, D MMMM YYYY hh:mm')}</Text>
          </View>
          : false
        }

        <ScrollView scrollEnabled={true}>
        {
          (typeof this.props.payment !== 'undefined' && this.props.payment != null) ?
          <View style={styles.container_form}>
            <Row style={{paddingBottom: 15, borderBottomColor: '#f4f4f4', borderBottomWidth: 1, height: 30}}>
              <Col size={10} style={{alignItems: "flex-start", justifyContent: "center"}}>
                <Text style={styles.title}>{this.props.payment.title}</Text>
              </Col>
              {
                (this.props.payment.type == 'transfer') ? 
                <Col size={2} style={{alignItems: "flex-end", justifyContent: "center"}}>
                  <Image style={{ width: 60, height: '100%', resizeMode: "contain" }} source={{uri: this.props.payment.icon}} />
                </Col>
                : false
              }
            </Row>
            {
              (this.props.payment.type == 'transfer') ? 
              <Row style={{marginTop: 15, height: 40}}>
                <Col size={10} style={{alignItems: "flex-start", justifyContent: "center"}}>
                  <Text style={styles.titleSmallGray}>Nomor Rekening</Text>
                  <Text style={styles.titleBoldBlack}>{this.props.payment.bank_number}</Text>
                </Col>
                <Col size={2} style={{alignItems: "flex-end", justifyContent: "flex-end", paddingBottom: 5}}>
                  <TouchableOpacity onPress={() => this.copyText(this.props.payment.bank_number.toString())}>
                    <Text style={styles.linkTitleGreen}>Salin</Text>
                  </TouchableOpacity>
                </Col>
              </Row>
              : false
            }
            <Row style={{marginTop: 15, height: 40}}>
              <Col size={10} style={{alignItems: "flex-start", justifyContent: "center"}}>
                <Text style={styles.titleSmallGray}>Total yang harus dibayarkan</Text>
                <Text style={styles.titleBoldGreen}>Rp{(this.props.nominal).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</Text>
              </Col>
            {
              (this.props.payment.type == 'transfer') ? 
              <Col size={2} style={{alignItems: "flex-end", justifyContent: "flex-end", paddingBottom: 5}}>
                <TouchableOpacity onPress={() => this.copyText(this.props.nominal.toString())}>
                  <Text style={styles.linkTitleGreen}>Salin</Text>
                </TouchableOpacity>
              </Col>
              : false
            }
            </Row>
            <Row style={{marginTop: 15, height: 40}}>
              <Col style={{alignItems: "flex-start", justifyContent: "center"}}>
                <Text style={styles.titleSmallGray}>Status Pembayaran</Text>
                <Text style={styles.titleBoldRed}>Menunggu Pembayaran</Text>
              </Col>
            </Row>
            {/* <Row style={{marginTop: 15, height: 25}}>
              <Col style={{alignItems: "center", justifyContent: "flex-end"}}>
                <TouchableOpacity style={{width: '100%', alignItems: "center"}} >
                  <Text style={styles.linkTitle}>Lihat Detail Pembayaran</Text>
                </TouchableOpacity>
              </Col>
            </Row> */}
            {
              (this.props.payment.type == 'transfer') ? 
              <Row style={{marginTop: 15, height: 80}}>
                <Col style={{alignItems: "center", justifyContent: "flex-start"}}>
                  <View style={{width: '100%', backgroundColor: '#EDCEB2', borderRadius: 5}}>
                    <Text style={[styles.linkTitle,{alignItems: "center", padding: 10, textAlign: 'center'}]}>Silahkan transfer ke nomor rekening bank yang sudah tertera diatas sebelum batas waktu pembayaran yang sudah ditentukan, jika Anda sudah melakukan transfer silahkan upload bukti bayar untuk mempercepat proses verifikasi, jika ada kendala silahkan menghubungi CS.</Text>
                  </View>
                </Col>
              </Row>
              :
              <Row style={{marginTop: 15, height: 40}}>
                <Col style={{alignItems: "center", justifyContent: "flex-start"}}>
                  <View style={{width: '100%', backgroundColor: '#EDCEB2', borderRadius: 5}}>
                    <Text style={[styles.linkTitle,{alignItems: "center", padding: 10, textAlign: 'center'}]}>Silahkan melakukan pembayaran ke Sales Anda, jika ada kendala ketika melakukan pembayaran silahkan menghubungi CS.</Text>
                  </View>
                </Col>
              </Row>
            }
          </View>
          : false
        }
        {
          (this.state.loading) ? 
          <View style={styles.container_button}>
            <Spinner color='green' />
          </View>
          : 
          <Form style={{marginBottom: 12, paddingLeft: 15, paddingRight: 15}}>
            {
              (this.props.payment.type == 'transfer') ? 
              <Item stackedLabel style={styles.formItem}>
                <Label style={styles.labelForm}>Upload Bukti Bayar</Label>
                <View style={styles.containerMiddle}>
                  {
                    this.state.photo.uri == null || this.state.photo.uri == '' || typeof this.state.photo.uri === 'undefined' ? 
                    <TouchableOpacity onPress={() => this.changeFoto()}>
                      <Image style={styles.avatar} source={require('_assets/images/setoran.png')}/>
                    </TouchableOpacity>
                    : 
                    <TouchableOpacity onPress={() => this.changeFoto()}>
                      <Image style={styles.avatar} source={this.state.photo}/>
                    </TouchableOpacity>
                  }
                  <Text style={{color: '#8B8B8B', paddingTop: 5}}>Lampirkan bukti bayar dengan klik icon diatas</Text>
                </View>
              </Item>
              : false
            }
            {
              (this.props.payment.type == 'transfer') ? 
              <View style={[styles.container_button, {marginBottom: 10}]}>
                <ButtonFill onPress={() => this.upload()} btnLabel='Upload Bukti Bayar' />
              </View>
              : false
            }
            <View style={styles.container_button}>
              <Button btnLabel='Selesai' onPress={() => this.done()} />
            </View>
          </Form>
        }
        </ScrollView>
        
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
  container_top : {
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 25,
    paddingRight: 25,
    backgroundColor: '#F1F4F9',
    width: '100%'
  },
  containerMiddle: {
    paddingTop: 10,
  	paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 25,
    alignItems: 'center',
    alignContent: 'center'
  },
  container_form : {
    padding: 25
  },
  container_button : {
    paddingTop: 5,
    width: '100%',
    alignItems: "center"
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
    fontSize: 20
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
  linkTitle: {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontWeight: Typography.FONT_WEIGHT_REGULAR,
    color: '#333333',
    fontSize: 14,
    // textDecorationLine: "underline"
  },
  linkTitleGreen: {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontWeight: Typography.FONT_WEIGHT_REGULAR,
    color: Colors.PRIMARY,
    fontSize: 14,
    textDecorationLine: "underline"
  },
  avatar: { 
    height: 100,
    width: 100,
    resizeMode: 'cover'
  },
  boxInput: {
    width: '100%',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D6D6D6',
    marginBottom: 15,
    padding: 0.5,
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
});
