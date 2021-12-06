import React, { Component, useState } from 'react'
import { StyleSheet, AsyncStorage, StatusBar, Text, View, ScrollView, RefreshControl, TouchableOpacity, Dimensions, Image } from 'react-native'
import { Grid, Col, Form, Item, Input, Label, Icon, Row, Spinner, DatePicker } from 'native-base'
import { Actions } from 'react-native-router-flux'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import Toast from 'react-native-easy-toast'
import { Colors, Typography } from '../../styles'
import Button from '../../components/buttons'
import HeaderBack from '../../components/headers/back'
import Moment from 'moment'
import { POST, GET } from '../../services/ApiServices'
import { getProfile, formatPrice } from '../../utils/Global'

export default class History extends Component {
  _isMounted = false

  constructor(props) {
    super(props)
  
    this.state = {
      userdata: null,
      products: [{
        transaction: 0,
        success: 0,
        values: []
      }],
      loading: true,
      success: 0,
      total: 0,
      chosenDate: new Date()
    }

    this.setDate = this.setDate.bind(this)
  }

  async componentDidMount() {
    this._isMounted = true

    // GET USER
    await getProfile().then((item) => {
      this.setState({ userdata: item })
    })

    // PRODUCTS
    var today = new Date();
    var day = today.getDate().toString().length == 1 ? '0'+today.getDate().toString() : today.getDate().toString()
    var month = (today.getMonth() + 1).toString().length == 1 ? '0'+(today.getMonth() + 1).toString().toString() : (today.getMonth() + 1).toString().toString()
    var date = today.getFullYear().toString() + "-" + month + "-" + day;
    await GET('riwayat/transaksi/'+this.state.userdata.id+'/'+date, {}, true).then(async (result) => {
      var total = 0
      var success = 0
      let res = result.map(item => {
        if(item.status.toLowerCase() == 'success'){
          total = parseInt(total) + parseInt(item.grand_total) || 0
          success = success + 1
        }
        return item
      })
      await this.setState({ total: total })
      await this.setState({ success: success })

      await this.setState({ 
        products: [{
          totaltrx: result.length,
          values: result
        }] 
      })

      await this.setState({ loading: false })
      // console.log(result)
    }).catch(error => {
      console.log(error)
    })
  }

  _onRefresh = () => {
    Actions.refresh({key: Moment.utc().format('YYYYMMDDhhmmss')})
  }

  async setDate(newDate) {
    await this.setState({ chosenDate: newDate })
    // console.log(newDate)
    var today = new Date(newDate);
    var day = today.getDate().toString().length == 1 ? '0'+today.getDate().toString() : today.getDate().toString()
    var date = today.getFullYear().toString() + "-" + (today.getMonth() + 1).toString() + "-" + day;
    await GET('riwayat/transaksi/'+this.state.userdata.id+'/'+date, {}, true).then(async (result) => {
      var total = 0
      var success = 0
      let res = result.map(item => {
        if(item.status.toLowerCase() == 'success'){
          total = parseInt(total) + parseInt(item.grand_total) || 0
          success = success + 1
        }
        return item
      })
      await this.setState({ total: total })
      await this.setState({ success: success })

      await this.setState({ 
        products: [{
          totaltrx: result.length,
          values: result
        }] 
      })

      await this.setState({ loading: false })
      // console.log(result)
    }).catch(error => {
      console.log(error)
    })
  }

