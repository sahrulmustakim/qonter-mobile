import React, { Component } from 'react'
import { StyleSheet, AsyncStorage, StatusBar, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native'
import { Grid, Col, Form, Item, Input, Label, Icon } from 'native-base'
import { Actions } from 'react-native-router-flux'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import Toast from 'react-native-easy-toast'
import { Colors, Typography } from '../../styles'
import HeaderBack from '../../components/headers/back'
import Button from '../../components/buttons'
import { getProfile, formatPrice } from '../../utils/Global'
import { POST, GET } from '../../services/ApiServices'
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

    console.log(this.props.detail)
    if(typeof this.props.detail.amount !== 'undefined'){
      this.setState({ nominal: parseInt(this.props.detail.amount) })
    }
  }

  async update() {
    await POST('komisi/withdraw', {
      users_id: this.state.userdata.id,
      amount: parseInt(this.state.nominal)
    }, true).then(async (result) => {
      this.refs.toast_success.show('Penarikan komisi berhasil dikirim, silahkan menunggu konfirmasi', 4000)
      Actions.profile()
    }).catch(error => {
      console.log(error)
    })
  }

  async changeNominal(value){
    if(value.length < 1){
      this.setState({nominal: 0})
    }else if(parseInt(value) > parseInt(this.props.detail.amount)){
      this.setState({nominal: parseInt(this.props.detail.amount)})
    }else{
      this.setState({nominal: parseInt(value)})
    }
  }

	render() {
		return(
      <ScrollView style={styles.container} scrollEnabled={true}>

        <HeaderBack title="Tarik Komisi" />
        
        <View style={styles.container_form}>
          <Form style={{marginBottom: 12}}>
            
            <Item stackedLabel style={styles.formItem}>
              <Label style={styles.labelForm}>Total Penarikan</Label>
              <Input style={styles.inputForm} placeholder='Value Markup' keyboardType="number-pad" value={this.state.nominal.toString()} placeholderTextColor="#D1D1D1" onChangeText = {(value) => this.changeNominal(value)} />
            </Item>
          </Form>

          <Button btnLabel='Submit' onPress={() => this.update()} />
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
