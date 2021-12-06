import React, { Component, useState } from 'react'
import { StyleSheet, AsyncStorage, StatusBar, Text, View, ScrollView, TouchableOpacity, Dimensions, Image } from 'react-native'
import { Grid, Col, Form, Item, Input, Label, Icon, Row } from 'native-base'
import { Actions } from 'react-native-router-flux'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import Toast from 'react-native-easy-toast'
import { Colors, Typography } from '../../styles'
import HeaderBack from '../../components/headers/back'
import Button from '../../components/buttons'
import Modal from 'react-native-modal'
import Moment from 'moment'
import { POST, GET } from '../../services/ApiServices'
import { getProfile, formatPrice } from '../../utils/Global'

export default class Wallet extends Component {
  _isMounted = false

  constructor(props) {
    super(props)
  
    this.state = {
      userdata: null,
      nominal: 0,
      values: [100000, 200000, 500000, 1000000],
      itemRow: 2,
      popupOrder: false,
      popupPayment: false,
      popupReview: false,
      setModalVisible: false,
      paymentSelect: null,
      paymentMethods:  [],
      methods: [{
        code: 'atm',
        title: 'ATM/Bank Transfer',
        icon: require('../../assets/images/ecard.png'),
        description: 'Bayar dari ATM Bersama, Prima, atau Alto',
        account_name: 'PT DOMPET ABATA (BANK BCA)',
        account_icon: require('../../assets/images/payment/bca.png'),
        account_number : '0352613514'
      },{
        code: 'va',
        title: 'BCA VA',
        icon: require('../../assets/images/payment/bca.png'),
        description: 'Bayar dengan Virtual Account BCA',
        account_name: 'BCA Virtual Account',
        account_icon: require('../../assets/images/payment/bca.png'),
        account_number : '215615616465459'
      }]
    }
  }

  togglePopupOrder() {
    this.setState({
      popupOrder:!this.state.popupOrder
    })
  }

  togglePopupPayment() {
    this.setState({
      popupPayment:!this.state.popupPayment
    })
  }

  togglePopupReview() {
    this.setState({
      popupReview:!this.state.popupReview
    })
  }

  async componentDidMount() {
    this._isMounted = true

    // GET USER
    await getProfile().then((item) => {
      this.setState({ userdata: item })
    })

    // BANK DEPOSIT
    await GET('payment/method/'+this.state.userdata.id, {}, true).then(async (result) => {
      console.log(result)
      this.setState({ paymentMethods: result })
    }).catch(error => {
      console.log(error)
    })
  }

  next() {
    if(this.state.nominal == null || this.state.nominal == ''){
      this.refs.toast_error.show('Silahkan pilih atau isi nominal terlebih dahulu..', 1000)
    }else{
      if(parseInt(this.state.nominal) >= 10000){
        this.togglePopupOrder()
      }else{
        this.refs.toast_error.show('Minimal topup adalah sebesar Rp10.000', 1000)
      }
    }
  }

  orderNext(){
    this.togglePopupOrder()
    this.togglePopupPayment()
  }

  paymentBack(){
    this.togglePopupPayment()
    this.togglePopupOrder()
  }

  async paymentNext(item){
    // console.log(item)
    this.togglePopupPayment()
    this.setState({
      paymentSelect: item
    })
    if(item.type == 'creditcard'){
      this.togglePopupReview()
    }else{
      if(item.type == 'transfer' || item.type == 'sales'){
        await POST('topup/saldo/umum', {
          users_id: this.state.userdata.id,
          nominal: this.state.nominal,
          id_bank_list: item.bank_id,
          bank_number: item.bank_number,
          payment_method_id: item.id
        }, true).then(async (result) => {
          // console.log(result)
          Actions.payment({
            nominal: this.state.nominal,
            payment: this.state.paymentSelect,
            response: result    
          })
        }).catch(error => {
          console.log(error)
        })
      }else{
        await POST('topup/saldo/va', {
          users_id: this.state.userdata.id,
          nominal: this.state.nominal
        }, true).then(async (result) => {
          // console.log(result)
          Actions.payment_detail({
            nominal: this.state.nominal,
            payment: this.state.paymentSelect,
            response: result    
          })
        }).catch(error => {
          console.log(error)
        })
      }
    }
  }

