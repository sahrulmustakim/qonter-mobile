import React, { Component } from 'react'
import { StyleSheet, AsyncStorage, StatusBar, Text, View, ScrollView, TouchableOpacity, Dimensions, Image } from 'react-native'
import { Grid, Col, Form, Item, Input, Label, Icon, Row } from 'native-base'
import { Actions } from 'react-native-router-flux'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import Toast from 'react-native-easy-toast'
import { Colors, Typography } from '_styles'
import HeaderBack from '_headers/back'
import Button from '_components/buttons/index'
import ButtonFill from '_components/buttons/fill'
import Moment from 'moment'
import { POST, GET } from '_services/ApiServices'
import { getProfile, formatPrice } from '_utils/Global'
import Clipboard from "@react-native-community/clipboard"

export default class Payment extends Component {
  _isMounted = false

  constructor(props) {
    super(props)
  
    this.state = {
      
    }
  }

  componentDidMount() {
    this._isMounted = true
  }

  async done() {
    Actions.reset('menus')
  }

  copyText(text) {
    Clipboard.setString(text)
    this.refs.toast_success.show('Berhasil di salin', 1000)
  }

	render() {
		return(
      <View style={styles.container}>

        <HeaderBack title="Pembayaran" />
        
        <View style={styles.container_top}>
          <Text style={styles.titleSmallBlack}>Batas Waktu Pembayaran</Text>
          <Text style={styles.titleBigBlack}>{Moment().add(1, 'hour').format('dddd, D MMMM YYYY hh:mm')}</Text>
        </View>
        {
          (typeof this.props.payment !== 'undefined' && this.props.payment != null) ?
          <View style={styles.container_form}>
            <Row style={{paddingBottom: 15, borderBottomColor: '#f4f4f4', borderBottomWidth: 1, height: 30}}>
              <Col size={10} style={{alignItems: "flex-start", justifyContent: "center"}}>
                <Text style={styles.title}>{this.props.payment.title}</Text>
              </Col>
              <Col size={2} style={{alignItems: "flex-end", justifyContent: "center"}}>
                <Image style={{ width: 60, height: '100%', resizeMode: "contain" }} source={{uri: this.props.payment.icon}} />
              </Col>
            </Row>
            <Row style={{marginTop: 15, minHeight: 28}}>
              <Col size={10} style={{alignItems: "flex-start", justifyContent: "center"}}>
                <Text style={styles.titleSmallGray}>Nomor Virtual Account</Text>
                <Text style={styles.titleBoldBlack}>{(typeof this.props.response !== 'undefined') ? this.props.response.va_number : ''}</Text>
              </Col>
              <Col size={2} style={{alignItems: "flex-end", justifyContent: "flex-end", paddingBottom: 5}}>
                <TouchableOpacity onPress={() => (typeof this.props.response !== 'undefined') ? this.copyText(this.props.response.va_number.toString()) : ''}>
                  <Text style={styles.linkTitleGreen}>Salin</Text>
                </TouchableOpacity>
              </Col>
            </Row>
            <Row style={{marginTop: 15, minHeight: 28}}>
              <Col size={10} style={{alignItems: "flex-start", justifyContent: "center"}}>
                <Text style={styles.titleSmallGray}>Total yang harus dibayarkan</Text>
                <Text style={styles.titleBoldGreen}>Rp{formatPrice(this.props.nominal)}</Text>
              </Col>
              <Col size={2} style={{alignItems: "flex-end", justifyContent: "flex-end", paddingBottom: 5}}>
                <TouchableOpacity onPress={() => this.copyText(this.props.nominal.toString())}>
                  <Text style={styles.linkTitleGreen}>Salin</Text>
                </TouchableOpacity>
              </Col>
            </Row>
            {/* <Row style={{marginTop: 15, height: 40}}>
              <Col style={{alignItems: "flex-start", justifyContent: "center"}}>
                <Text style={styles.titleSmallGray}>Status Pembayaran</Text>
                <Text style={styles.titleBoldGreen}>Sudah Dibayar</Text>
              </Col>
            </Row> */}
            <Row style={{marginTop: 15, height: 120}}>
              <Col style={{alignItems: "center", justifyContent: "flex-start"}}>
                <View style={{width: '100%', backgroundColor: '#EDCEB2', borderRadius: 5}} >
                <Text style={[styles.linkTitle,{alignItems: "center", padding: 10, textAlign: 'center'}]}>Silahkan transfer ke nomor virtual account yang sudah tertera diatas sebelum batas waktu pembayaran yang sudah ditentukan, ketika berhasil saldo Anda akan bertambah secara otomatis.</Text>
                </View>
              </Col>
            </Row>
          </View>
          : false
        }
        {/* <View style={styles.container_button}>
          <ButtonFill btnLabel='Cetak Struk' />
        </View> */}
        <View style={styles.container_button}>
          <Button btnLabel='Selesai' onPress={() => this.done()} />
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
  container_top : {
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 25,
    paddingRight: 25,
    backgroundColor: '#F1F4F9',
    width: '100%'
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
    textAlign: "center",
    // textDecorationLine: "underline"
  },
  linkTitleGreen: {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontWeight: Typography.FONT_WEIGHT_REGULAR,
    color: Colors.PRIMARY,
    fontSize: 14,
    textDecorationLine: "underline"
  },
});
