import React, { Component } from 'react'
import { StyleSheet, AsyncStorage, StatusBar, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native'
import { Grid, Col, Form, Item, Input, Label, Icon } from 'native-base'
import { Actions } from 'react-native-router-flux'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import Toast from 'react-native-easy-toast'
import { Colors, Typography } from '_styles'
import HeaderBack from '_headers/back'
import Button from '_components/buttons'
import ImagePicker from 'react-native-image-picker'
import RNFetchBlob from 'rn-fetch-blob'
import { server_api } from '_configs/env'
import { POST, GET } from '_services/ApiServices'

export default class Register extends Component {
  _isMounted = false

  constructor(props) {
    super(props)
  
    this.state = {
      form_name: 'Nama Lengkap',
      form_address: 'Alamat Lengkap',
      form_province: 'Provinsi',
      form_city: 'Kota',
      form_district: 'Kecamatan',
      form_phone: 'Phone Number',
      photo: { uri: null },
      change_photo: false,
      form_province_id: null,
      form_city_id: null,
      form_district_id: null,
      form_email: null,
      form_referal: null,
    }
  }

  async componentDidMount() {
    this._isMounted = true

    const signup_data = JSON.parse(await AsyncStorage.getItem('signup_data'))
    this.setState({ form_name: signup_data.form_name })
    this.setState({ form_address: signup_data.form_address })
    this.setState({ form_phone: signup_data.form_phone })
    this.setState({ form_province_id: signup_data.form_province })
    this.setState({ form_city_id: signup_data.form_city })
    this.setState({ form_district_id: signup_data.form_district })
    this.setState({ form_email: signup_data.form_email })
    this.setState({ form_referal: signup_data.form_referal })
    
    signup_data.provinces.map((item) => {
      if(item.id == signup_data.form_province){
        this.setState({ form_province: item.name })
      }
    })

    await GET('cities/'+signup_data.form_province, {}, false).then(async (result) => {
      result.map((item) => {
        if(item.id == signup_data.form_city){
          this.setState({ form_city: item.name })
        }
      })
    }).catch(error => {
      console.log(error)
    })

    await GET('disctricts/'+signup_data.form_city, {}, false).then(async (result) => {
      result.map((item) => {
        if(item.id == signup_data.form_district){
          this.setState({ form_district: item.name })
        }
      })
    }).catch(error => {
      console.log(error)
    })
    
  }
  
  async submit() {
    const header = {
      'Content-Type': 'multipart/form-data',
      'Accept': 'application/json',
    }

    let login_telp = null
    if(this.state.form_phone.substring(0, 1) == '0'){
      login_telp = '62'+this.state.form_phone.substring(1, this.state.form_phone.length)
    }else{
      login_telp = this.state.form_phone
    }

    const params = []
    params.push({ name : 'name', data : this.state.form_name })
    params.push({ name : 'address', data : this.state.form_address })
    params.push({ name : 'province_id', data : String(this.state.form_province_id) })
    params.push({ name : 'city_id', data : String(this.state.form_city_id) })
    params.push({ name : 'disctrict_id', data : String(this.state.form_district_id) })
    params.push({ name : 'phonenumber', data : login_telp })
    params.push({ name : 'referal_code', data : this.state.form_referal })
    params.push({ name : 'email', data : this.state.form_email })
    if(this.state.change_photo){
      params.push({ 
        name: 'photo',
        filename: 'register-' + Date.now() + '.jpg',
        type: 'image/jpg',
        data: RNFetchBlob.wrap(this.state.photo.uri),
      })
    }

    // console.warn(params)
    let resp = await RNFetchBlob.fetch('POST', server_api.baseURL+'regis', header, params)
    let result = JSON.parse(resp.data)
    // console.warn(result)
    if(result.status){
      await AsyncStorage.setItem('userdata', JSON.stringify(result.data))
      Actions.login_otp()
    }else{
      this.refs.toast_error.show(result.message, 1000)
    }
  }

  changeFoto(){
    const options = {
      title: 'Pilih Foto',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    }

    ImagePicker.showImagePicker(options, (response) => {
      // console.log(response.path)
      // console.log(response.uri)
      if (response.didCancel) {
        console.log('User cancelled image picker')
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error)
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton)
      } else {
        const source = { uri: response.uri }
        this.setState({photo: source})
        this.setState({change_photo: true})
      }
    })
  }

	render() {
		return(
      <ScrollView style={styles.container} scrollEnabled={true}>

        <HeaderBack title="Daftar" />
        
        <View style={styles.container_form}>
          <Grid style={styles.tab}>
            <Col style={styles.tabNotActive}>
              <Text style={styles.titleNotActive}>Profil Konter</Text>
            </Col>
            <Col style={styles.tabActive}>
              <Text style={styles.titleActive}>Foto</Text>
            </Col>
          </Grid>

          <View style={styles.containerMiddle}>
            {
              this.state.photo.uri == null || this.state.photo.uri == '' || typeof this.state.photo.uri === 'undefined' ? 
              <TouchableOpacity onPress={() => this.changeFoto()}>
                <Image style={styles.avatar} source={require('_assets/images/default-user.png')}/>
              </TouchableOpacity>
              : 
              <TouchableOpacity onPress={() => this.changeFoto()}>
                <Image style={styles.avatar} source={this.state.photo}/>
              </TouchableOpacity>
            }
            <Text style={{color: '#8B8B8B'}}>Ganti Foto</Text>
          </View>

          <View style={styles.formValue}>
            <Grid>
              <Col size={1}>
                <Icon type="FontAwesome" name="user" style={styles.iconLeft}/>
              </Col>
              <Col size={8}>
                <Text style={styles.labelForm}>{this.state.form_name}</Text>
              </Col>
            </Grid>
          </View>
          <View style={styles.formValue}>
            <Grid>
              <Col size={1}>
                <Icon type="FontAwesome" name="map-marker-alt" style={styles.iconLeft}/>
              </Col>
              <Col size={8}>
                <Text style={styles.labelForm}>{this.state.form_address}</Text>
              </Col>
            </Grid>
          </View>
          <View style={styles.formValue}>
            <Grid>
              <Col size={1}>
                <Icon type="FontAwesome" name="map-marker-alt" style={styles.iconLeft}/>
              </Col>
              <Col size={8}>
                <Text style={styles.labelForm}>{this.state.form_province}</Text>
              </Col>
            </Grid>
          </View>
          <View style={styles.formValue}>
            <Grid>
              <Col size={1}>
                <Icon type="FontAwesome" name="map-marker-alt" style={styles.iconLeft}/>
              </Col>
              <Col size={8}>
                <Text style={styles.labelForm}>{this.state.form_city}</Text>
              </Col>
            </Grid>
          </View>
          <View style={styles.formValue}>
            <Grid>
              <Col size={1}>
                <Icon type="FontAwesome" name="map-marker-alt" style={styles.iconLeft}/>
              </Col>
              <Col size={8}>
                <Text style={styles.labelForm}>{this.state.form_district}</Text>
              </Col>
            </Grid>
          </View>
          <View style={styles.formValue}>
            <Grid>
              <Col size={1}>
                <Icon type="MaterialCommunityIcons" name="cellphone" style={styles.iconLeft}/>
              </Col>
              <Col size={8}>
                <Text style={styles.labelForm}>{this.state.form_phone}</Text>
              </Col>
            </Grid>
          </View>
          <View style={styles.formValue}>
            <Grid>
              <Col size={1}>
                <Icon type="MaterialCommunityIcons" name="barcode" style={styles.iconLeft}/>
              </Col>
              <Col size={8}>
                <Text style={styles.labelForm}>{this.state.form_referal}</Text>
              </Col>
            </Grid>
          </View>

          <Label style={styles.labelFormWarning}>Pastikan data yang di input sudah benar</Label>
          <Button btnLabel='Simpan' onPress={() => this.submit()} />
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
  containerMiddle: {
    paddingTop: 10,
  	paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 25,
    alignItems: 'center',
    alignContent: 'center'
  },
  avatar: { 
    height: 100,
    width: 100,
    resizeMode: 'cover',
    borderRadius: 60
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
  formValue: {
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#F1F4F9'
  },
  iconLeft: {
    color: Colors.PRIMARY,
    fontSize: 18,
    fontWeight: "normal",
    marginLeft: 15,
    marginTop: 12,
    marginBottom: 12,
  },
  labelForm: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: '#80807E',
    fontSize: 14,
    paddingTop: 12,
    paddingLeft: 2
  },
  labelFormWarning: {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontWeight: Typography.FONT_WEIGHT_REGULAR,
    color: Colors.WARNING,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 15
  },
});
