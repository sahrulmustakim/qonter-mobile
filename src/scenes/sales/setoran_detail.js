import React, { Component, useState } from 'react'
import { StyleSheet, AsyncStorage, StatusBar, Text, View, ScrollView, TouchableOpacity, Dimensions, Image } from 'react-native'
import { Grid, Col, Form, Item, Input, Label, Icon, Row, Button, Spinner } from 'native-base'
import { Actions } from 'react-native-router-flux'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import Toast from 'react-native-easy-toast'
import { Colors, Typography } from '_styles'
import ButtonFill from '_components/buttons/fill'
import HeaderBack from '_headers/back'
import Moment from 'moment'
import { server_api } from '_configs/env'
import { POST, GET } from '_services/ApiServices'
import { getProfile, formatPrice } from '_utils/Global'
import ImagePicker from 'react-native-image-picker'
import RNFetchBlob from 'rn-fetch-blob'
import Select2 from "react-native-select-two"

export default class SetoranDetail extends Component {
  _isMounted = false

  constructor(props) {
    super(props)
  
    this.state = {
      nominal: 0,
      userdata: null,
      profile: null,
      listdata: [],
      photo: { uri: null },
      change_photo: false,
      loading: true,
      payment: 'transfer',
      payments: [
        {
          id: 'transfer',
          name: 'Transfer'
        },
        {
          id: 'cash',
          name: 'Cash'
        }
      ]
    }
  }

  async componentDidMount() {
    this._isMounted = true

    // GET USER
    await getProfile().then((item) => {
      this.setState({ userdata: item })
    })

    // PROFILE
    await POST('profile', {
      id: this.props.detail.user.id
    }, true).then(async (result) => {
      console.log(JSON.stringify(result))
      this.setState({ profile: result })
      this.setState({ nominal: this.props.detail.request[0].debt })
    }).catch(error => {
      console.log(error)
    })

    // RIWAYAT PAYLATER
    await GET('sales/setoran/history/'+this.props.detail.user.id, {}, true).then(async (result) => {
      this.setState({ listdata: result })
    }).catch(error => {
      console.log(error)
    })

    this.setState({ loading: false })
  }

