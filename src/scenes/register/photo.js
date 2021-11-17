import React, { Component } from 'react';
import { StyleSheet, StatusBar, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView, Center, HStack, Flex, FormControl, Text, Input, Stack, Box, TextArea } from 'native-base';
import { Actions } from 'react-native-router-flux';
import Toast from 'react-native-easy-toast';
import Colors from '../../styles/colors';
import Typography from '../../styles/typography';
import HeaderBack from '../../components/headers/back';
import ButtonIndex from '../../components/buttons/index';
import * as ImagePicker from 'react-native-image-picker';
import RNFetchBlob from 'rn-fetch-blob';
import { server_api } from '../../configs/env';
import ApiServices from '../../services/ApiServices';

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
      form_referal: null
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
      if(item.value == signup_data.form_province){
        this.setState({ form_province: item.label })
      }
    })

    await ApiServices.GET('cities/'+signup_data.form_province, {}, false).then(async (result) => {
      result.map((item) => {
        if(item.value == signup_data.form_city){
          this.setState({ form_city: item.label })
        }
      })
    }).catch(error => {
      console.log(error)
    })

    await ApiServices.GET('disctricts/'+signup_data.form_city, {}, false).then(async (result) => {
      result.map((item) => {
        if(item.value == signup_data.form_district){
          this.setState({ form_district: item.label })
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
    if(this.state.form_referal != null && this.state.form_referal != ''){
      params.push({ name : 'referal_code', data : this.state.form_referal })
    }
    params.push({ name : 'email', data : this.state.form_email })
    console.log(params)
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
      selectionLimit: 1,
      mediaType: 'photo',
      includeBase64: false,
    };

    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker')
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error)
      } else {
        const uri = response?.assets && response.assets[0].uri;
        // console.log(uri)
        const source = { uri: uri }
        this.setState({photo: source})
        this.setState({change_photo: true})
      }
    })
  }

	render() {
		return(
      <Flex>

        <HeaderBack title="Daftar" />
        
        <Center>
          <HStack space="2" alignItems='center'>
            <Flex direction="row" bg="white">
              <Center w="1/2" px="1" py="3" style={styles.tabNotActive}>
                <Text color={Colors.PRIMARY} style={styles.titleNotActive}>Profil Konter</Text>
              </Center>
              <Center w="1/2" px="1" py="3" style={styles.tabActive}>
                <Text color={Colors.PRIMARY} style={styles.titleActive}>Foto</Text>
              </Center>
            </Flex>
          </HStack>
        </Center>

        <ScrollView
          style={{
            paddingBottom: 10
          }}
          h={{
            base: "88%"
          }}
        >
          <Stack
            space={2.5}
            alignSelf="center"
            px="4"
            bg="white"
            safeArea
            pt="4"
            w={{
              base: "100%",
              md: "25%",
            }}
          >
            <Box>
              <FormControl mb="5">
                <Center>
                  {
                    this.state.photo.uri == null || this.state.photo.uri == '' || typeof this.state.photo.uri === 'undefined' ? 
                    <TouchableOpacity onPress={() => this.changeFoto()}>
                      <Image style={styles.avatar} source={require('../../assets/images/default-user.png')}/>
                    </TouchableOpacity>
                    : 
                    <TouchableOpacity onPress={() => this.changeFoto()}>
                      <Image style={styles.avatar} source={this.state.photo}/>
                    </TouchableOpacity>
                  }
                  <Text color='#8B8B8B'>Ganti Foto</Text>
                </Center>
              </FormControl>
              <FormControl mb="5" isDisabled>
                <FormControl.Label>Nama Pemilik</FormControl.Label>
                <Input style={styles.inputForm} value={this.state.form_name} />
              </FormControl>
              <FormControl mb="5" isDisabled>
                <FormControl.Label>Email</FormControl.Label>
                <Input style={styles.inputForm} value={this.state.form_email} />
              </FormControl>
              <FormControl mb="5" isDisabled>
                <FormControl.Label>Alamat</FormControl.Label>
                <TextArea
                  h={20}
                  placeholder="Masukkan Alamat"
                  style={[styles.inputForm, {
                    textAlignVertical: 'top'
                  }]} 
                  value={this.state.form_address} 
                />
              </FormControl>
              <FormControl mb="5" isDisabled>
                <FormControl.Label>Provinsi</FormControl.Label>
                <Input style={styles.inputForm} value={this.state.form_province} />
              </FormControl>
              <FormControl mb="5" isDisabled>
                <FormControl.Label>Kabupaten/Kota</FormControl.Label>
                <Input style={styles.inputForm} value={this.state.form_city} />
              </FormControl>
              <FormControl mb="5" isDisabled>
                <FormControl.Label>Kecamatan</FormControl.Label>
                <Input style={styles.inputForm} value={this.state.form_district} />
              </FormControl>
              <FormControl mb="5" isDisabled>
                <FormControl.Label>Nomor Handphone</FormControl.Label>
                <Input style={styles.inputForm} value={this.state.form_phone} />
              </FormControl>
              <FormControl mb="2" isDisabled>
                <FormControl.Label>Kode Referal</FormControl.Label>
                <Input style={styles.inputForm} value={this.state.form_referal} />
              </FormControl>
              <FormControl mb="0">
                <Text style={styles.labelFormWarning}>Mohon pastikan kembali data yang di input sudah benar</Text>
              </FormControl>
              <FormControl mb="5">
                <ButtonIndex btnLabel='Simpan' onPress={() => this.submit()} />
              </FormControl>
            </Box>
          </Stack>
        </ScrollView>

        <StatusBar backgroundColor={Colors.PRIMARY} barStyle={"light-content"} />
        <Toast ref="toast_error" style={{backgroundColor:Colors.ALERT, width: '90%'}} position='top' positionValue={35} />
        <Toast ref="toast_success" style={{backgroundColor:Colors.SUCCESS, width: '90%'}} position='top' positionValue={35} />
      </Flex>	
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
  inputForm: {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontWeight: Typography.FONT_WEIGHT_REGULAR,
    fontSize: 16,
    width: '100%'
  }
});
