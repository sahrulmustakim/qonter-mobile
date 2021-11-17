import React, { Component } from 'react'
import { StyleSheet, AsyncStorage, StatusBar, Text, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native'
import { Grid, Col, Form, Item, Input, Label, Icon, Row } from 'native-base'
import { Actions } from 'react-native-router-flux'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import Toast from 'react-native-easy-toast'
import { Colors, Typography } from '_styles'
import HeaderBack from '_headers/back'
import Button from '_components/buttons'

export default class PrintDetail extends Component {
  _isMounted = false

  constructor(props) {
    super(props)
  
    this.state = {
      pin: null,
    }
  }

  componentDidMount() {
    this._isMounted = true
  }

  async next() {
    Actions.reset('menus')
  }

	render() {
		return(
      <View style={styles.container}>

        <HeaderBack title="Cetak Struk" />
        <View style={styles.container_form}>
          <Row style={{height: 28}}>
            <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
              <Text style={styles.titleBoldGreen}>Voucher Game</Text>
            </Col>
            <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
              <Text style={styles.titleGreen}>20 Juli 2020</Text>
            </Col>
          </Row>
          <Row style={{height: 28}}>
            <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
              <Text style={styles.title}>Status Pesanan</Text>
            </Col>
            <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
              <Text style={styles.titleBoldBlack}>Berhasil</Text>
            </Col>
          </Row>
          <Row style={{height: 28}}>
            <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
              <Text style={styles.title}>Nomor Transaksi</Text>
            </Col>
            <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
              <Text style={styles.titleBoldBlack}>INV2XVK/SELT</Text>
            </Col>
          </Row>
          <Row style={{height: 28}}>
            <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
              <Text style={styles.title}>Nomor Telepon</Text>
            </Col>
            <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
              <Text style={styles.titleBoldBlack}>08123456789</Text>
            </Col>
          </Row>
          <Row style={{height: 28}}>
            <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
              <Text style={styles.title}>Provider</Text>
            </Col>
            <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
              <Text style={styles.titleBoldBlack}>Voucher Game</Text>
            </Col>
          </Row>
          <Row style={{height: 28}}>
            <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
              <Text style={styles.title}>Jenis Paket</Text>
            </Col>
            <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
              <Text style={styles.titleBoldBlack}>60 UC</Text>
            </Col>
          </Row>
          <Row style={{height: 28}}>
            <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
              <Text style={styles.title}>Harga</Text>
            </Col>
            <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
              <Text style={styles.titleBoldBlack}>Rp20.000</Text>
            </Col>
          </Row>
          <Row style={{height: 28}}>
            <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
              <Text style={styles.titleGreen}>Diskon</Text>
            </Col>
            <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
              <Text style={styles.titleBoldGreen}>-Rp3.000</Text>
            </Col>
          </Row>
          <Row style={{height: 28}}>
            <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
              <Text style={styles.title}>Total</Text>
            </Col>
            <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
              <Text style={styles.titleBoldBlack}>Rp17.000</Text>
            </Col>
          </Row>
        </View>

        <View style={styles.container_bottom}>
          <Button btnLabel='Cetak Struk' onPress={() => this.next()} />
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
    padding: 15,
  },
  container_bottom: {
    position: "absolute",
    bottom: 10,
    width: '100%'
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
});
