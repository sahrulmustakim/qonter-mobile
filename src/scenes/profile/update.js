import React, { Component } from 'react'
import { StyleSheet, AsyncStorage, StatusBar, Text, View, ScrollView, TouchableOpacity } from 'react-native'
import { Grid, Col, Form, Item, Input, Label, Icon } from 'native-base'
import { Actions } from 'react-native-router-flux'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import Toast from 'react-native-easy-toast'
import { Colors, Typography } from '../../styles'
import HeaderBack from '../../components/headers/back'
import Button from '../../components/buttons'
import Select2 from "react-native-select-two"
import Moment from 'moment'
import { POST, GET } from '../../services/ApiServices'
import { getProfile, formatPrice, validateInput } from '../../utils/Global'

export default class Register extends Component {
  _isMounted = false

  constructor(props) {
    super(props)
  
    this.state = {
      // Profil Data
      profile: null,

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
    }
  }

  async componentDidMount() {
    this._isMounted = true

    // GET USER
    await getProfile().then(async (item) => {
      this.setState({ userdata: item })
      this.setState({ form_name: item.name })
      this.setState({ form_address: item.address })
      this.setState({ form_province: item.province_id })
      this.setState({ form_city: item.city_id })
      this.setState({ form_district: item.disctrict_id })
      // console.log(item)
      await this.getProvinces(item.province_id)
    })

    // PROFILE
    await POST('profile', {
      id: this.state.userdata.id
    }, true).then(async (result) => {
      this.setState({ profile: result })
    }).catch(error => {
      console.log(error)
    })
  }

  async getProvinces(selected = null) {
    await GET('provinces', {}, false).then(async (result) => {
      // console.log(result)
      let listdata = []
      result.forEach(item => {
        if(item.id == selected){
          listdata.push({
            id: item.id,
            name: item.name,
            checked: true
          })
        }else{
          listdata.push({
            id: item.id,
            name: item.name
          })
        }
      })
      await this.setState({ provinces: listdata })
      await this.getCities(selected, this.state.userdata.city_id)
    }).catch(error => {
      console.log(error)
    })
  }

  async getCities(id, selected = null) {
    await GET('cities/'+id, {}, false).then(async (result) => {
      // console.log(result)
      let listdata = []
      result.forEach(item => {
        if(item.id == selected){
          listdata.push({
            id: item.id,
            name: item.name,
            checked: true
          })
        }else{
          listdata.push({
            id: item.id,
            name: item.name
          })
        }
      })
      await this.setState({ cities: listdata })
      if(selected != null){
        await this.getDistrict(selected, this.state.userdata.disctrict_id)
      }else{
        await this.setState({ districts: [] })
      }
    }).catch(error => {
      console.log(error)
    })
  }

  async getDistrict(id, selected = null) {
    await GET('disctricts/'+id, {}, false).then(async (result) => {
      // console.log(result)
      let listdata = []
      result.forEach(item => {
        if(item.id == selected){
          listdata.push({
            id: item.id,
            name: item.name,
            checked: true
          })
        }else{
          listdata.push({
            id: item.id,
            name: item.name
          })
        }
      })
      await this.setState({ districts: listdata })
    }).catch(error => {
      console.log(error)
    })
  }

  async update() {
    var validate = {}
    validate = validateInput(this.state.form_name, 'required', 'Nama Pemilik')
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

    // UPDATE PROFILE
    await POST('update/profile', {
      id: this.state.userdata.id,
      name: this.state.form_name,
      address: this.state.form_address,
      province_id: (this.state.form_province.length > 0) ? this.state.form_province[0] : this.state.form_province,
      city_id: (this.state.form_city.length > 0) ? this.state.form_city[0] : this.state.form_city,
      disctrict_id: (this.state.form_district.length > 0) ? this.state.form_district[0] : this.state.form_district
    }, true).then(async (result) => {
      this.refs.toast_success.show('Profil berhasil di perbarui', 2000)
      await AsyncStorage.setItem('userdata', JSON.stringify(result.data))
      setTimeout(async () => {
        await Actions.reset('menus')
      }, 2000)
    }).catch(error => {
      console.log(error)
    })
  }

	render() {
		return(
      <ScrollView style={styles.container} scrollEnabled={true}>

        <HeaderBack title="Update Profile" />
        
        <View style={styles.container_form}>
          <Form style={{marginBottom: 12}}>
            <Item stackedLabel style={styles.formItem}>
              <Label style={styles.labelForm}>Nama Pemilik</Label>
              <Input style={styles.inputForm} placeholder='Masukkan Nama Pemilik' placeholderTextColor="#D1D1D1" value={this.state.form_name} onChangeText = {(value) => this.setState({form_name: value})} />
            </Item>
            <Item stackedLabel style={styles.formItem}>
              <Label style={styles.labelForm}>Alamat</Label>
              <Input style={styles.inputForm} placeholder='Masukkan Alamat' placeholderTextColor="#D1D1D1" value={this.state.form_address} onChangeText = {(value) => this.setState({form_address: value})} />
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
          </Form>

          <Button btnLabel='Simpan' onPress={() => this.update()} />
          <View style={{marginTop: 15}}>
            <Button btnLabel='Ubah Email / Nomor Telepon' onPress={() => Actions.update_email()} />
          </View>
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
