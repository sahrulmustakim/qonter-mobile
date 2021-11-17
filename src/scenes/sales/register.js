import React, { Component } from 'react'
import { StyleSheet, AsyncStorage, StatusBar, Text, View, ScrollView, TouchableOpacity } from 'react-native'
import { Grid, Col, Form, Item, Input, Label, Icon } from 'native-base'
import { Actions } from 'react-native-router-flux'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import Toast from 'react-native-easy-toast'
import { Colors, Typography } from '_styles'
import HeaderBack from '_headers/back'
import Button from '_components/buttons'
import Select2 from "react-native-select-two"
import { POST, GET } from '_services/ApiServices'
import { validateInput, getProfile } from '_utils/Global'

export default class Register extends Component {
  _isMounted = false

  constructor(props) {
    super(props)
  
    this.state = {
      // Form Data
      form_name: null,
      form_email: null,
      form_address: null,
      form_province: null,
      form_city: null,
      form_district: null,
      form_phone: null,
      form_referal: null,

      // Master Data
      provinces: [],
      cities: [],
      districts: [],

      userdata: null
    }
  }

  async componentDidMount() {
    this._isMounted = true
    await this.getProvinces()

    // GET USER
    await getProfile().then((item) => {
      this.setState({ userdata: item })
      this.setState({ form_referal: item.referal_code })
    })
  }

  async getProvinces() {
    await GET('provinces', {}, false).then(async (result) => {
      // console.log(result)
      this.setState({ provinces: result })
    }).catch(error => {
      console.log(error)
    })
  }

  async getCities(id) {
    await GET('cities/'+id, {}, false).then(async (result) => {
      // console.log(result)
      this.setState({ cities: result })
    }).catch(error => {
      console.log(error)
    })
  }

  async getDistrict(id) {
    await GET('disctricts/'+id, {}, false).then(async (result) => {
      // console.log(result)
      this.setState({ districts: result })
    }).catch(error => {
      console.log(error)
    })
  }

  async next() {
    var validate = {}
    validate = validateInput(this.state.form_name, 'required', 'Nama Pemilik')
    if(!validate.status){
      this.refs.toast_error.show(validate.message, 1000)
      return false
    }
    validate = validateInput(this.state.form_email, 'email', 'Email')
    if(!validate.status){
      this.refs.toast_error.show(validate.message, 1000)
      return false
    }
    validate = validateInput(this.state.form_address, 'required', 'Alamat')
    if(!validate.status){
      this.refs.toast_error.show(validate.message, 1000)
      return false
    }
    validate = validateInput(this.state.form_province, 'required', 'Provinsi')
    if(!validate.status){
      this.refs.toast_error.show(validate.message, 1000)
      return false
    }
    validate = validateInput(this.state.form_city, 'required', 'Kota/Kabupaten')
    if(!validate.status){
      this.refs.toast_error.show(validate.message, 1000)
      return false
    }
    validate = validateInput(this.state.form_district, 'required', 'Kecamatan')
    if(!validate.status){
      this.refs.toast_error.show(validate.message, 1000)
      return false
    }
    validate = validateInput(this.state.form_phone, 'required', 'Nomor Handphone')
    if(!validate.status){
      this.refs.toast_error.show(validate.message, 1000)
      return false
    }
    // validate = validateInput(this.state.form_referal, 'required', 'Kode Referal')
    // if(!validate.status){
    //   this.refs.toast_error.show(validate.message, 1000)
    //   return false
    // }

    var signup_data = this.state
    await AsyncStorage.setItem('signup_data', JSON.stringify(signup_data))
    Actions.sales_photo()
  }

