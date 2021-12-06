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
import { POST, GET } from '../../services/ApiServices'
import { validateInput, getProfile } from '../../utils/Global'

export default class Register extends Component {
  _isMounted = false

  constructor(props) {
    super(props)
  
    this.state = {
      // Form Data
      form_email: null,
      form_phone: null,
    }
  }

  async componentDidMount() {
    this._isMounted = true
    // GET USER
    await getProfile().then(async (item) => {
      this.setState({ form_email: item.email })
      this.setState({ form_phone: item.phonenumber })
      // console.log(item)
    })
  }

  async confirm() {
    var validate = {}
    validate = validateInput(this.state.form_email, 'email', 'Email')
    if(!validate.status){
      this.refs.toast_error.show(validate.message, 1000)
      return false
    }
    validate = validateInput(this.state.form_phone, 'required', 'Nomor Handphone')
    if(!validate.status){
      this.refs.toast_error.show(validate.message, 1000)
      return false
    }

    await AsyncStorage.setItem('update_data', JSON.stringify(this.state))
    Actions.update_pin()
  }

	render() {
		return(
      <ScrollView style={styles.container} scrollEnabled={true}>

        <HeaderBack title="Ubah Email / Nomor Telepon" />
        
        <View style={styles.container_form}>
          <Form style={{marginBottom: 12}}>
            <Item stackedLabel style={styles.formItem}>
              <Label style={styles.labelForm}>Email</Label>
              <Input style={styles.inputForm} placeholder='Masukkan Email' keyboardType="email-address" placeholderTextColor="#D1D1D1" value={this.state.form_email} onChangeText = {(value) => this.setState({form_email: value})} />
            </Item>
            <Item stackedLabel style={styles.formItem}>
              <Label style={styles.labelForm}>Nomor Handphone</Label>
              <Input style={styles.inputForm} keyboardType="phone-pad" placeholder='Masukkan Nomor Handphone' placeholderTextColor="#D1D1D1" value={this.state.form_phone} onChangeText = {(value) => this.setState({form_phone: value})} />
            </Item>
          </Form>
          <View style={{width: '100%', alignItems: 'center', paddingBottom: 15}}>
            <Label style={[styles.labelFormWarning, {textAlign: "center"}]}>Mengubah data diatas diperlukan konfirmasi pin dan Anda akan diminta login kembali</Label>
          </View>

          <Button btnLabel='Konfirmasi' onPress={() => this.confirm()} />
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
    fontSize: 14
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
