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
      request: null,
      items: [],
      itemRow: 1,
      item_selected: null,
      telkomsel: ['0811','0812','0813','0821','0822','0852','0853','0823','0851'],
      indosat: ['0814','0815','0816','0855','0856','0857','0858'],
      xl: ['0817','0818','0819','0859','0877','0878'],
      axis: ['0838','0831','0832','0833'],
      three: ['0895','0896','0897','0898','0899'],
      smartfren: ['0881','0882','0883','0884','0885','0886','0887','0888','0889'],
      ceria: ['0828'],
      provider: require('../../assets/images/icon-contact.png'),
      operator: null,
      operator_name: null,
      nominal: 0,

      // POSTPAID
      product_values: [],
      product_value: null,
      selected: null
    }
  }

  async componentDidMount() {
    this._isMounted = true
    
    // GET USER
    await getProfile().then((item) => {
      this.setState({ userdata: item })
    })

    // GET PRODUCT VALUES
    await GET('product/'+this.props.product.id, {}, true).then(async (result) => {
      await this.setState({ product_values: result })
      if(result.length == 1){
        await this.setState({ product_value: result[0] })
        this.productPreValues()
      }
    }).catch(error => {
      console.log(error)
    })

    console.log(this.state.userdata)
  }

  async productPreValues(){
    if(this.state.product_value != null){
      await POST('product_val', {
        user_id: this.state.userdata.id,
        product_val_id: this.state.product_value.id,
        transaction_type_id: this.props.product.id
      }, true).then(async (result) => {
        // console.log(result)
        this.setState({ items: result })
        if(result.length == 1){
          await this.setState({ item_selected: result[0] })
        }
      }).catch(error => {
        console.log(error)
      })
    }
  }

  async componentWillUnmount() {
    this._isMounted = false

    // DEFAULT VALUES
    await this.setState({ provider: require('../../assets/images/icon-contact.png') })
    await this.setState({ operator: null })
    await this.setState({ operator_name: null })
    await this.setState({ items: [] })
    await this.setState({ nominal: 0 })
    await this.setState({ item_selected: null })
  }

  search(nameKey, myArray){
    for (var i=0; i < myArray.length; i++) {
      if (myArray[i].name.toLowerCase() === nameKey.toLowerCase()) {
        return myArray[i];
      }
    }
  }

  async provider(value) {
    
    await this.setState({ request: value })

    if(this.state.request.length < 4){
      await this.setState({ provider: require('../../assets/images/icon-contact.png') })
      await this.setState({ operator: null })
      await this.setState({ operator_name: null })
      await this.setState({ items: [] })
      await this.setState({ nominal: 0 })
      await this.setState({ item_selected: null })
    }

    if(this.state.request.length == 4){
      this.state.telkomsel.map(async (item, index) => {
        if(this.state.request == item){
          await this.setState({ provider: require('../../assets/images/icon-telkomsel.png') })
          await this.setState({ operator_name: 'Telkomsel' })
          const operator = this.search('telkomsel', this.state.product_values)
          await this.setState({ operator: operator.id })
          await this.setState({ product_value: operator })
          this.productValues()
        }
      })
      
      this.state.indosat.map(async (item, index) => {
        if(this.state.request == item){
          await this.setState({ provider: require('../../assets/images/icon-indosat.png') })
          await this.setState({ operator_name: 'Indosat' })
          const operator = this.search('indosat', this.state.product_values)
          await this.setState({ operator: operator.id })
          await this.setState({ product_value: operator })
          this.productValues()
        }
      })
      
      this.state.xl.map(async (item, index) => {
        if(this.state.request == item){
          await this.setState({ provider: require('../../assets/images/icon-xl.png') })
          await this.setState({ operator_name: 'XL' })
          const operator = this.search('xl', this.state.product_values)
          await this.setState({ operator: operator.id })
          await this.setState({ product_value: operator })
          this.productValues()
        }
      })
      
      this.state.axis.map(async (item, index) => {
        if(this.state.request == item){
          await this.setState({ provider: require('../../assets/images/icon-axis.png') })
          await this.setState({ operator_name: 'AXIS' })
          const operator = this.search('axis', this.state.product_values)
          await this.setState({ operator: operator.id })
          await this.setState({ product_value: operator })
          this.productValues()
        }
      })
      
      this.state.three.map(async (item, index) => {
        if(this.state.request == item){
          await this.setState({ provider: require('../../assets/images/icon-three.png') })
          await this.setState({ operator_name: 'Tri' })
          const operator = this.search('tri', this.state.product_values)
          await this.setState({ operator: operator.id })
          await this.setState({ product_value: operator })
          this.productValues()
        }
      })
      
      this.state.smartfren.map(async (item, index) => {
        if(this.state.request == item){
          await this.setState({ provider: require('../../assets/images/icon-smartfren.png') })
          await this.setState({ operator_name: 'Smart' })
          const operator = this.search('smart', this.state.product_values)
          await this.setState({ operator: operator.id })
          await this.setState({ product_value: operator })
          this.productValues()
        }
      })
      
      this.state.ceria.map(async (item, index) => {
        if(this.state.request == item){
          await this.setState({ provider: require('../../assets/images/icon-ceria.png') })
          await this.setState({ operator_name: 'Ceria' })
          const operator = this.search('ceria', this.state.product_values)
          await this.setState({ operator: operator.id })
          await this.setState({ product_value: operator })
          this.productValues()
        }
      })
    }
  }

  async productValues(){
    await POST('product_val', {
      user_id: this.state.userdata.id,
      product_val_id: this.state.operator
    }, true).then(async (result) => {
      console.log(result)
      this.setState({ items: result })
    }).catch(error => {
      console.log(error)
    })
  }

  async selectValue(value){
    await this.setState({nominal: parseInt(parseInt(value.price)+parseInt(value.price_markup)+parseInt(value.sales_markup))})
    await this.setState({item_selected: value})
  }

  displayItems() {
    let arr = this.state.items.reduce((acc, item, idx) => {
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
              <Col key={index} style={(this.state.item_selected != null && this.state.item_selected.id == value.id) ? styles.boxItemActive : styles.boxItem}>
                <TouchableOpacity style={{alignItems: "center", alignContent: "center"}} onPress={() => this.selectValue(value)}>
                  <Grid>
                    <Col size={2} style={{alignItems: "center", padding: 5, justifyContent: "center"}}>
                      <Image style={{ width: 34, height: 34, resizeMode: "contain" }} source={require('../../assets/images/dbcurrency.png')} />
                    </Col>
                    {
                      (this.props.product.type == 'prepaid') ? 
                      <Col size={18} style={{justifyContent: "center"}}>
                        <Text style={(this.state.item_selected != null && this.state.item_selected.id == value.id) ? styles.labelItemActive : styles.labelItem}>
                          {value.name}
                        </Text>
                        <Text style={(this.state.item_selected != null && this.state.item_selected.id == value.id) ? styles.labelDescActive : styles.labelDesc}>
                          {value.description}
                        </Text>
                        <Text style={styles.labelItemPrice}>Rp{formatPrice(parseInt(value.price)+parseInt(value.price_markup)+parseInt(value.sales_markup))}</Text>
                      </Col>
                      : 
                      <Col size={8} style={{justifyContent: "center"}}>
                        <Text style={(this.state.item_selected != null && this.state.item_selected.id == value.id) ? styles.labelItemActive : styles.labelItem}>
                          {(typeof this.state.product_value.operator !== 'undefined' && this.state.product_value.operator == 'prepaid' && this.props.product.id == '34') ? 'Token '+formatPrice(value.name) : value.name}
                        </Text>
                        <Text style={styles.labelItemPrice}>Rp{formatPrice(parseInt(value.price)+parseInt(value.price_markup)+parseInt(value.sales_markup))}</Text>
                      </Col>
                    }
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

  isValid() {
    return this.state.request == null || this.state.request.length < 7 || this.state.nominal <= 0 || this.state.nominal == null
  }

  async selectProduct(data){
    this.state.product_values.map(async (item, index) => {
      if(item.id == data[0]){
        await this.setState({ product_value: item })
        this.productPreValues()
      }
    })
  }

  async next() {
    if(this.state.request == null || this.state.request == ''){
      this.refs.toast_error.show('Masukkan Nomor Pelanggan', 1000)
    }

    let request_data = {
      transaction_type: this.props.product,
      product: this.state.product_value,
      product_value: this.state.item_selected,
      request: this.state.request
    }

    if(this.state.product_value.inquiry == 'yes'){
      const reqData = {
        third_party_id: this.state.product_value.third_party_id,
        product_id: this.state.product_value.id,
        uniq_code: this.state.item_selected.uniq_code,
        customer_no: this.state.request
      }
      // console.log(reqData)
      await POST('check/inquiry', reqData, true).then(async (result) => {
        console.log(result)
        await AsyncStorage.setItem('request_data', JSON.stringify(request_data))
        await AsyncStorage.setItem('postpaid_data', JSON.stringify(result))
        Actions.product_checkout()
      }).catch(error => {
        console.log(error)
        this.refs.toast_error.show('Nomor Pelanggan tidak di temukan', 1000)
      })
    }else{
      await AsyncStorage.setItem('request_data', JSON.stringify(request_data))
      Actions.product_checkout()
    }
  }

  async nextPostpaid() {
    if(this.state.product_value == null){
      this.refs.toast_error.show('Silahkan Pilih Produk', 1000)
      return false
    }

    if(this.state.request == null){
      this.refs.toast_error.show('Masukkan Nomor Pelanggan', 1000)
      return false
    }

    let postReq = {
      users_id: this.state.userdata.id,
      third_party_id: this.state.product_value.third_party_id,
      customer_no: this.state.request,
      uniq_code: this.state.item_selected.uniq_code,
      transaction_type_id: this.props.product.id,
      product_id: this.state.product_value.id,
      product_value_id: this.state.item_selected.id
    }
    console.log(postReq)
    await POST('check/postpaid', postReq, true).then(async (result) => {
      console.log(result)
      if(typeof result.selling_price !== 'undefined'){
        let request_data = {
          transaction_type: this.props.product,
          product: this.state.product_value,
          product_value: this.state.item_selected,
          request: this.state.request
        }
        await AsyncStorage.setItem('request_data', JSON.stringify(request_data))
        await AsyncStorage.setItem('postpaid_data', JSON.stringify(result))
        Actions.product_checkout()
      }else{
        this.refs.toast_error.show(result.message, 1000)
      }
    }).catch(error => {
      console.log(error)
      this.refs.toast_error.show('Nomor Pelanggan tidak di temukan', 1000)
    })
  }

	render() {
    const screenWidth = Math.round(Dimensions.get('window').width)
		return(
      <View style={styles.container}>

        <HeaderBack title={this.props.product.name} />
        
        {
          // PRABAYAR INPUT
          (this.props.product.type == 'prepaid' && this.props.product.view == 'input') ?
            <View style={styles.container_form}>
              <ScrollView scrollEnabled={true}>
                <View style={styles.boxInput}>
                  <Form style={{marginBottom: 12}}>
                    <Item stackedLabel style={styles.formItem}>
                      <Label style={styles.labelForm}>Masukkan Nomor</Label>
                      <Input style={styles.inputFormValue} placeholder="Masukkan Nomor" placeholderTextColor="#A8A8A8" keyboardType="numeric" onChangeText = {(value) => this.provider(value)} />
                    </Item>
                  </Form>
                  { (this.state.provider != null) ? <Image style={{ width: 100, height: 25, resizeMode: "contain", position: "absolute", right: 0, top: 38 }} source={this.state.provider} /> : false }
                </View>
                {
                  (this.state.items.length > 0) ? 
                    <Text style={styles.title}>Pilih Item</Text>  
                  : false
                }
                
                <Grid style={{marginBottom: 120}}>
                  {this.displayItems()}
                </Grid>
              </ScrollView>
            </View>
          : false 
        }

        {
          // PRABAYAR OPTION
          (this.props.product.type == 'prepaid' && this.props.product.view == 'option') ?
            <View style={styles.container_form}>
              <ScrollView scrollEnabled={true}>
                <View style={styles.boxInput}>
                  <Form style={{marginBottom: 12}}>
                    {
                      (this.state.product_values.length > 1) ? 
                      <Item stackedLabel style={styles.formItem}>
                        <Label style={styles.labelForm}>Produk</Label>
                        <Select2
                          isSelectSingle
                          style={{ borderWidth: 0, paddingLeft: 0, marginTop: 5 }}
                          colorTheme={Colors.PRIMARY}
                          popupTitle="Pilih Produk"
                          title="Pilih Produk"
                          searchPlaceHolderText="Cari Produk"
                          listEmptyTitle="Data kosong"
                          cancelButtonText="Tutup"
                          selectButtonText="Pilih"
                          data={this.state.product_values}
                          onSelect={data => {
                            this.selectProduct(data)
                          }}
                          onRemoveItem={data => {
                            this.setState({ product_value: null })
                          }}
                        />
                      </Item>
                      : false
                    }
                    <Item stackedLabel style={styles.formItem}>
                      <Label style={styles.labelForm}>Masukkan Nomor</Label>
                      <Input style={styles.inputFormValue} placeholder="Masukkan Nomor" placeholderTextColor="#A8A8A8" keyboardType="numeric" onChangeText = {(value) => this.setState({ request: value })} />
                    </Item>
                    {
                      (this.state.request == null || this.state.request.length < 7) ? 
                      <Label style={[styles.labelForm, { color: '#FF5C00', paddingLeft: 15 }]}>Nomor Pelanggan minimal 7 karakter</Label>
                      : false
                    }
                  </Form>
                </View>
                {
                  (this.state.items.length > 0) ? 
                    <Text style={styles.title}>Pilih Item</Text>  
                  : false
                }
                
                <Grid style={{marginBottom: 120}}>
                  {this.displayItems()}
                </Grid>
              </ScrollView>
            </View>
          : false 
        }

        {/* POSTPAID */}
        {
          (this.props.product.type == 'postpaid') ? 
          <View style={styles.container_form}>
            <ScrollView scrollEnabled={true}>
              <View style={styles.boxInput}>
                <Form style={{marginBottom: 12}}>
                  {
                    (this.state.product_values.length > 1) ? 
                    <Item stackedLabel style={styles.formItem}>
                      <Label style={styles.labelForm}>Produk</Label>
                      <Select2
                        isSelectSingle
                        style={{ borderWidth: 0, paddingLeft: 0, marginTop: 5 }}
                        colorTheme={Colors.PRIMARY}
                        popupTitle="Pilih Produk"
                        title="Pilih Produk"
                        searchPlaceHolderText="Cari Produk"
                        listEmptyTitle="Data kosong"
                        cancelButtonText="Tutup"
                        selectButtonText="Pilih"
                        data={this.state.product_values}
                        onSelect={data => {
                          this.selectProduct(data)
                        }}
                        onRemoveItem={data => {
                          this.setState({ product_value: null })
                        }}
                      />
                    </Item>
                    : false
                  }
                  <Item stackedLabel style={styles.formItem}>
                    <Label style={styles.labelForm}>Nomor Pelanggan</Label>
                    <Input style={styles.inputFormValue} placeholder="Masukkan Nomor" placeholderTextColor="#A8A8A8" keyboardType="numeric" onChangeText = {(value) => this.setState({ request: value })} />
                  </Item>
                  {
                    (this.state.request == null || this.state.request.length < 7) ? 
                    <Label style={[styles.labelForm, { color: '#FF5C00', paddingLeft: 15 }]}>Nomor Pelanggan minimal 7 karakter</Label>
                    : false
                  }
                </Form>
              </View>
              {
                (this.state.product_value != null && this.state.items.length > 1) ? 
                  <Text style={styles.title}>Pilih Nominal</Text>
                : false
              }
              {
                (this.state.product_value != null && this.state.items.length > 1) ? 
                  <Grid style={{marginBottom: 120}}>
                    {this.displayItems()}
                  </Grid>
                : false
              }
            </ScrollView>
          </View>
          : false
        }

        {/* BOTTOM VIEW PREPAID */}
        {
          (this.props.product.type == 'prepaid') ?
            <View style={styles.container_bottom}>
              <Grid>
                <Col size={8} style={{alignItems: "flex-start", justifyContent: "center"}}>
                  <Text style={styles.titleBlack}>Total Pembayaran</Text>
                  <Text style={styles.titlePrice}>Rp{formatPrice(this.state.nominal)}</Text>
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

        {/* BOTTOM VIEW POSTPAID */}
        {
          (this.props.product.type == 'postpaid') ? 
            <View style={styles.container_bottom}>
              <Grid>
                <Col size={12} style={{alignItems: "flex-end", justifyContent: "center"}}>
                  <Button bordered success style={styles.buttomButton} onPress={() => this.nextPostpaid()}>
                    <Text style={styles.titleButton}>Lanjutkan</Text>
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
  labelDesc: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: '#3b3b3b',
    fontSize: 12
  },
  labelDescActive: {
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
