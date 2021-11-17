import React, { Component, useState } from 'react'
import { StyleSheet, AsyncStorage, StatusBar, Text, View, ScrollView, TouchableOpacity, Dimensions, Image } from 'react-native'
import { Grid, Col, Form, Item, Input, Label, Icon, Row, Spinner } from 'native-base'
import { Actions } from 'react-native-router-flux'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import Toast from 'react-native-easy-toast'
import { Colors, Typography } from '_styles'
import HeaderBack from '_headers/back'
import Button from '_components/buttons'
import Moment from 'moment'
import { POST, GET } from '_services/ApiServices'
import { getProfile, formatPrice } from '_utils/Global'

export default class Print extends Component {
  _isMounted = false

  constructor(props) {
    super(props)
  
    this.state = {
      keyword: null,
      userdata: null,
      products: [{
        title: 'Semua Transaksi',
        values: []
      }],
      loading: false,
    }
  }

  async componentDidMount() {
    this._isMounted = true

    // GET USER
    await getProfile().then((item) => {
      this.setState({ userdata: item })
    })
  }

  async search() {
    this.setState({ loading: true })
    if(this.state.keyword == null || this.state.keyword == ''){
      this.refs.toast_error.show('Silahkan masukkan nomor tujuan yang akan dicari', 1000)
      this.setState({ loading: false })
    }else{
      await POST('riwayat/transaksi/search', {
        keyword: this.state.keyword
      }, true).then(async (result) => {
        console.log(result)
        await this.setState({ 
          products: [{
            title: 'Semua Transaksi',
            values: result
          }] 
        })
        await this.setState({ loading: false })
      }).catch(error => {
        console.log(error)
      })
    }
  }

  async next() {
    Actions.print_detail()
  }

	render() {
		return(
      <View style={styles.container}>

        <HeaderBack title="Cetak Struk" />
        
        <View style={styles.container_form}>
          <View style={styles.boxInput}>
            <Form style={{marginBottom: 12}}>
              <Item stackedLabel style={styles.formItem}>
                <Label style={styles.labelForm}>Nomor Tujuan</Label>
                <Input style={styles.inputFormValue} placeholder="Masukkan Nomor Tujuan" placeholderTextColor="#A8A8A8" onChangeText = {(value) => this.setState({keyword: value})} />
              </Item>
              <Icon type="Ionicons" name="search" style={styles.headerIcon} onPress={() => this.search()} />
            </Form>
          </View>

          {
            (this.state.loading == true) ?
            <View style={styles.container_form}>
              <Spinner color='green' />
            </View>
            : false
          }

          {
            (this.state.loading == false && this.state.products[0].values.length > 0) ?
            <ScrollView scrollEnabled={true}>
              { this.state.products.map((item, key) => {
                return (
                  <Grid key={key}>
                    <Row style={{marginBottom: 5, paddingTop: 10, paddingLeft: 15}}>
                      <Col>
                        <Text style={[styles.title, {paddingBottom: 10}]}>{item.title}</Text>
                      </Col>
                    </Row>
                    { item.values.map((unit, key2) => {
                      return (
                        <TouchableOpacity key={key2} onPress={() => Actions.history_detail({ detail: unit })}>
                          <Row style={{borderWidth: 1, borderColor: '#ccc', borderRadius: 10, marginBottom: 10, paddingBottom: 10, paddingTop: 10}}>
                            <Col size={2} style={{justifyContent: "center", alignItems: "center"}}>
                              <Image style={{ width: 45, height: 45, resizeMode: "contain" }} source={require('_assets/images/dbcurrency.png')} />
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
                  </Grid>
                );
              })} 

            </ScrollView>
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
