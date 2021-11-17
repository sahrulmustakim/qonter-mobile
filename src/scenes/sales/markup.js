import React, { Component } from 'react'
import { StyleSheet, AsyncStorage, StatusBar, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native'
import { Grid, Col, Form, Item, Input, Label, Icon } from 'native-base'
import { Actions } from 'react-native-router-flux'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import Toast from 'react-native-easy-toast'
import { Colors, Typography } from '_styles'
import HeaderBack from '_headers/back'
import Button from '_components/buttons'
import { getProfile, formatPrice } from '_utils/Global'
import { POST, GET } from '_services/ApiServices'
import Select2 from "react-native-select-two"

export default class Register extends Component {
  _isMounted = false

  constructor(props) {
    super(props)
  
    this.state = {
      nominal: 0,
      products: [],
      product: null,
      providers: [],
      provider: null,
      listdata: [],
      productvalue: null,
      itemRow: 2,
      userdata: null,
      provider_logo: null,
      tipe: [{
        id: 1,
        name: 'Global'
      },{
        id: 2,
        name: 'Spesifik'
      }],
      tipechoose: null,
    }
  }

  async componentDidMount() {
    this._isMounted = true

    // GET USER
    await getProfile().then((item) => {
      this.setState({ userdata: item })
    })

    await this.getProduct()
  }

  async getProduct() {
    await GET('menu', {}, true).then(async (result) => {
      // console.log(result)
      let listdata = []
      result.map((item, index) => {
        if(item.type != 'external'){
          listdata.push(item)
        }
      })
      this.setState({ products: listdata })
    }).catch(error => {
      console.log(error)
    })
  }

  async getProvider(id) {
    // console.log(id)
    await GET('product/'+id, {}, false).then(async (result) => {
      // console.log(result)
      this.setState({ providers: result })
    }).catch(error => {
      console.log(error)
    })
  }

  async getListdata(id) {
    await POST('product_val/', {
      user_id: this.state.userdata.id,
      product_val_id: id
    }, false).then(async (result) => {
      // console.log(result)
      await this.setState({ listdata: result })
    }).catch(error => {
      console.log(error)
    })
  }

  async showMarkup(item) {
    if(item[0] == 1){
      await POST('sales/markup', {
        sales_id: this.state.userdata.id,
        type: 'global'
      }, true).then(async (result) => {
        console.log(result)
        this.setState({ nominal: result })
      }).catch(error => {
        console.log(error)
      })
    }else if(item[0] == 2){
      // SPECIFIC
      this.setState({ nominal: 0 })
    }else{
      this.refs.toast_error.show('Silahkan pilih Tipe Markup', 1000)
    }
  }

  async showMarkup1(item) {
    if(item[0] != null){
      await POST('sales/markup', {
        sales_id: this.state.userdata.id,
        type: 'specific',
        transaction_type_id: item[0],
        product_id: null,
        product_values_id: null
      }, true).then(async (result) => {
        console.log(result)
        this.setState({ nominal: result })
      }).catch(error => {
        console.log(error)
      })
    }else{
      this.refs.toast_error.show('Silahkan pilih Product', 1000)
    }
  }

  async showMarkup2(item) {
    if(item[0] != null){
      await POST('sales/markup', {
        sales_id: this.state.userdata.id,
        type: 'specific',
        transaction_type_id: this.state.product,
        product_id: item[0],
        product_values_id: null
      }, true).then(async (result) => {
        console.log(result)
        this.setState({ nominal: result })
      }).catch(error => {
        console.log(error)
      })
    }else{
      this.refs.toast_error.show('Silahkan pilih Provider', 1000)
    }
  }

  async showMarkup3(item) {
    if(item[0] != null){
      await POST('sales/markup', {
        sales_id: this.state.userdata.id,
        type: 'specific',
        transaction_type_id: this.state.product,
        product_id: this.state.provider,
        product_values_id: item[0]
      }, true).then(async (result) => {
        console.log(result)
        this.setState({ nominal: result })
      }).catch(error => {
        console.log(error)
      })
    }else{
      this.refs.toast_error.show('Silahkan pilih Produk Item', 1000)
    }
  }

  async update() {
    if(this.state.tipechoose != null){
      if(this.state.tipechoose[0] == 1){
        if(this.state.nominal != null && this.state.nominal != '' && this.state.nominal != 0){
          await POST('sales/markup/edit', {
            sales_id: this.state.userdata.id,
            type: 'global',
            value: parseInt(this.state.nominal)
          }, true).then(async (result) => {
            console.log(result)
            this.refs.toast_success.show('Harga berhasil diubah', 1000)
          }).catch(error => {
            console.log(error)
            this.refs.toast_error.show(error.message, 1000)
          })
        }else{
          this.refs.toast_error.show('Silahkan isi Harga Markup', 1000)
        }
      }else if(this.state.tipechoose[0] == 2){
        if(this.state.nominal != null && this.state.nominal != '' && this.state.nominal != 0){
          let request = {
            sales_id: this.state.userdata.id,
            type: 'specific',
            transaction_type_id: this.state.product,
            product_id: this.state.provider,
            product_values_id: this.state.productvalue,
            value: parseInt(this.state.nominal)
          }
          console.log(request)
          await POST('sales/markup/edit', request, true).then(async (result) => {
            this.refs.toast_success.show('Harga berhasil diubah', 1000)
          }).catch(error => {
            this.refs.toast_error.show(error.message, 1000)
          })
        }else{
          this.refs.toast_error.show('Silahkan isi Harga Markup', 1000)
        }
      }
    }else{
      this.refs.toast_error.show('Silahkan pilih Tipe Markup', 1000)
    }
  }

  async changeNominal(value){
    if(value.length < 1){
      this.setState({nominal: 0})
    }else{
      this.setState({nominal: parseInt(value)})
    }
  }

	render() {
		return(
      <ScrollView style={styles.container} scrollEnabled={true}>

        <HeaderBack title="Markup" />
        
        <View style={styles.container_form}>
          <Form style={{marginBottom: 12}}>
            <Item stackedLabel style={styles.formItem}>
              <Label style={styles.labelForm}>Tipe</Label>
              <Select2
                isSelectSingle
                style={{ borderWidth: 0, paddingLeft: 0, marginTop: 5 }}
                colorTheme={Colors.PRIMARY}
                popupTitle="Pilih Tipe"
                title="Pilih Tipe"
                searchPlaceHolderText="Cari Tipe"
                listEmptyTitle="Data kosong"
                cancelButtonText="Tutup"
                selectButtonText="Pilih"
                data={this.state.tipe}
                onSelect={data => {
                  this.setState({ tipechoose: data })
                  this.showMarkup(data)
                }}
                onRemoveItem={data => {
                  this.setState({ tipechoose: null })
                }}
              />
            </Item>
            {
              (this.state.tipechoose != null && this.state.tipechoose[0] == 2) ? 
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
                    data={this.state.products}
                    onSelect={data => {
                      this.setState({ product: data[0] })
                      this.getProvider(data[0])
                      this.showMarkup1(data)
                    }}
                    onRemoveItem={data => {
                      this.setState({ product: null })
                      this.setState({ provider: null })
                      this.setState({ productvalue: null })
                    }}
                  />
                </Item>
              : false
            }
            {
              (this.state.tipechoose != null && this.state.tipechoose[0] == 2) ? 
                <Item stackedLabel style={styles.formItem}>
                  <Label style={styles.labelForm}>Provider</Label>
                  <Select2
                    isSelectSingle
                    style={{ borderWidth: 0, paddingLeft: 0, marginTop: 5 }}
                    colorTheme={Colors.PRIMARY}
                    popupTitle="Pilih Provider"
                    title="Pilih Provider"
                    searchPlaceHolderText="Cari Provider"
                    listEmptyTitle="Data kosong"
                    cancelButtonText="Tutup"
                    selectButtonText="Pilih"
                    data={this.state.providers}
                    onSelect={data => {
                      this.setState({ provider: data[0] })
                      this.getListdata(data[0])
                      this.showMarkup2(data)
                    }}
                    onRemoveItem={data => {
                      this.setState({ provider: null })
                      this.setState({ productvalue: null })
                    }}
                  />
                </Item>
              : false
            }
            {
              (this.state.tipechoose != null && this.state.tipechoose[0] == 2) ? 
                <Item stackedLabel style={styles.formItem}>
                  <Label style={styles.labelForm}>Produk Item</Label>
                  <Select2
                    isSelectSingle
                    style={{ borderWidth: 0, paddingLeft: 0, marginTop: 5 }}
                    colorTheme={Colors.PRIMARY}
                    popupTitle="Pilih Item"
                    title="Pilih Item"
                    searchPlaceHolderText="Cari Item"
                    listEmptyTitle="Data kosong"
                    cancelButtonText="Tutup"
                    selectButtonText="Pilih"
                    data={this.state.listdata}
                    onSelect={data => {
                      this.setState({ productvalue: data[0] })
                      this.showMarkup3(data)
                    }}
                    onRemoveItem={data => {
                      this.setState({ productvalue: null })
                    }}
                  />
                </Item>
              : false
            }
            {
              (this.state.tipechoose != null) ? 
                <Item stackedLabel style={styles.formItem}>
                  <Label style={styles.labelForm}>Harga Markup</Label>
                  <Input style={styles.inputForm} placeholder='Value Markup' keyboardType="number-pad" value={this.state.nominal.toString()} placeholderTextColor="#D1D1D1" onChangeText = {(value) => this.changeNominal(value)} />
                </Item>
              : false
            }
          </Form>

          <Button btnLabel='Update Harga' onPress={() => this.update()} />
        </View>

        <StatusBar backgroundColor={Colors.PRIMARY} barStyle={"light-content"} />
        <Toast ref="toast_error" style={{backgroundColor:Colors.ALERT, width: '90%'}} position='top' positionValue={35} />
        <Toast ref="toast_success" style={{backgroundColor:Colors.SUCCESS, width: '90%'}} position='top' positionValue={35} />
        {/* <KeyboardSpacer/> */}
      </ScrollView>	
    )
	}
}

const styles = StyleSheet.create({
  container : {
    flex: 1,
  },
  container_form : {
    marginTop: 5,
    marginLeft: 25,
    marginRight: 25
  },
  tab: {
    paddingTop: 8,
    paddingBottom: 12
  },
  tabActive: {
    paddingBottom: 12,
    borderBottomWidth: 3,
    borderBottomColor: Colors.PRIMARY
  },
  tabNotActive: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#CECECE'
  },
  titleActive : {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: Colors.PRIMARY,
    fontSize: 16,
    textAlign:'center',
  },
  titleNotActive : {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: '#C7C9CB',
    fontSize: 16,
    textAlign:'center',
  },
  formItem: {
    marginLeft: 0,
    marginBottom: 8
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
    paddingTop: 0,
    paddingLeft: 0,
    paddingBottom: 0,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontWeight: Typography.FONT_WEIGHT_REGULAR,
    fontSize: 16,
    width: '100%'
  }
});