  async upload(id) {
    this.setState({ loading: true })
    const header = {
      'Content-Type': 'multipart/form-data',
      'Accept': 'application/json',
    }

    const params = []
    params.push({ name : 'id', data : String(id) })
    params.push({ name : 'id_sales', data : String(this.state.userdata.id) })
    params.push({ name : 'payment_type', data : String(this.state.payment) })
    if(this.state.change_photo){
      params.push({ 
        name: 'photo',
        filename: 'setoran-'+id+'-' + Date.now() + '.jpg',
        type: 'image/jpg',
        data: RNFetchBlob.wrap(this.state.photo.uri),
      })
    }

    // console.warn(params)
    let resp = await RNFetchBlob.fetch('POST', server_api.baseURL+'sales/setoran/upload', header, params)
    let result = JSON.parse(resp.data)
    // console.warn(result)
    if(result.status){
      Actions.sales_setoran()
    }else{
      this.refs.toast_error.show(result.message, 1000)
    }
    this.setState({ loading: false })
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
      <View style={styles.container}>

        <HeaderBack title={this.props.detail.user.name} />
        
        <View style={styles.container_form}>
          <ScrollView scrollEnabled={true}>
            <Label style={[styles.labelForm, {textAlign: "center"}]}>Jumlah Setoran</Label>
            <Label style={[styles.titleBigBlack, {textAlign: "center", paddingBottom: 15}]}>Rp{formatPrice(this.state.nominal)}</Label>

            {
              (this.state.loading) ? 
              <View style={styles.container_form}>
                <Spinner color='green' />
              </View>
              : false
            }
            
            {
              (this.props.detail.request != null && this.props.detail.request.length > 0 && this.props.detail.request[0].payment_type == null && this.state.loading == false) ? 
              <View style={styles.boxInput}>
                <Form style={{marginBottom: 12}}>
                  <Item stackedLabel style={styles.formItem}>
                    <Label style={styles.labelForm}>Jenis Pembayaran</Label>
                    <Select2
                      isSelectSingle
                      style={{ borderWidth: 0, paddingLeft: 0, marginTop: 5 }}
                      colorTheme={Colors.PRIMARY}
                      popupTitle="Pilih Jenis Pembayaran"
                      title="Transfer"
                      searchPlaceHolderText="Cari Jenis Pembayaran"
                      listEmptyTitle="Data kosong"
                      cancelButtonText="Tutup"
                      selectButtonText="Pilih"
                      data={this.state.payments}
                      onSelect={data => {
                        this.setState({ payment: data })
                      }}
                      onRemoveItem={data => {
                        this.setState({ payment: 'transfer' })
                      }}
                    />
                  </Item>
                  {
                    this.state.payment == 'transfer' ?
                    <Item stackedLabel style={styles.formItem}>
                      <Label style={styles.labelForm}>Upload Bukti Setoran</Label>
                      <View style={styles.containerMiddle}>
                        {
                          this.state.photo.uri == null || this.state.photo.uri == '' || typeof this.state.photo.uri === 'undefined' ? 
                          <TouchableOpacity onPress={() => this.changeFoto()}>
                            <Image style={styles.avatar} source={require('_assets/images/setoran.png')}/>
                          </TouchableOpacity>
                          : 
                          <TouchableOpacity onPress={() => this.changeFoto()}>
                            <Image style={styles.avatar} source={this.state.photo}/>
                          </TouchableOpacity>
                        }
                        <Text style={{color: '#8B8B8B', paddingTop: 10}}>Klik icon diatas untuk melampirkan Bukti Setoran</Text>
                      </View>
                    </Item>
                    : false
                  }
                  <View style={{alignItems: "center", width: '100%', paddingLeft: 15, paddingRight: 15}}>
                    <Row>
                      <Col style={{paddingLeft: 5, paddingRight: 5}}>
                      {
                        (this.props.detail.request != null && this.props.detail.request.length > 0) ? 
                        <Button style={{width: '100%', borderRadius: 5}} block danger onPress={() => this.upload(this.props.detail.request[0].id)}>
                          <Text style={{width: '100%',textAlign: 'center', fontSize: 14, fontWeight: "bold", color: '#fff'}}>Setor</Text>
                        </Button>
                        : false
                      }
                      </Col>
                    </Row>
                  </View>
                </Form>
              </View>
              : false 
            }

            {
              (this.props.detail.request != null && this.props.detail.request.length > 0 && this.props.detail.request[0].payment_type != null && this.state.loading == false) ? 
              <View style={[styles.boxInput, {padding: 20}]}>
                <Text style={[styles.titleBoldOrange, {textAlign: 'center'}]}>Menunggu Konfirmasi Admin</Text>
              </View>
              : false 
            }
            
            <Grid>
              <Row style={{borderBottomWidth: 1, borderBottomColor: '#F1F3F6', marginBottom: 5, marginTop: 15}}>
                <Col>
                  <Text style={[styles.titleBoldGreen, {paddingBottom: 10}]}>Riwayat Setoran</Text>
                </Col>
              </Row>
              { 
                this.state.listdata.sort(function(a,b){ return new Date(b.created_at).getTime() - new Date(a.created_at).getTime() }).map((unit, key) => {
                  return (
                    <Row key={key} style={{borderBottomWidth: 1, borderBottomColor: '#F1F3F6', marginBottom: 10, paddingBottom: 10}}>
                      <Col size={2} style={{justifyContent: "center", alignItems: "center"}}>
                        <Image style={{ width: 45, height: 45, resizeMode: "contain" }} source={require('_assets/images/dbcurrency.png')} />
                      </Col>
                      <Col size={5} style={{justifyContent: "center"}}>
                        <Text style={[styles.titleBoldBlack]}>Jumlah</Text>
                        <Text style={[styles.title]}>Rp{formatPrice(unit.debt)}</Text>
                      </Col>
                      <Col size={5} style={{justifyContent: "center", alignItems: "flex-end"}}>
                        <Text style={[styles.titleSmallBlack, {marginBottom: 5}]}>{Moment(unit.created_at).format('DD MMMM YYYY')}</Text>
                        <Text style={{backgroundColor: 'green', color: '#FFF', borderRadius: 5, paddingLeft: 8, paddingRight: 8}}>
                          Disetujui
                        </Text>
                      </Col>
                    </Row>
                  );
                })
              }
            </Grid> 
          </ScrollView>
        </View>
        
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
    resizeMode: 'cover'
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
  titleBoldOrange: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: '#FEC007',
    fontSize: 16,
  },
  titleBoldRed: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: '#F63F3F',
    fontSize: 16,
  },
});
