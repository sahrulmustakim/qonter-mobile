import React, { Component, useState } from 'react'
import { StyleSheet, AsyncStorage, StatusBar, View, ScrollView, RefreshControl, TouchableOpacity, Dimensions, Image } from 'react-native'
import { Grid, Col, Form, Item, Input, Label, Icon, Row, Spinner, Button, Text } from 'native-base'
import { Actions } from 'react-native-router-flux'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import Toast from 'react-native-easy-toast'
import { Colors, Typography } from '../../styles'
import HeaderBack from '../../components/headers/back'
import Moment from 'moment'
import { POST, GET } from '../../services/ApiServices'
import { getProfile, formatPrice } from '../../utils/Global'

export default class UserDevice extends Component {
  _isMounted = false

  constructor(props) {
    super(props)
  
    this.state = {
      userdata: null,
      devices: [{
        title: 'Daftar Semua Device',
        list: []
      }],
      loading: true,
    }
  }

  async componentDidMount() {
    this._isMounted = true

    // GET USER
    await getProfile().then((item) => {
      this.setState({ userdata: item })
    })

    // DEVICE LIST
    await GET('device/list/'+this.state.userdata.id, {}, true).then(async (result) => {
      await this.setState({ 
        devices: [{
          title: 'Daftar Semua Device',
          list: result
        }] 
      })
      await this.setState({ loading: false })
    }).catch(error => {
      console.log(error)
    })
  }

  async allowDevice(id) {
    await this.setState({ loading: true })
    await GET('device/allow/'+id, {}, true).then(async (result) => {
      this.refs.toast_success.show('Device berhasil di izinkan.', 1000)

      // DEVICE LIST
      await GET('device/list/'+this.state.userdata.id, {}, true).then(async (result) => {
        await this.setState({ 
          devices: [{
            title: 'Daftar Semua Device',
            list: result
          }] 
        })
      }).catch(error => {
        this.refs.toast_success.show(error.message, 1000)
      })

      await this.setState({ loading: false })
    }).catch(error => {
      this.refs.toast_success.show(error.message, 1000)
    })
  }

  async deleteDevice(id) {
    await this.setState({ loading: true })
    await GET('device/delete/'+id, {}, true).then(async (result) => {
      this.refs.toast_success.show('Device berhasil di hapus.', 1000)

      // DEVICE LIST
      await GET('device/list/'+this.state.userdata.id, {}, true).then(async (result) => {
        await this.setState({ 
          devices: [{
            title: 'Daftar Semua Device',
            list: result
          }] 
        })
      }).catch(error => {
        this.refs.toast_success.show(error.message, 1000)
      })

      await this.setState({ loading: false })
    }).catch(error => {
      this.refs.toast_success.show(error.message, 1000)
    })
  }

  _onRefresh = () => {
    Actions.refresh({key: Moment.utc().format('YYYYMMDDhhmmss')})
  }

	render() {
		return(
      <View style={styles.container}>

        <HeaderBack title="Device Saya" />
        
        {
          (this.state.loading == true) ?
          <View style={styles.container_form}>
            <Spinner color='green' />
          </View>
          : false
        }
        
        {
          (this.state.loading == false && this.state.devices[0].list.length == 0) ?
          <View style={[styles.container_form, { padding: 15, alignItems: "center" }]}>
            <Image style={{ width: 65, height: 65, resizeMode: "contain" }} source={require('../../assets/images/question.png')} />
            <Text style={[styles.labelForm, { textAlign: "center", paddingTop: 10 }]}>Data masih kosong{"\n"}Anda belum memiliki Device</Text>
          </View>
          : false
        }

        {
          (this.state.loading == false && this.state.devices[0].list.length > 0) ?
          <View style={styles.container_form}>
            <ScrollView 
              ref={ref => {this.scrollView = ref}}
              refreshControl={
                <RefreshControl
                  refreshing={this.state.refreshing}
                  onRefresh={this._onRefresh}
                />
              }
              scrollEnabled={true}>
              { this.state.devices.map((item, key) => {
                return (
                  <Grid key={key}>
                    <Row style={{borderBottomWidth: 1, borderBottomColor: '#F1F3F6', marginBottom: 5, paddingTop: 10, paddingLeft: 15, paddingRight: 15}}>
                      <Col>
                        <Text style={[styles.title, {paddingBottom: 10}]}>{item.title}</Text>
                      </Col>
                      <Col style={{justifyContent: 'flex-end', alignItems: 'flex-end'}}>
                        <Text style={[styles.titleBoldGreen, {paddingBottom: 10}]}>{item.list.length} Device</Text>
                      </Col>
                    </Row>
                    { item.list.map((unit, key2) => {
                      return (
                        <Row key={key2} style={{borderBottomWidth: 1, borderBottomColor: '#F1F3F6', marginBottom: 10, paddingBottom: 10}}>
                          <Col size={2} style={{justifyContent: "center", alignItems: "center"}}>
                            <Image style={{ width: 25, height: 25, resizeMode: "contain" }} source={require('../../assets/images/phone-network.png')} />
                          </Col>
                          <Col size={5} style={{justifyContent: "center"}}>
                            <Text style={[styles.titleBoldGreen]}>{unit.imei}</Text>
                          </Col>
                          <Col size={7} style={{justifyContent: "center", alignItems: "flex-end", margin: 0, padding: 0}}>
                            {
                              (unit.allow == 0) ?
                              <Row style={{margin: 0, padding: 0}}>
                                <Col>
                                  <Button danger iconLeft onPress={() => this.deleteDevice(unit.id)}>
                                    <Icon type="FontAwesome" name="trash" style={{color: '#fff', fontSize: 12}} />
                                    <Text style={{fontSize: 12}}>Hapus</Text>
                                  </Button>
                                </Col>
                                <Col>
                                  <Button success iconLeft onPress={() => this.allowDevice(unit.id)}>
                                    <Icon type="FontAwesome" name="check" style={{color: '#fff', fontSize: 12}} />
                                    <Text style={{fontSize: 12}}>Izinkan</Text>
                                  </Button>
                                </Col>
                              </Row>
                              :
                              <Text style={[styles.titleBoldGreen, {paddingRight: 15}]}>Diizinkan</Text>
                            }
                          </Col>
                        </Row>
                      );
                    })}
                  </Grid>
                );
              })} 

            </ScrollView>
          </View>
          : false
        }
        
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
    paddingBottom: 45,
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
  titleSmallBlackBold: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
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
