import React, { Component } from 'react'
import { StyleSheet, AsyncStorage, StatusBar, Text, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native'
import { Grid, Col, Form, Item, Input, Label, Icon, Row } from 'native-base'
import { Actions } from 'react-native-router-flux'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import Toast from 'react-native-easy-toast'
import { Colors, Typography } from '_styles'
import HeaderBack from '_headers/back'
import Button from '_components/buttons'
import Moment from 'moment'
import { POST, GET } from '_services/ApiServices'
import { getProfile, formatPrice } from '_utils/Global'

export default class Paylater extends Component {
  _isMounted = false

  constructor(props) {
    super(props)
  
    this.state = {
      userdata: null,
      profile: null,
      paylater: null,

    }
  }

 async componentDidMount() {
    this._isMounted = true

    // GET USER
    await getProfile().then((item) => {
      this.setState({ userdata: item })
    })

    // PROFILE
    await POST('profile', {
      id: this.state.userdata.id
    }, true).then(async (result) => {
      console.log(JSON.stringify(result))
      this.setState({ profile: result })
      if(result.user[0].paylater_requests != null){
        result.user[0].paylater_requests.map((item, index) => {
          if(item.status == 'true'){
            this.setState({ paylater: item })
          }
        })
      }
    }).catch(error => {
      console.log(error)
    })
  }

  async next() {
    Actions.reset('menus')
  }

	render() {
		return(
      <View style={styles.container}>

        <HeaderBack title="Qonter" />
        
        <View style={[styles.container_form, { borderBottomWidth: 9, borderBottomColor: '#F0F0F0' }]}>
          <Text style={[styles.titleBoldBlack, { marginBottom: 5, textAlign: "center" }]}>Total Tagihan</Text>
          <Text style={[styles.titleBigBlack, { marginBottom: 5, textAlign: "center" }]}>Rp{(this.state.paylater != null && typeof this.state.paylater.debt !== 'undefined' && this.state.paylater.debt != null) ? formatPrice(this.state.paylater.debt) : 0}</Text>
          {
            (this.state.paylater != null && typeof this.state.paylater.debt !== 'undefined' && this.state.paylater.debt != null) ?
            <Text style={[styles.titleSmallBlack, { marginBottom: 15, textAlign: "center" }]}>Tagihan Anda jatuh tempo pada tanggal <Text style={{color: 'red', fontWeight: "bold"}}>{Moment(this.state.paylater.due_date).format('DD MMMM YYYY')}</Text>.{'\n'}Bayar sebelum tanggal tersebut.</Text>
            : false
          }
        </View>
        <View style={styles.container_form}>
          <Text style={[styles.titleBoldGreen, {marginBottom: 10}]}>Tagihan Detail</Text>
          <Row style={{height: 28}}>
            <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
              <Text style={styles.title}>Dompet Terpakai</Text>
            </Col>
            <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
              <Text style={styles.titleBoldBlack}>Rp{(this.state.paylater != null && typeof this.state.paylater.debt !== 'undefined' && this.state.paylater.debt != null) ? formatPrice(this.state.paylater.debt) : 0}</Text>
            </Col>
          </Row>
          <Row style={{height: 28}}>
            <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
              <Text style={styles.title}>Denda</Text>
            </Col>
            <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
              <Text style={styles.titleBoldBlack}>-</Text>
            </Col>
          </Row>
          <Row style={{height: 28}}>
            <Col size={6} style={{alignItems: "flex-start", justifyContent: "center"}}>
              <Text style={styles.titleBoldBlack}>Total Pembayaran</Text>
            </Col>
            <Col size={6} style={{alignItems: "flex-end", justifyContent: "center"}}>
              <Text style={styles.titleBoldRed}>Rp{(this.state.paylater != null && typeof this.state.paylater.debt !== 'undefined' && this.state.paylater.debt != null) ? formatPrice(this.state.paylater.debt) : 0}</Text>
            </Col>
          </Row>
          {
            (this.state.profile != null && this.state.profile.user[0].roles.id == '5') ?
              <Row style={{height: 28, paddingTop: 20}}>
                <Col size={12} style={{alignItems: "center", justifyContent: "center"}}>
                  <Text style={[styles.titleSmallBlack, {textAlign: "center"}]}>Silahkan hubungi Sales / Kolektor Anda untuk melunasi tagihan.</Text>
                </Col>
              </Row>
            : false
          }
        </View>

        {
          (this.state.profile != null && this.state.profile.user[0].roles.id != '5') ?
            <View style={styles.container_bottom}>
              <Button btnLabel='Bayar Tagihan' onPress={() => this.next()} />
            </View>
          : false
        }
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
    width: '100%'
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
