import React, { Component, useState } from 'react'
import { StyleSheet, AsyncStorage, StatusBar, Text, View, ScrollView, TouchableOpacity, Dimensions, Image } from 'react-native'
import { Grid, Col, Form, Item, Input, Label, Icon, Picker, Row, Button } from 'native-base'
import { Actions } from 'react-native-router-flux'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import Toast from 'react-native-easy-toast'
import { Colors, Typography } from '../../styles'
import HeaderBack from '../../components/headers/back'
import Modal from 'react-native-modal'
import { getProfile, formatPrice } from '../../utils/Global'
import { POST, GET } from '../../services/ApiServices'
import Select2 from "react-native-select-two"

export default class Wallet extends Component {
  _isMounted = false

  constructor(props) {
    super(props)
  
    this.state = {
      userdata: null,
      banks: [],
      bank_selected: null,
      amount: 0,
      norek: null,
      note: null,
      email: null
    }
  }

  async componentDidMount() {
    this._isMounted = true
    
    // GET USER
    await getProfile().then((item) => {
      this.setState({ userdata: item })
    })

    // GET BANK
    await GET('bank', {}, true).then(async (result) => {
      this.setState({ banks: result })
    }).catch(error => {
      console.log(error)
    })

    console.log(this.props.product)
  }

  async componentWillUnmount() {
    this._isMounted = false
  }

  async selectBank(item){
    await this.setState({bank_selected: item})
  }

  isValid() {
    return this.state.bank_selected == null || this.state.amount == null || this.state.norek == null
  }

  async next() {
    if(this.state.bank_selected == null || this.state.bank_selected == ''){
      this.refs.toast_error.show('Pilih Bank Tujuan Anda', 1000)
      return false
    }
    if(this.state.amount == null || this.state.amount == ''){
      this.refs.toast_error.show('Masukkan Nominal Transfer', 1000)
      return false
    }
    if(this.state.norek == null || this.state.norek == ''){
      this.refs.toast_error.show('Masukkan Nomor Rekening Bank', 1000)
      return false
    }

    await POST('check_minimal_tf', {
      user_id: this.state.userdata.id,
      amount: this.state.amount,
      transaction_type_id: this.props.product.id,
      product_id: 0,
      product_values_id: 0
    }, true).then(async (result) => {
      console.log(result)

      // GET BANK
      let request = {
        user_id: this.state.userdata.id,
        bank_id: this.state.bank_selected[0],
        req_amount: this.state.amount,
        admin: result.admin,
        markup: result.markup,
        sales_markup: result.sales_markup,
        amount: result.total,
        norek: this.state.norek,
        note: this.state.note,
        email: this.state.email
      }
      // console.log('REQUEST > '+JSON.stringify(request))
      
      this.state.banks.map(async (item, index) => {
        if(item.id == this.state.bank_selected[0]){
          await AsyncStorage.setItem('tf_bank_data', JSON.stringify(item))
        }
      })
      
      await AsyncStorage.setItem('tf_product_data', JSON.stringify(this.props.product))
      await AsyncStorage.setItem('tf_request_data', JSON.stringify(request))
      Actions.product_transfer_checkout()
    }).catch(error => {
      console.log(error)
      this.refs.toast_error.show(error.message, 1000)
    })
  }

