import React, { Component, useState } from 'react'
import { StyleSheet, AsyncStorage, StatusBar, Text, View, ScrollView, TouchableOpacity, Dimensions, Image } from 'react-native'
import { Grid, Col, Form, Item, Input, Label, Icon, Row, Button } from 'native-base'
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
      paylater_request: null,
      listdata: [],
      transactions: [],
      detaildata: null
    }
  }

  async componentDidMount() {
    this._isMounted = true

    // GET USER
    await getProfile().then((item) => {
      this.setState({ userdata: item })
    })

    // RIWAYAT TAGIHAN
    await GET('user/repayment/'+this.props.detail.user.id, {}, true).then((item) => {
      console.log(JSON.stringify(item))
      this.setState({ detaildata: item })
      this.setState({ transactions: item.uses })
    })

    // RIWAYAT PAYLATER
    // await GET('paylater/list/request/'+this.props.detail.user.id, {}, true).then(async (result) => {
    //   this.setState({ listdata: result })
    // }).catch(error => {
    //   console.log(error)
    // })
  }

  async approve(id) {
    console.log(id)
    await GET('paylater/repayment/'+id, {}, true).then(async (result) => {
      console.log(JSON.stringify(result))
      if(typeof result.error !== 'undefined'){
        this.refs.toast_error.show(result.message, 1000)
        return false
      }
      this.refs.toast_success.show('Tagihan Konter berhasil dibayar, silahkan cek di menu Setoran Saya untuk segera melakukan setoran.', 1000)
      setTimeout(() => {
        // Actions.kolektor_approval()
        Actions.reset('menus')
      }, 2500)
    }).catch(error => {
      console.log(JSON.stringify(error))
      this.refs.toast_error.show(error.message, 1000)
    })
  }

	render() {
		return(
      <View style={styles.container}>

        <HeaderBack title={'Tagihan '+this.props.detail.user.name} />
        
        <View style={styles.container_form}>
          <ScrollView scrollEnabled={true}>
            <Label style={[styles.labelForm, {textAlign: "center"}]}>Sisa Limit Qonter</Label>
            <Label style={[styles.titleBigBlack, {textAlign: "center", paddingBottom: 15}]}>Rp{(this.state.detaildata != null) ? formatPrice(this.state.detaildata.request[0].amount - this.state.detaildata.request[0].debt) : 0}</Label>

            <View style={styles.container_form}>
              <Text style={[styles.titleBoldBlack, { textAlign: "center" }]}>Total Tagihan</Text>
              <Text style={[styles.titleBigBlack, { marginBottom: 5, textAlign: "center", fontSize: 22, color: (this.state.detaildata != null && Moment(this.state.detaildata.request[0].due_date).diff(Moment(new Date())) < 0) ? 'red' : 'green' }]}>Rp{(this.state.detaildata != null && typeof this.state.detaildata.request[0].debt !== 'undefined' && this.state.detaildata.request[0].debt != null) ? formatPrice(this.state.detaildata.request[0].debt) : 0}</Text>
              {
                (this.state.detaildata != null && typeof this.state.detaildata.request[0].due_date !== 'undefined' && this.state.detaildata.request[0].due_date != null) ?
                <Text style={[styles.titleSmallBlack, { marginBottom: 15, textAlign: "center" }]}>Tagihan Konter <Text style={{fontWeight: 'bold'}}>{this.props.detail.user.name}</Text> jatuh tempo pada tanggal <Text style={{color: (Moment(this.state.detaildata.request[0].due_date).diff(Moment(new Date())) < 0) ? 'red' : 'green', fontWeight: "bold"}}>{Moment(this.state.detaildata.request[0].due_date).format('DD MMMM YYYY')}</Text>.{'\n'}Bayar sebelum tanggal tersebut.</Text>
                : false
              }
              {
                (this.state.detaildata != null && typeof this.state.detaildata.request !== 'undefined' && this.state.detaildata.request.length > 0) ? 
                <View style={{alignItems: "center", width: '100%', paddingLeft: 15, paddingRight: 15}}>
                  <Button style={{width: '100%', borderRadius: 5}} block success onPress={() => this.approve(this.state.detaildata.request[0].id)}>
                    <Text style={{width: '100%',textAlign: 'center', fontSize: 14, fontWeight: "bold", color: '#fff'}}>Sudah Dibayar</Text>
                  </Button>
                </View>
                : false
              }
            </View>
            
            <Grid>
              <Row style={{borderBottomWidth: 1, borderBottomColor: '#F1F3F6', marginBottom: 5, marginTop: 15}}>
                <Col>
                  <Text style={[styles.titleBoldGreen, {paddingBottom: 10}]}>Riwayat Transaksi Limit</Text>
                </Col>
              </Row>
              { 
                this.state.transactions.map((trx, trxkey) => {
                  return (
                    <Row key={trxkey} style={{borderBottomWidth: 1, borderBottomColor: '#F1F3F6', marginBottom: 10, paddingBottom: 10}}>
                      <Col size={2} style={{justifyContent: "center", alignItems: "center"}}>
                        <Image style={{ width: 45, height: 45, resizeMode: "contain" }} source={require('../../assets/images/dbcurrency.png')} />
                      </Col>
                      <Col size={10} style={{justifyContent: "center"}}>
                        <Grid>
                          {
                            (trx.transactions.referer_table == 'transfer_histories') ? 
                            <Col>
                              <Text style={[styles.titleSmallBlack]}>Kirim Uang - {trx.transactions.response.recipient_account} - {trx.transactions.response.recipient_name}</Text>
                            </Col>
                            :
                            <Col>
                              <Text style={[styles.titleSmallBlack]}>{trx.transactions.product_values.name} - {trx.transactions.response.customer_no}</Text>
                            </Col>
                          }  
                        </Grid>
                        <Text style={[styles.title]}>Rp{formatPrice(trx.transactions.grand_total)}</Text>
                      </Col>
                      <Col size={4} style={{justifyContent: "center", alignItems: "flex-end"}}>
                        <Text style={[styles.titleSmallBlack, {marginBottom: 5}]}>{Moment(trx.transactions.created_at).format('DD MMMM YYYY')}</Text>
                        <Text style={{backgroundColor: (trx.transactions.status == 'success') ? 'green' : (trx.transactions.status == 'failed') ? 'red' : 'orange', color: '#FFF', borderRadius: 5, paddingLeft: 8, paddingRight: 8}}>
                          {(trx.transactions.status == 'success') ? 'Sukses' : (trx.transactions.status == 'failed') ? 'Gagal' : 'Pending'}
                        </Text>
                      </Col>
                    </Row>
                  );
                })
              }
            </Grid>
            
            {/* <Grid>
              <Row style={{borderBottomWidth: 1, borderBottomColor: '#F1F3F6', marginBottom: 5, marginTop: 15}}>
                <Col>
                  <Text style={[styles.titleBoldGreen, {paddingBottom: 10}]}>Riwayat Pengajuan Limit</Text>
                </Col>
              </Row>
              { 
                this.state.listdata.sort(function(a,b){ return new Date(b.created_at).getTime() - new Date(a.created_at).getTime() }).map((unit, key) => {
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
            </Grid>  */}
          </ScrollView>
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