  reviewBack(){
    this.togglePopupReview()
    this.togglePopupPayment()
  }

  async reviewNext(){
    this.togglePopupReview()
    Actions.payment_detail({
      nominal: this.state.nominal,
      payment: this.state.paymentSelect
    })
  }

  displayItems() {
    let arr = this.state.values.reduce((acc, item, idx) => {
      let group = acc.pop();
      if (group.length == this.state.itemRow) {
        acc.push(group);
        group = [];
      }
      group.push(item);
      acc.push(group);
      return acc;
    }, [[]]);

    return arr.map((item, index) => {
      let cols = []
      for (let index = 0; index < (this.state.itemRow - item.length); index++) {
        cols.push(null)
      }
      
      return (
        <Row key={index} style={{marginBottom: 5}}>
          { item.map(
            (value, index) => 
              <Col key={index} style={(this.state.nominal == value) ? styles.boxItemActive : styles.boxItem}>
                <TouchableOpacity style={{alignItems: "center", alignContent: "center"}} onPress={() => this.setState({nominal: value})}>
                  <Grid>
                    <Col size={2} style={{alignItems: "center", padding: 5, justifyContent: "center"}}>
                      <Image style={{ width: 34, height: 34, resizeMode: "contain" }} source={require('../../assets/images/dbcurrency.png')} />
                    </Col>
                    <Col size={8} style={{justifyContent: "center"}}>
                      <Text style={(this.state.nominal == value) ? styles.labelItemActive : styles.labelItem}>{formatPrice(value)}</Text>
                    </Col>
                  </Grid>
                </TouchableOpacity>
              </Col>
            )
          }
          { cols.map(
            (data, index) => 
              <Col key={index} style={{alignItems: "center", alignContent: "center"}}></Col>
            )
          }
        </Row>
      );
    });
  }

  setNominal(value){
    if(value.length < 1){
      this.setState({nominal: 0})
    }else{
      this.setState({nominal: parseInt(value)})
    }
  }