	render() {
		return(
      <ScrollView style={styles.container} scrollEnabled={true}>

        <HeaderBack title="Daftar Konter" />
        
        <View style={styles.container_form}>
          <Grid style={styles.tab}>
            <Col style={styles.tabActive}>
              <Text style={styles.titleActive}>Profil Konter</Text>
            </Col>
            <Col style={styles.tabNotActive}>
              <Text style={styles.titleNotActive}>Foto</Text>
            </Col>
          </Grid>

          <Form style={{marginBottom: 12}}>
            <Item stackedLabel style={styles.formItem}>
              <Label style={styles.labelForm}>Nama Pemilik</Label>
              <Input style={styles.inputForm} placeholder='Masukkan Nama Pemilik' placeholderTextColor="#D1D1D1" onChangeText = {(value) => this.setState({form_name: value})} />
            </Item>
            <Item stackedLabel style={styles.formItem}>
              <Label style={styles.labelForm}>Email</Label>
              <Input style={styles.inputForm} placeholder='Masukkan Email' placeholderTextColor="#D1D1D1" onChangeText = {(value) => this.setState({form_email: value})} />
            </Item>
            <Item stackedLabel style={styles.formItem}>
              <Label style={styles.labelForm}>Alamat</Label>
              <Input style={styles.inputForm} placeholder='Masukkan Alamat' placeholderTextColor="#D1D1D1" onChangeText = {(value) => this.setState({form_address: value})} />
            </Item>
            <Item stackedLabel style={styles.formItem}>
              <Label style={styles.labelForm}>Provinsi</Label>
              <Select2
                isSelectSingle
                style={{ borderWidth: 0, paddingLeft: 0, marginTop: 5 }}
                colorTheme={Colors.PRIMARY}
                popupTitle="Pilih Provinsi"
                title="Pilih Provinsi"
                searchPlaceHolderText="Cari Provinsi"
                listEmptyTitle="Data kosong"
                cancelButtonText="Tutup"
                selectButtonText="Pilih"
                data={this.state.provinces}
                onSelect={data => {
                  this.setState({ form_province: data })
                  this.getCities(data)
                }}
                onRemoveItem={data => {
                  this.setState({ form_province: null })
                  this.setState({ form_city: null })
                  this.setState({ cities: [] })
                  this.setState({ form_district: null })
                  this.setState({ districts: [] })
                }}
              />
            </Item>
            <Item stackedLabel style={styles.formItem}>
              <Label style={styles.labelForm}>Kabupaten/Kota</Label>
              <Select2
                isSelectSingle
                style={{ borderWidth: 0, paddingLeft: 0, marginTop: 5 }}
                colorTheme={Colors.PRIMARY}
                popupTitle="Pilih Kabupaten/Kota"
                title="Pilih Kabupaten/Kota"
                searchPlaceHolderText="Cari Kabupaten/Kota"
                listEmptyTitle="Data kosong"
                cancelButtonText="Tutup"
                selectButtonText="Pilih"
                data={this.state.cities}
                onSelect={data => {
                  this.setState({ form_city: data })
                  this.getDistrict(data)
                }}
                onRemoveItem={data => {
                  this.setState({ form_city: null })
                  this.setState({ form_district: null })
                  this.setState({ districts: [] })
                }}
              />
            </Item>
            <Item stackedLabel style={styles.formItem}>
              <Label style={styles.labelForm}>Kecamatan</Label>
              <Select2
                isSelectSingle
                style={{ borderWidth: 0, paddingLeft: 0, marginTop: 5 }}
                colorTheme={Colors.PRIMARY}
                popupTitle="Pilih Kecamatan"
                title="Pilih Kecamatan"
                searchPlaceHolderText="Cari Kecamatan"
                listEmptyTitle="Data kosong"
                cancelButtonText="Tutup"
                selectButtonText="Pilih"
                data={this.state.districts}
                onSelect={data => {
                  this.setState({ form_district: data })
                }}
                onRemoveItem={data => {
                  this.setState({ form_district: null })
                }}
              />
            </Item>
            <Item stackedLabel style={styles.formItem}>
              <Label style={styles.labelForm}>Nomor Handphone</Label>
              <Label style={styles.labelFormWarning}>Nomor yang dimasukkan akan digunakan untuk login</Label>
              
              <Input style={styles.inputForm} keyboardType="phone-pad" placeholder='Masukkan Nomor Handphone' placeholderTextColor="#D1D1D1" onChangeText = {(value) => this.setState({form_phone: value})} />
            </Item>
            <Item stackedLabel style={styles.formItem}>
              <Label style={styles.labelForm}>Kode Referal Sales</Label>
              <Input style={styles.inputForm} placeholder='Masukkan Kode Referal' value={this.state.form_referal} placeholderTextColor="#D1D1D1" onChangeText = {(value) => this.setState({form_referal: value})} disabled={true} />
            </Item>
          </Form>

          <Button btnLabel='Selanjutnya' onPress={() => this.next()} />
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