	render() {
		return(
      <View style={styles.container}>

        <HeaderBack title="Riwayat Transaksi" />
        
        {
          (this.state.loading == true) ?
          <View style={styles.container_form}>
            <Spinner color='green' />
          </View>
          : false
        }

        {
          (this.state.loading == false) ?
          <View style={styles.container_form}>
            <ScrollView 
              ref={ref => {this.scrollView = ref}}
              refreshControl={
                <RefreshControl
                  refreshing={this.state.refreshing}
                  onRefresh={this._onRefresh}
                />
              }
              scrollEnabled={true}>
              { (this.state.products || []).map((item, key) => {
                return (
                  <Grid key={key}>
                    <Row style={{borderBottomWidth: 1, borderBottomColor: '#F1F3F6', marginBottom: 5, paddingTop: 5, paddingLeft: 15, paddingRight: 10}}>
                      <Col size={7} style={{alignItems: "flex-end", justifyContent: "center", paddingRight: 10}}>
                        <Text style={[styles.title, {paddingBottom: 5, textAlign: 'right'}]}>Pilih Tanggal</Text>
                      </Col>
                      <Col size={4} style={{alignItems: "flex-end", justifyContent: "center", paddingRight: 15, borderRadius: 8, borderWidth: 1, borderColor: 'green', marginBottom: 5}}>
                        <DatePicker
                          defaultDate={new Date()}
                          minimumDate={new Date(2018, 1, 1)}
                          maximumDate={new Date()}
                          locale={"en"}
                          timeZoneOffsetInMinutes={undefined}
                          modalTransparent={false}
                          animationType={"fade"}
                          androidMode={"default"}
                          // placeHolderText="Pilih Tanggal"
                          textStyle={{ color: "green" }}
                          // placeHolderTextStyle={{ color: "#d3d3d3" }}
                          onDateChange={this.setDate}
                          disabled={false}
                          />
                      </Col>
                    </Row>
                    <Row style={{borderBottomWidth: 1, borderBottomColor: '#F1F3F6', marginBottom: 5, paddingRight: 10, paddingBottom: 5, paddingLeft: 15}}>
                      <Col size={4} style={{alignItems: "center", justifyContent: "center", borderRadius: 8, borderWidth: 1, borderColor: 'green', marginRight: 5}}>
                        <Text style={[styles.title, {paddingBottom: 2, paddingLeft: 5, color: 'green'}]}>Total Transaksi</Text>
                        <View style={{textAlign: 'center', justifyContent: 'center'}}>
                          <Text style={{paddingBottom: 5, fontSize: 20, fontWeight: 'bold', color: 'green'}}>
                            {item.totaltrx}
                          </Text>
                        </View>
                      </Col>
                      <Col size={4} style={{alignItems: "center", justifyContent: "center", borderRadius: 8, borderWidth: 1, borderColor: 'green'}}>
                        <Text style={[styles.title, {paddingBottom: 2, paddingLeft: 5, color: 'green'}]}>Transaksi Sukses</Text>
                        <View style={{textAlign: 'center', justifyContent: 'center'}}>
                          <Text style={{paddingBottom: 5, fontSize: 20, fontWeight: 'bold', color: 'green'}}>
                            {this.state.success}
                          </Text>
                        </View>
                      </Col>
                    </Row>
                    <Row style={{borderBottomWidth: 1, borderBottomColor: '#F1F3F6', marginBottom: 5, paddingRight: 10, paddingBottom: 5, paddingLeft: 15}}>
                      <Col style={{alignItems: "center", justifyContent: "center", borderRadius: 8, borderWidth: 1, borderColor: 'green'}}>
                        <Text style={[styles.title, {paddingBottom: 2, paddingLeft: 5, color: 'green'}]}>Total Pengeluaran</Text>
                        <View style={{textAlign: 'center', justifyContent: 'center'}}>
                          <Text style={{paddingBottom: 5, fontSize: 20, fontWeight: 'bold', color: 'green'}}>
                            Rp{formatPrice(this.state.total)}
                          </Text>
                        </View>
                      </Col>
                    </Row>

                    { (item.values || []).map((unit, key2) => {
                      return (
                        <TouchableOpacity key={key2} onPress={() => Actions.history_print({ detail: unit })}>
                          <Row style={{borderBottomWidth: 1, borderBottomColor: '#F1F3F6', marginBottom: 10, paddingBottom: 10}}>
                            <Col size={2} style={{justifyContent: "center", alignItems: "center"}}>
                              <Image style={{ width: 45, height: 45, resizeMode: "contain" }} source={require('../../assets/images/dbcurrency.png')} />
                            </Col>
                            <Col size={6} style={{justifyContent: "center"}}>
                              <Text style={[styles.titleBoldBlack]}>{unit.ref_id_TP}</Text>
                              <Row style={{paddingTop: 5}}>
                                {
                                  (typeof unit.grand_total !== 'undefined') ? 
                                  <Col>
                                    <Text style={[styles.titleSmallBlack]}>Harga</Text>
                                    <Text style={[styles.titleSmallBlackBold]}>Rp{formatPrice(unit.grand_total)}</Text>
                                  </Col>
                                  :false
                                }
                                {
                                  (unit.transaction_types != null && typeof unit.transaction_types.name !== 'undefined') ? 
                                  <Col>
                                    <Text style={[styles.titleSmallBlack]}>Produk</Text>
                                    <Text style={[styles.titleSmallBlackBold]}>{unit.transaction_types.name}</Text>
                                  </Col>
                                  :false
                                }
                                {
                                  (unit.transaction_types == null && unit.referer_table == 'transfer_histories') ? 
                                  <Col>
                                    <Text style={[styles.titleSmallBlack]}>Produk</Text>
                                    <Text style={[styles.titleSmallBlackBold]}>Kirim Uang</Text>
                                  </Col>
                                  :false
                                }
                              </Row>
                            </Col>
                            <Col size={4} style={{justifyContent: "center", alignItems: "flex-end"}}>
                              <Text style={[styles.titleSmallBlack, {marginBottom: 5}]}>{Moment(unit.created_at).format('DD MMMM YYYY H:m')}</Text>
                              <Text style={(unit.status.toLowerCase() == 'success') ? styles.titleBoldGreen : (unit.status.toLowerCase() == 'pending') ? styles.titleBoldOrange : styles.titleBoldRed }>{unit.status.toUpperCase()}</Text>
                            </Col>
                            <Col size={1} style={{justifyContent: "center", alignItems: "center"}}>
                              <Icon type="FontAwesome" name="angle-right" style={{color: '#333333', fontSize: 20}} />
                            </Col>
                          </Row>
                        </TouchableOpacity>
                      );
                    })}

                    {(this.state.total == 0) ? 
                      <Row style={{borderBottomWidth: 1, borderBottomColor: '#F1F3F6', marginBottom: 15, paddingRight: 10, paddingBottom: 5, paddingLeft: 15}}>
                        <Col style={{alignItems: "center", justifyContent: "center", paddingTop: 15}}>
                          <Text style={[styles.title, {paddingBottom: 2, textAlign: 'center', color: '#333'}]}>Riwayat Transaksi masih kosong, silahkan melakukan transaksi terlebih dahulu</Text>
                        </Col>
                      </Row>
                    : false}
                  </Grid>
                );
              })} 

            </ScrollView>
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
  title: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: Colors.PRIMARY,
    fontSize: 16,
    marginBottom: 10,
  },
  container_form : {
    paddingBottom: 45,
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
  titleSmallBlackBold: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
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
  titleBoldOrange: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: '#FEC007',
    fontSize: 16,
  },
  titleBoldRed: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: '#F63F3F',
    fontSize: 16,
  }
});
