import React, { Component, useState } from 'react'
import { StyleSheet, AsyncStorage, StatusBar, Text, View, ScrollView, TouchableOpacity, Dimensions, Image } from 'react-native'
import { Grid, Col, Form, Item, Input, Label, Icon, Row } from 'native-base'
import { Actions } from 'react-native-router-flux'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import Toast from 'react-native-easy-toast'
import { Colors, Typography } from '../../styles'
import ButtonFill from '../../components/buttons/fill'
import HeaderBack from '../../components/headers/back'
import Moment from 'moment'
import { POST, GET } from '../../services/ApiServices'
import { getProfile, formatPrice } from '../../utils/Global'

export default class Paylater extends Component {
  _isMounted = false

  constructor(props) {
    super(props)
  
    this.state = {
      nominal: 0,
      userdata: null,
      profile: null,
      paylater: null,
      listdata: []
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
      this.setState({ profile: result })
      if(result.user[0].paylater_requests != null){
        result.user[0].paylater_requests.map((item, index) => {
          if(item.status == 'true'){
            this.setState({ paylater: item })
            this.setState({ nominal: item.amount })
          }
        })
      }
    }).catch(error => {
      console.log(error)
    })

    // RIWAYAT PAYLATER
    await GET('user/list/limit/request/'+this.state.userdata.id, {}, true).then(async (result) => {
      this.setState({ listdata: result })
    }).catch(error => {
      console.log(error)
    })
  }

  async submit() {
    if(this.state.nominal == null || this.state.nominal == 0){
      this.refs.toast_error.show('Silahkan isi Nominal Pengajuan Penambahan Limit Anda', 1000)
      return false
    }

    await POST('paylater/request', {
      users_id: this.state.userdata.id,
      amount: this.state.nominal
    }, true).then(async (result) => {
      console.log(result)
      if(typeof result.error !== 'undefined'){
        this.refs.toast_error.show(result.message, 1000)
        return false
      }
      this.refs.toast_success.show('Pengajuan Penambahan Limit Qonter berhasil dikirim, Silahkan menunggu untuk konfirmasi persetujuan dari kami.', 1000)
      Actions.refresh({key: Moment.utc().format('YYYYMMDDhhmmss')})
    }).catch(error => {
      console.log(error)
      this.refs.toast_error.show(error.message, 1000)
    })
  }

	render() {
		return(
      <View style={styles.container}>

        <HeaderBack title="Pengajuan Limit Dompet" />
        
        <View style={styles.container_form}>
          <ScrollView scrollEnabled={true}>
            <Label style={[styles.labelForm, {textAlign: "center"}]}>Limit Qonter saat ini</Label>
            <Label style={[styles.titleBigBlack, {textAlign: "center", paddingBottom: 15}]}>Rp{(this.state.paylater != null) ? formatPrice(this.state.paylater.amount) : 0}</Label>
            
            <View style={styles.boxInput}>
              <Form style={{marginBottom: 12}}>
                <Item stackedLabel style={styles.formItem}>
                  <Label style={styles.labelForm}>Isi Nominal Pengajuan Limit Baru</Label>
                  <Input style={styles.inputFormValue} placeholder="Nominal" keyboardType="numeric" value={this.state.nominal.toString()} onChangeText = {(value) => this.setState({nominal: value})} />
                </Item>
                <View style={{alignItems: "center", width: '100%', paddingLeft: 15, paddingRight: 15}}>
                  <Label style={[styles.labelFormWarning, {textAlign: 'center'}]}>Nominal diatas adalah nominal untuk pengajuan limit baru dan mengganti Limit yang sudah aktif</Label>
                </View>
              </Form>
            </View>
            
            <Grid>
              <Row style={{borderBottomWidth: 1, borderBottomColor: '#F1F3F6', marginBottom: 5, marginTop: 15}}>
                <Col>
                  <Text style={[styles.titleBoldGreen, {paddingBottom: 10}]}>Riwayat Pengajuan Limit</Text>
                </Col>
              </Row>
              { 
                this.state.listdata.map((unit, key) => {
                  return (
                    <Row key={key} style={{borderBottomWidth: 1, borderBottomColor: '#F1F3F6', marginBottom: 10, paddingBottom: 10}}>
                      <Col size={2} style={{justifyContent: "center", alignItems: "center"}}>
                        <Image style={{ width: 45, height: 45, resizeMode: "contain" }} source={require('../../assets/images/dbcurrency.png')} />
                      </Col>
                      <Col size={5} style={{justifyContent: "center"}}>
                        <Text style={[styles.titleBoldBlack]}>Nominal Pengajuan</Text>
                        <Text style={[styles.title]}>Rp{formatPrice(unit.amount)}</Text>
                      </Col>
                      <Col size={5} style={{justifyContent: "center", alignItems: "flex-end"}}>
                        <Text style={[styles.titleSmallBlack, {marginBottom: 5}]}>{Moment(unit.created_at).format('DD MMMM YYYY')}</Text>
                        <Text style={{backgroundColor: (unit.status == 'true') ? 'green' : (unit.status == 'false') ? 'red' : 'orange', color: '#FFF', borderRadius: 5, paddingLeft: 8, paddingRight: 8}}>
                          {(unit.status == 'true') ? 'Disetujui' : (unit.status == 'false') ? 'Tidak Disetujui' : 'Menunggu Konfirmasi'}
                        </Text>
                      </Col>
                    </Row>
                  );
                })
              }
            </Grid> 
          </ScrollView>
        </View>
        <View style={styles.container_bottom}>
          <ButtonFill btnLabel='Ajukan' onPress={() => this.submit()} />
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
  title: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: Colors.PRIMARY,
    fontSize: 16,
    marginBottom: 10,
  },
  container_form : {
    margin: 15,
  },
  container_bottom: {
    position: "absolute",
    bottom: 10,
    width: '100%'
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
  labelFormWarning: {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontWeight: Typography.FONT_WEIGHT_REGULAR,
    color: Colors.WARNING,
    fontSize: 12
  },
  inputForm: {
    paddingTop: 12,
    paddingLeft: 0,
    paddingBottom: 0,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontWeight: Typography.FONT_WEIGHT_REGULAR,
    color: '#A8A8A8',
    fontSize: 16,
    width: '100%'
  },
  inputFormValue: {
    paddingTop: 12,
    paddingLeft: 0,
    paddingBottom: 0,
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: '#333333',
    fontSize: 16,
    width: '100%'
  },
  headerIcon: {
    position: "absolute",
    right: 15,
    top: '52%',
    color: '#B1B1B1',
    fontSize: 22
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
