import React, { Component, useState } from 'react'
import { StyleSheet, AsyncStorage, StatusBar, Text, View, ScrollView, TouchableOpacity, Dimensions, Image } from 'react-native'
import { Grid, Col, Form, Item, Input, Label, Icon, Row } from 'native-base'
import { Actions } from 'react-native-router-flux'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import Toast from 'react-native-easy-toast'
import { Colors, Typography } from '_styles'
import HeaderBack from '_headers/back'
import { getProfile, formatPrice } from '_utils/Global'
import { POST, GET } from '_services/ApiServices'
import Select2 from "react-native-select-two"

export default class PriceList extends Component {
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
      itemRow: 2,
      userdata: null,
      provider_logo: null
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
        if(item.type == 'prepaid'){
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
    // console.log(this.state.product)
    await POST('product_val/', {
      user_id: this.state.userdata.id,
      product_val_id: id
    }, false).then(async (result) => {
      // console.log(result)
      // console.log(this.state.provider)
      if(this.state.product == '32'){
        if(this.state.provider == '15'){
          await this.setState({ provider_logo: require('_assets/images/icon-axis.png') })
        }else if(this.state.provider == '17'){
          await this.setState({ provider_logo: require('_assets/images/icon-ceria.png') })
        }else if(this.state.provider == '24'){
          await this.setState({ provider_logo: require('_assets/images/icon-indosat.png') })
        }else if(this.state.provider == '31'){
          await this.setState({ provider_logo: require('_assets/images/icon-smartfren.png') })
        }else if(this.state.provider == '33'){
          await this.setState({ provider_logo: require('_assets/images/icon-three.png') })
        }else if(this.state.provider == '38'){
          await this.setState({ provider_logo: require('_assets/images/icon-telkomsel.png') })
        }else if(this.state.provider == '66'){
          await this.setState({ provider_logo: require('_assets/images/icon-xl.png') })
        }else{
          await this.setState({ provider_logo: require('_assets/images/dbcurrency.png') })
        }
      }else{
        if(this.state.provider == '4'){
          await this.setState({ provider_logo: require('_assets/images/icon-axis.png') })
        }else if(this.state.provider == '35'){
          await this.setState({ provider_logo: require('_assets/images/icon-indosat.png') })
        }else if(this.state.provider == '54'){
          await this.setState({ provider_logo: require('_assets/images/icon-smartfren.png') })
        }else if(this.state.provider == '60'){
          await this.setState({ provider_logo: require('_assets/images/icon-three.png') })
        }else if(this.state.provider == '61'){
          await this.setState({ provider_logo: require('_assets/images/icon-telkomsel.png') })
        }else if(this.state.provider == '67'){
          await this.setState({ provider_logo: require('_assets/images/icon-xl.png') })
        }else{
          await this.setState({ provider_logo: require('_assets/images/dbcurrency.png') })
        }
      }
      await this.setState({ listdata: result })
    }).catch(error => {
      console.log(error)
    })
  }

	render() {
		return(
      <View style={styles.container}>

        <HeaderBack title="Daftar Produk" />
        
        <ScrollView style={styles.container} scrollEnabled={true}>
          <View style={styles.container_form}>
            <View style={styles.boxInput}>
              <Form style={{marginBottom: 12}}>
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
                    }}
                    onRemoveItem={data => {
                      this.setState({ product: null })
                      this.setState({ provider: null })
                    }}
                  />
                </Item>
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
                    }}
                    onRemoveItem={data => {
                      this.setState({ provider: null })
                    }}
                  />
                </Item>
              </Form>
            </View>
            
            <Grid>
              <Row style={{borderBottomWidth: 1, borderBottomColor: '#F1F3F6', marginBottom: 5, marginTop: 15}}>
                <Col>
                  <Text style={[styles.titleBoldGreen, {paddingBottom: 5}]}>Daftar Harga</Text>
                </Col>
              </Row>
              { this.state.listdata.map((item, key) => {
                return (
                  <Row key={key} style={{borderBottomWidth: 1, borderBottomColor: '#F1F3F6', marginBottom: 5}}>
                    <Col size={2} style={{justifyContent: "flex-start", alignItems: "center"}}>
                      <Image style={{ width: 36, height: 36, resizeMode: "contain" }} source={this.state.provider_logo} />
                    </Col>
                    <Col size={7} style={{justifyContent: "center", paddingBottom: 5}}>
                      <Text style={[styles.title]}>{item.name}</Text>
                    </Col>
                    <Col size={3} style={{justifyContent: "center", alignItems: "flex-end"}}>
                      <Text style={[styles.titleBoldBlack]}>Rp{formatPrice(parseInt(item.price)+parseInt(item.sales_markup)+parseInt(item.price_markup))}</Text>
                    </Col>
                  </Row>
                );
              })} 
            </Grid>
          </View>
        </ScrollView>
        
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