	render() {
    const screenWidth = Math.round(Dimensions.get('window').width)
		return(
      <View style={styles.container}>

        <HeaderBack title={this.props.product.name} />

        <View style={styles.container_form}>
          <ScrollView scrollEnabled={true}>
            <View style={styles.boxInput}>
              <Form style={{marginBottom: 12}}>
                {
                  (this.state.banks.length > 1) ? 
                  <Item stackedLabel style={styles.formItem}>
                    <Label style={styles.labelForm}>Pilih Bank</Label>
                    <Select2
                      isSelectSingle
                      style={{ borderWidth: 0, paddingLeft: 0, marginTop: 5 }}
                      colorTheme={Colors.PRIMARY}
                      popupTitle="Pilih Bank"
                      title="Pilih Bank"
                      searchPlaceHolderText="Cari Bank"
                      listEmptyTitle="Data kosong"
                      cancelButtonText="Tutup"
                      selectButtonText="Pilih"
                      data={this.state.banks}
                      onSelect={data => {
                        this.selectBank(data)
                      }}
                      onRemoveItem={data => {
                        this.setState({ bank_selected: null })
                      }}
                    />
                  </Item>
                  : false
                }
                <Item stackedLabel style={styles.formItem}>
                  <Label style={styles.labelForm}>Nomor Rekening</Label>
                  <Input style={styles.inputFormValue} placeholder="Masukkan Nomor Rekening" placeholderTextColor="#A8A8A8" keyboardType="numeric" onChangeText = {(value) => this.setState({ norek: value })} />
                </Item>
                <Item stackedLabel style={styles.formItem}>
                  <Label style={styles.labelForm}>Nominal</Label>
                  <Input style={styles.inputFormValue} placeholder="Masukkan Nominal" placeholderTextColor="#A8A8A8" keyboardType="numeric" onChangeText = {(value) => this.setState({ amount: value })} />
                </Item>
                <Item stackedLabel style={styles.formItem}>
                  <Label style={styles.labelForm}>Catatan</Label>
                  <Input style={styles.inputFormValue} placeholder="Isi Catatan (Opsional)" placeholderTextColor="#A8A8A8" onChangeText = {(value) => this.setState({ note: value })} />
                </Item>
                <Item stackedLabel style={styles.formItem}>
                  <Label style={styles.labelForm}>Email</Label>
                  <Input style={styles.inputFormValue} placeholder="Isi Email (Opsional)" placeholderTextColor="#A8A8A8" keyboardType="email-address" onChangeText = {(value) => this.setState({ email: value })} />
                </Item>
              </Form>
            </View>
          </ScrollView>
        </View>

        {/* BOTTOM VIEW PREPAID */}
        {
          (this.state.amount > 0) ?
            <View style={styles.container_bottom}>
              <Grid>
                <Col size={8} style={{alignItems: "flex-start", justifyContent: "center"}}>
                  <Text style={styles.titleBlack}>Total Pembayaran</Text>
                  <Text style={styles.titlePrice}>Rp{formatPrice(this.state.amount)}</Text>
                </Col>
                <Col size={4} style={{alignItems: "flex-end", justifyContent: "center"}}>
                  <Button bordered success style={styles.buttomButton} disabled={this.isValid()} onPress={() => this.next()}>
                    <Text style={this.isValid() ? styles.titleButtonDisabled : styles.titleButton}>Lanjutkan</Text>
                  </Button>
                </Col>
              </Grid>
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
  titleBlack: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: '#333333',
    fontSize: 16,
    marginBottom: 5,
  },
  titlePrice: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: '#FF5C00',
    fontSize: 14,
  },
  titleButton: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: Colors.PRIMARY,
    fontSize: 16,
  },
  titleButtonDisabled: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: '#6a6a6a',
    fontSize: 16,
  },
  buttomButton: {
    borderRadius: 8,
    width: '100%',
    height: 42,
    justifyContent: "center"
  },
  container_form : {
    margin: 15,
  },
  container_bottom: {
    position: "absolute",
    bottom: 0,
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#BDBDBD',
    padding: 15,
    backgroundColor: '#FFF'
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
    fontSize: 16
  },
  labelItemActive: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: Colors.PRIMARY,
    fontSize: 16
  },
  labelItemSmall: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: '#000',
    fontSize: 12
  },
  labelItemSmallActive: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: Colors.PRIMARY,
    fontSize: 12
  },
  labelItemPrice: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: '#FF5C00',
    fontSize: 14
  },
  labelItemSmallPrice: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: '#FF5C00',
    fontSize: 12
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
