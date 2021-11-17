import React, { Component } from 'react';
import { StyleSheet, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView, Center, HStack, Flex, FormControl, Text, Input, Stack, Box, TextArea } from 'native-base';
import { Actions } from 'react-native-router-flux';
import Toast from 'react-native-easy-toast';
import Colors from '../../styles/colors';
import Typography from '../../styles/typography';
import HeaderBack from '../../components/headers/back';
import ButtonIndex from '../../components/buttons/index';
import RNPickerSelect from 'react-native-picker-select';
import global from '../../utils/Global';
import ApiServices from '../../services/ApiServices';
import MaterialIcons from 'react-native-vector-icons/dist/MaterialIcons';

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
      form_server: null,

      // Master Data
      provinces: [],
      cities: [],
      districts: [],
    }
  }

  async componentDidMount() {
    this._isMounted = true
    await this.getProvinces()
  }

  async getProvinces() {
    await ApiServices.GET('provinces', {}, false).then(async (result) => {
      // console.log(result)
      this.setState({ provinces: result })
    }).catch(error => {
      console.log(error)
    })
  }

  async getCities(id) {
    if(id != null){
      await ApiServices.GET('cities/'+id, {}, false).then(async (result) => {
        // console.log(result)
        this.setState({ cities: result })
      }).catch(error => {
        console.log(error)
      })
    }else{
      this.setState({ form_city: null })
      this.setState({ cities: [] })
      this.setState({ form_district: null })
      this.setState({ districts: [] })
    }
  }

  async getDistrict(id) {
    if(id != null){
      await ApiServices.GET('disctricts/'+id, {}, false).then(async (result) => {
        // console.log(result)
        this.setState({ districts: result })
      }).catch(error => {
        console.log(error)
      })
    }else{
      this.setState({ form_district: null })
      this.setState({ districts: [] })
    }
  }

  async next() {
    var validate = {}
    validate = global.validateInput(this.state.form_name, 'required', 'Nama Pemilik')
    if(!validate.status){
      this.refs.toast_error.show(validate.message, 1000)
      return false
    }
    validate = global.validateInput(this.state.form_email, 'email', 'Email')
    if(!validate.status){
      this.refs.toast_error.show(validate.message, 1000)
      return false
    }
    validate = global.validateInput(this.state.form_address, 'required', 'Alamat')
    if(!validate.status){
      this.refs.toast_error.show(validate.message, 1000)
      return false
    }
    validate = global.validateInput(this.state.form_province, 'required', 'Provinsi')
    if(!validate.status){
      this.refs.toast_error.show(validate.message, 1000)
      return false
    }
    validate = global.validateInput(this.state.form_city, 'required', 'Kota/Kabupaten')
    if(!validate.status){
      this.refs.toast_error.show(validate.message, 1000)
      return false
    }
    validate = global.validateInput(this.state.form_district, 'required', 'Kecamatan')
    if(!validate.status){
      this.refs.toast_error.show(validate.message, 1000)
      return false
    }
    validate = global.validateInput(this.state.form_phone, 'required', 'Nomor Handphone')
    if(!validate.status){
      this.refs.toast_error.show(validate.message, 1000)
      return false
    }

    var signup_data = this.state
    await AsyncStorage.setItem('signup_data', JSON.stringify(signup_data))
    Actions.register_photo()
  }

	render() {
		return(
      <Flex>

        <HeaderBack title="Daftar" />
        
        <Center>
          <HStack space="2" alignItems='center'>
            <Flex direction="row" bg="white">
              <Center w="1/2" px="1" py="3" style={styles.tabActive}>
                <Text color={Colors.PRIMARY} style={styles.titleActive}>Profil Konter</Text>
              </Center>
              <Center w="1/2" px="1" py="3" style={styles.tabNotActive}>
                <Text color={Colors.PRIMARY} style={styles.titleNotActive}>Foto</Text>
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
                <FormControl.Label>Nama Pemilik</FormControl.Label>
                <Input style={styles.inputForm} placeholder='Masukkan Nama Pemilik' placeholderTextColor="#D1D1D1" onChangeText = {(value) => this.setState({form_name: value})} />
              </FormControl>
              <FormControl mb="5">
                <FormControl.Label>Email</FormControl.Label>
                <Input style={styles.inputForm} placeholder='Masukkan Email' placeholderTextColor="#D1D1D1" onChangeText = {(value) => this.setState({form_email: value})} />
              </FormControl>
              <FormControl mb="5">
                <FormControl.Label>Alamat</FormControl.Label>
                <TextArea
                  h={20}
                  placeholder="Masukkan Alamat"
                  style={[styles.inputForm, {
                    textAlignVertical: 'top'
                  }]}
                  placeholderTextColor="#D1D1D1"
                  onChangeText = {(value) => this.setState({form_address: value})}
                />
              </FormControl>
              <FormControl mb="5">
                <FormControl.Label>Provinsi</FormControl.Label>
                <RNPickerSelect
                  onValueChange={(value) => {
                    this.setState({ form_province: value })
                    this.getCities(value)
                  }}
                  placeholder={{
                    label: 'Pilih Provinsi',
                    value: null,
                    color: '#d1d1d1',
                  }}
                  useNativeAndroidPickerStyle={false}
                  style={styles.selectOption}
                  Icon={() => {
                    return <MaterialIcons name="expand-more" size={24} color="gray" />;
                  }}
                  items={this.state.provinces}
                  value={this.state.form_province}
                />
              </FormControl>
              <FormControl mb="5">
                <FormControl.Label>Kabupaten/Kota</FormControl.Label>
                <RNPickerSelect
                  onValueChange={(value) => {
                    this.setState({ form_city: value })
                    this.getDistrict(value)
                  }}
                  placeholder={{
                    label: 'Pilih Kabupaten/Kota',
                    value: null,
                    color: '#d1d1d1',
                  }}
                  useNativeAndroidPickerStyle={false}
                  style={styles.selectOption}
                  Icon={() => {
                    return <MaterialIcons name="expand-more" size={24} color="gray" />;
                  }}
                  items={this.state.cities}
                  value={this.state.form_city}
                />
              </FormControl>
              <FormControl mb="5">
                <FormControl.Label>Kecamatan</FormControl.Label>
                <RNPickerSelect
                  onValueChange={(value) => {
                    this.setState({ form_district: value })
                  }}
                  placeholder={{
                    label: 'Pilih Kecamatan',
                    value: null,
                    color: '#d1d1d1',
                  }}
                  useNativeAndroidPickerStyle={false}
                  style={styles.selectOption}
                  Icon={() => {
                    return <MaterialIcons name="expand-more" size={24} color="gray" />;
                  }}
                  items={this.state.districts}
                  value={this.state.form_district}
                />
              </FormControl>
              <FormControl mb="5">
                <FormControl.Label>Nomor Handphone</FormControl.Label>
                <Input style={styles.inputForm} keyboardType="phone-pad" placeholder='Masukkan Nomor Handphone' placeholderTextColor="#D1D1D1" onChangeText = {(value) => this.setState({form_phone: value})} />
                <FormControl.HelperText>
                  Nomor yang dimasukkan akan digunakan untuk login.
                </FormControl.HelperText>
              </FormControl>
              <FormControl mb="5">
                <FormControl.Label>Kode Referal</FormControl.Label>
                <Input style={styles.inputForm} placeholder='Masukkan Kode Referal' placeholderTextColor="#D1D1D1" onChangeText = {(value) => this.setState({form_referal: value})} />
              </FormControl>
              <FormControl mb="5">
                <ButtonIndex btnLabel='Selanjutnya' onPress={() => this.next()} />
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
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: Colors.PRIMARY
  },
  tabNotActive: {
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
  selectOption: {
    inputAndroid: {
      fontSize: 16,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderWidth: 0.5,
      borderColor: '#d1d1d1',
      borderRadius: 4,
      color: 'black',
      paddingRight: 30
    },
    iconContainer: {
      top: 10,
      right: 12,
    }
  },
  inputForm: {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontWeight: Typography.FONT_WEIGHT_REGULAR,
    fontSize: 16,
    width: '100%'
  }
});