	render() {
		return(
      <View style={styles.container}>

        <HeaderBack title="Top up Saldo" />
        
        <View style={styles.container_form}>
          <ScrollView scrollEnabled={true}>
            <View style={styles.boxInput}>
              <Form style={{marginBottom: 12}}>
                <Item stackedLabel style={styles.formItem}>
                  <Label style={styles.labelForm}>Isi Nominal Saldo</Label>
                  <Input style={styles.inputFormValue} placeholder="Nominal" keyboardType="numeric" value={this.state.nominal.toString()} onChangeText = {(value) => this.setNominal(value)} />
                </Item>
              </Form>
            </View>
            <Text style={styles.title}>Pilih Nominal</Text>
            <Grid>
              {this.displayItems()}
            </Grid>
          </ScrollView>
        </View>
        <View style={styles.container_bottom}>
          <Button btnLabel='Isi Saldo' onPress={() => this.next()} />
        </View>

        
        {/* POPUP ORDER */}
        <Modal style={styles.popup} isVisible={this.state.popupOrder}>
          <View style={styles.popupHeader}>
            <Grid>
              <Col size={1} style={{justifyContent: "center"}}>
                <TouchableOpacity style={{width: "100%", alignItems: "center"}} onPress={() => this.togglePopupOrder()}>
                  <Icon type="Ionicons" name="close" style={styles.popupHeaderIcon} />
                </TouchableOpacity>
              </Col>
              <Col size={6} style={{justifyContent: "center"}}>
                <Text style={styles.popupHeaderTitle}>Top up Saldo</Text>
              </Col>
              <Col size={4} style={{justifyContent: "center"}}>
                <Text style={styles.popupHeaderStep}>Rincian Biaya</Text>
              </Col>
            </Grid>
          </View>
          <View style={styles.popupBody}>
            <View style={styles.popupBodyBox}>
              <Row style={{borderBottomWidth: 1, borderBottomColor: '#133A57', height: 50, paddingTop: 5}}>
                <Col size={6} style={{alignItems: "flex-start", justifyContent: "flex-start", paddingLeft: 10}}>
                  <Text>Jumlah</Text>
                </Col>
                <Col size={6} style={{alignItems: "flex-end", justifyContent: "center", paddingRight: 10}}>
                  <Grid>
                    <Col size={2} style={{alignItems: "flex-end", justifyContent: "flex-start"}}>
                      <Text style={styles.popupValueSmall}>Rp</Text>
                    </Col>
                    <Col size={10} style={{alignItems: "center", justifyContent: "flex-start"}}>
                      <Text style={styles.popupValueBig}>{formatPrice(this.state.nominal)}</Text>
                    </Col>
                  </Grid>
                </Col>
              </Row>
              {/* <Row style={{height: 28}}>
                <Col size={8} style={{alignItems: "flex-start", justifyContent: "center", paddingLeft: 10}}>
                  <Text>Order ID</Text>
                </Col>
                <Col size={4} style={{alignItems: "flex-end", justifyContent: "center", paddingRight: 10}}>
                  <Text style={styles.labelForm}>158454543799917</Text>
                </Col>
              </Row> */}
            </View>
            <View style={styles.popupBodyBox}>
              <Row style={{borderBottomWidth: 1, borderBottomColor: '#F4F4F4', height: 28}}>
                <Col size={6} style={{alignItems: "flex-start", justifyContent: "center", paddingLeft: 10}}>
                  <Text style={{color: '#A8A8A8'}}>Produk</Text>
                </Col>
                <Col size={6} style={{alignItems: "flex-end", justifyContent: "center", paddingRight: 10}}>
                  <Text style={{color: '#A8A8A8'}}>Jumlah</Text>
                </Col>
              </Row>
              <Row style={{height: 45}}>
                <Col size={8} style={{alignItems: "flex-start", justifyContent: "center", paddingLeft: 10}}>
                  <Text>Top up Saldo</Text>
                </Col>
                <Col size={4} style={{alignItems: "flex-end", justifyContent: "center", paddingRight: 10}}>
                  <Text style={styles.labelForm}>{formatPrice(this.state.nominal)}</Text>
                </Col>
              </Row>
            </View>
          </View>
          <View style={styles.popupFooter}>
            <Grid>
              <Col size={14} style={{justifyContent: "center"}}>
                <TouchableOpacity style={{width: "100%", justifyContent: "center"}} onPress={() => this.orderNext()}>
                  <Text style={styles.popupFooterTitle}>LANJUT PEMBAYARAN</Text>
                </TouchableOpacity>
              </Col>
              <Col size={1} style={{justifyContent: "center", alignItems: "center"}}>
                <TouchableOpacity style={{width: "100%", justifyContent: "center"}} onPress={() => this.orderNext()}>
                  <Icon type="FontAwesome" name="angle-right" style={styles.popupFooterIcon} />
                </TouchableOpacity>
              </Col>
            </Grid>
          </View>
        </Modal>

        {/* POPUP PAYMENT */}
        <Modal style={styles.popup} isVisible={this.state.popupPayment}>
          <View style={styles.popupHeader}>
            <Grid>
              <Col size={1} style={{justifyContent: "center"}}>
                <TouchableOpacity style={{width: "100%", alignItems: "center"}} onPress={() => this.paymentBack()}>
                  <Icon type="FontAwesome" name="angle-left" style={styles.popupHeaderIcon} />
                </TouchableOpacity>
              </Col>
              <Col size={3} style={{justifyContent: "center"}}>
                <Text style={styles.popupHeaderTitle}>Top up Saldo</Text>
              </Col>
              <Col size={7} style={{justifyContent: "center"}}>
                <Text style={styles.popupHeaderStep}>Pilih Metode Pembayaran</Text>
              </Col>
            </Grid>
          </View>
          <View style={styles.popupBodyFull}>
            <View style={styles.popupBodyBox}>
              <ScrollView style={{height: '100%'}} scrollEnabled={true}>
              { this.state.paymentMethods.map((item, index) => 
                <Row key={index} style={{borderBottomWidth: 1, borderBottomColor: '#F4F4F4', height: 85, paddingTop: 5, paddingBottom: 5}}>
                  <TouchableOpacity style={{width: "100%"}} onPress={() => this.paymentNext(item)}>
                    <Grid>
                      <Col size={4} style={{alignItems: "center", justifyContent: "center"}}>
                        <Image style={{ width: 60, height: '100%', resizeMode: "contain" }} source={{uri: item.icon}} />
                      </Col>
                      <Col size={8} style={{alignItems: "flex-start", justifyContent: "center", paddingRight: 10}}>
                        <Text style={styles.paymentTitle}>{item.title}</Text>
                        <Text style={styles.paymentDesc}>{item.type == 'va' ? 'Bayar dengan Transfer ke Virtual Account' : item.type == 'transfer' ? 'Bayar dengan Transfer ke Rekening Bank' : 'Bayar dengan Setor ke Sales Anda'}</Text>
                      </Col>
                      <Col size={1} style={{alignItems: "center", justifyContent: "center"}}>
                        <Icon type="FontAwesome" name="angle-right" style={styles.popupHeaderIcon} />
                      </Col>
                    </Grid>
                  </TouchableOpacity>
                </Row>
              )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* POPUP REVIEW CC */}
        <Modal style={styles.popup} isVisible={this.state.popupReview}>
          <View style={styles.popupHeader}>
          <Grid>
              <Col size={1} style={{justifyContent: "center"}}>
                <TouchableOpacity style={{width: "100%", alignItems: "center"}} onPress={() => this.reviewBack()}>
                  <Icon type="FontAwesome" name="angle-left" style={styles.popupHeaderIcon} />
                </TouchableOpacity>
              </Col>
              <Col size={6} style={{justifyContent: "center"}}>
                <Text style={styles.popupHeaderTitle}>Top up Saldo</Text>
              </Col>
              <Col size={4} style={{justifyContent: "center"}}>
                <Text style={styles.popupHeaderStep}>Kartu Kredit</Text>
              </Col>
            </Grid>
          </View>
          <View style={styles.popupBody}>
            <View style={styles.popupBodyBox}>
              <Row style={{borderBottomWidth: 1, borderBottomColor: '#133A57', height: 50, paddingTop: 5}}>
                <Col size={6} style={{alignItems: "flex-start", justifyContent: "flex-start", paddingLeft: 10}}>
                  <Text>Jumlah</Text>
                </Col>
                <Col size={6} style={{alignItems: "flex-end", justifyContent: "center", paddingRight: 10}}>
                  <Grid>
                    <Col size={2} style={{alignItems: "flex-end", justifyContent: "flex-start"}}>
                      <Text style={styles.popupValueSmall}>Rp</Text>
                    </Col>
                    <Col size={10} style={{alignItems: "center", justifyContent: "flex-start"}}>
                      <Text style={styles.popupValueBig}>{formatPrice(this.state.nominal)}</Text>
                    </Col>
                  </Grid>
                </Col>
              </Row>
              <Row style={{height: 28}}>
                <Col size={8} style={{alignItems: "flex-start", justifyContent: "center", paddingLeft: 10}}>
                  <Text>Order ID</Text>
                </Col>
                <Col size={4} style={{alignItems: "flex-end", justifyContent: "center", paddingRight: 10}}>
                  <Text style={styles.labelForm}>158454543799917</Text>
                </Col>
              </Row>
            </View>
            <View style={styles.popupBodyBox}>
              <Row style={{height: 45}}>
                <Input style={styles.inputCC} keyboardType="numeric" placeholderTextColor='#D6D6D6' placeholder="Nomor Kartu" />
              </Row>
              <Row style={{height: 45}}>
                <Col size={8}>
                  <Input style={styles.inputCC} keyboardType="numeric" placeholderTextColor='#D6D6D6' placeholder="Berlaku Hingga" />
                </Col>
                <Col size={4}>
                  <Input style={styles.inputCC} keyboardType="numeric" placeholderTextColor='#D6D6D6' placeholder="CVV" />
                </Col>
              </Row>
            </View>
          </View>
          <View style={styles.popupFooter}>
            <Grid>
              <Col size={14} style={{justifyContent: "center"}}>
                <TouchableOpacity style={{width: "100%", justifyContent: "center"}} onPress={() => this.reviewNext()}>
                  <Text style={styles.popupFooterTitle}>BAYAR SEKARANG</Text>
                </TouchableOpacity>
              </Col>
              <Col size={1} style={{justifyContent: "center", alignItems: "center"}}>
                <TouchableOpacity style={{width: "100%", justifyContent: "center"}} onPress={() => this.reviewNext()}>
                  <Icon type="FontAwesome" name="angle-right" style={styles.popupFooterIcon} />
                </TouchableOpacity>
              </Col>
            </Grid>
          </View>
        </Modal>

        
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
  borderStyleBase: {
    width: 45,
    height: 45,
    backgroundColor: '#F1F4F9',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#F1F4F9',
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontWeight: Typography.FONT_WEIGHT_REGULAR,
    color: Colors.PRIMARY,
    fontSize: 16,
  },
  borderStyleHighLighted: {
    borderColor: Colors.PRIMARY,
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
  boxItem: {
    alignItems: "center", 
    alignContent: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D6D6D6',
    margin: 5,
    padding: 0.5,
    paddingTop: 5,
    paddingBottom: 5,
  },
  boxItemActive: {
    alignItems: "center", 
    alignContent: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
    margin: 5,
    padding: 0.5,
    paddingTop: 5,
    paddingBottom: 5,
  },
  labelItem: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: '#000',
    fontSize: 24
  },
  labelItemActive: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: Colors.PRIMARY,
    fontSize: 24
  },

  // POPUP
  popup: {
    marginTop: 50,
    maxHeight: Dimensions.get('screen').height - 200,
    maxWidth: Dimensions.get('screen').width - 50,
    backgroundColor: '#F2F2F2',
    borderRadius: 5,
  },
  popupHeader: {
    width: '100%',
    height: '7%',
    backgroundColor: '#FFF',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC'
  },
  popupHeaderIcon: {
    color: '#A8A8A8',
    fontSize: 24
  },
  popupHeaderTitle: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: '#333',
    fontSize: 15,
    paddingLeft: 8
  },
  popupHeaderStep: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: '#333',
    fontSize: 15,
    textAlign: "right",
    paddingRight: 15
  },
  paymentTitle: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: '#333',
    fontSize: 15,
  },
  paymentDesc: {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontWeight: Typography.FONT_WEIGHT_REGULAR,
    color: '#333',
    fontSize: 15,
  },
  popupBody: {
    width: '100%',
    height: '87%',
    padding: 10,
  },
  popupBodyFull: {
    width: '100%',
    height: '95%',
    padding: 10,
  },
  popupBodyBox: {
    backgroundColor: '#FFF',
    marginBottom: 10
  },
  popupValueSmall: {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontWeight: Typography.FONT_WEIGHT_REGULAR,
    color: '#133A57',
    fontSize: 14,
  },
  popupValueBig: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: '#133A57',
    fontSize: 28,
  },
  popupFooter: {
    width: '100%',
    height: '6%',
    backgroundColor: '#112D42',
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  popupFooterTitle: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: '#FFF',
    fontSize: 18,
    paddingLeft: 15,
  },
  popupFooterIcon: {
    color: '#FFF',
    fontSize: 24,
  },
  inputCC: {
    borderWidth: 1, 
    borderColor: '#F4F4F4', 
    backgroundColor: '#FFF', 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#333', 
    width: '100%',
    paddingLeft: 10,
    paddingRight: 10
  }
});
