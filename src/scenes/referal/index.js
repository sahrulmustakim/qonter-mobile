import React, { Component } from 'react'
import { StyleSheet, AsyncStorage, StatusBar, Text, View, ScrollView, TouchableOpacity, Dimensions, Image } from 'react-native'
import { Grid, Col, Form, Item, Input, Label, Icon, Row, Button } from 'native-base'
import { Actions } from 'react-native-router-flux'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import Clipboard from "@react-native-community/clipboard"
import Toast from 'react-native-easy-toast'
import { Colors, Typography } from '_styles'
import HeaderBack from '_headers/back'
import MyButton from '_components/buttons'
import Moment from 'moment'
import { POST, GET } from '_services/ApiServices'
import { getProfile, formatPrice } from '_utils/Global'

export default class Referal extends Component {
  _isMounted = false

  constructor(props) {
    super(props)
  
    this.state = {
      pin: null,
      userdata: null,
    }
  }

  async componentDidMount() {
    this._isMounted = true

    // GET USER
    await getProfile().then((item) => {
      console.log(item)
      this.setState({ userdata: item })
    })
  }

  async next() {
    Actions.reset('menus')
  }

  copyText(text) {
    Clipboard.setString(text)
    this.refs.toast_success.show('Berhasil di salin', 1000)
  }

	render() {
		return(
      <View style={styles.container}>

        <HeaderBack title="Kode Referal" />
        
        <View style={styles.container_form}>
          <View style={{marginBottom: 10, alignItems: "center"}}>
            <Image style={{ width: 200, height: 135, resizeMode: "contain" }} source={require('_assets/images/referal-page.png')} />
          </View>
          <Text style={{marginBottom: 10,marginTop: 10, textAlign: "center", fontSize: 16}}>Kode Referal Anda, silahkan bagikan ke teman atau sahabat terdekat Anda.</Text>

          <View style={{borderRadius: 6, borderWidth: 1, borderColor: '#D7D7D7', marginTop: 20}}>
            <Text style={{padding: 10, fontSize: 18, fontWeight: "bold"}}>{(this.state.userdata != null) ? this.state.userdata.referal_code : ''}</Text>
            <Button bordered success style={{position: "absolute", top: -1, right: 0, borderRadius: 6, paddingLeft: 20, paddingRight: 20}} onPress={() => (this.state.userdata != null) ? this.copyText(this.state.userdata.referal_code) : false}>
              <Text style={{color: Colors.PRIMARY, fontSize: 18, fontWeight: "bold"}}>Copy</Text>
            </Button>
          </View>

          <Text style={{marginBottom: 10,marginTop: 10, textAlign: "center", fontSize: 16, marginTop: 35, marginBottom: 20}}>Atau bagikan via</Text>
          <Row>
            <Col size={5} style={{alignItems: "flex-end"}}>
              <Image style={{ width: 56, height: 56, resizeMode: "contain" }} source={require('_assets/images/icon-whatsapp2.png')} />
              <Text style={{fontSize: 14}}>Whatsapp</Text>
            </Col>
            <Col size={4} style={{alignItems: "center"}}>
              <Image style={{ width: 56, height: 56, resizeMode: "contain" }} source={require('_assets/images/icon-instagram.png')} />
              <Text style={{fontSize: 14}}>Instagram</Text>
            </Col>
            <Col size={5} style={{alignItems: "flex-start"}}>
              <Image style={{ width: 56, height: 56, resizeMode: "contain" }} source={require('_assets/images/icon-telegram.png')} />
              <Text style={{fontSize: 14}}>Telegram</Text>
            </Col>
          </Row>
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
    padding: 25,
  },
  container_bottom: {
    position: "absolute",
    bottom: 10,
    width: '100%',
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
