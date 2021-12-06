import React, { Component, useState } from 'react';
import { StyleSheet, StatusBar, Text, Alert, View, ScrollView, RefreshControl, TouchableOpacity, Dimensions, Image, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Grid, Col, Form, Item, Input, Label, Icon, Row } from 'native-base'
import { Actions } from 'react-native-router-flux'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import Toast from 'react-native-easy-toast'
import Colors from '../../styles/colors'
import Typography from '../../styles/typography'
import Button from '../../components/buttons/index'
import ButtonColor from '../../components/buttons/color'
import HeaderBack from '../../components/headers/back'
import Moment from 'moment'
import ApiServices from '../../services/ApiServices'
import global from '../../utils/Global'

export default class Notification extends Component {
  _isMounted = false

  constructor(props) {
    super(props)
  
    this.state = {
      userdata: null,
      listdata: [],
    }
  }

  async componentDidMount() {
    this._isMounted = true

    // GET USER
    await global.getProfile().then((item) => {
      this.setState({ userdata: item })
    })

    // NOTIFICATION
    await ApiServices.GET('user/notif/'+this.state.userdata.id, {}, true).then(async (result) => {
      // console.log(result)
      this.setState({ listdata: result })
    }).catch(error => {
      console.log(error)
    })
  }

  _onRefresh = () => {
    Actions.refresh({key: Moment.utc().format('YYYYMMDDhhmmss')})
  }

  async read(item){
    // READ NOTIFICATION
    await ApiServices.GET('update/notif/'+item.id, {}, true).then(async (result) => {
      // RELOAD
      await ApiServices.GET('user/notif/'+this.state.userdata.id, {}, true).then(async (result) => {
        this.setState({ listdata: result })
        Actions.notification_detail({ item: item })
      }).catch(error => {
        console.log(error)
      })
    }).catch(error => {
      this.refs.toast_error.show(error.message, 1000)
    })
  }

  async readall(){
    // READ ALL
    await ApiServices.GET('user/notif/readall/'+this.state.userdata.id, {}, true).then(async (result) => {
      // RELOAD
      await ApiServices.GET('user/notif/'+this.state.userdata.id, {}, true).then(async (result) => {
        this.setState({ listdata: result })
        Actions.notification_detail({ item: item })
      }).catch(error => {
        console.log(error)
      })
    }).catch(error => {
      this.refs.toast_error.show(error.message, 1000)
    })
  }

  async deleteall(){
    // DELETE ALL
    await ApiServices.GET('user/notif/deleteall/'+this.state.userdata.id, {}, true).then(async (result) => {
      // RELOAD
      await ApiServices.GET('user/notif/'+this.state.userdata.id, {}, true).then(async (result) => {
        this.setState({ listdata: result })
        Actions.notification_detail({ item: item })
      }).catch(error => {
        console.log(error)
      })
    }).catch(error => {
      this.refs.toast_error.show(error.message, 1000)
    })
  }

  async confirmDeleteAll(){
    Alert.alert(
      'Konfirmasi',
      'Apakah Anda yakin akan menghapus semua notifikasi ?',
      [
        {
          text: 'Batal',
          style: 'cancel',
        },
        {text: 'OK', onPress: () => this.deleteall()},
      ],
      {cancelable: false},
    )
  }

	render() {
		return(
      <View style={styles.container}>

        <HeaderBack title="Notifikasi" />
        
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
            
            {/* <Grid>
              <Row style={{borderBottomWidth: 1, borderBottomColor: '#F1F3F6', marginBottom: 5, paddingLeft: 15, paddingTop: 10, paddingBottom: 10, paddingRight: 15}}>
                <Col size={4} style={{alignItems: "flex-start", justifyContent: "center"}}>
                  <TouchableOpacity onPress={() => this.readall()}>
                    <Text style={[styles.titleBoldGreen]}>Baca Semua</Text>
                  </TouchableOpacity>
                </Col>
                <Col size={4} style={{alignItems: "flex-end", justifyContent: "center"}}>
                  <TouchableOpacity onPress={() => this.confirmDeleteAll()}>
                    <Text style={[styles.titleBoldRed]}>Hapus Semua</Text>
                  </TouchableOpacity>
                </Col>
              </Row>
              { 
                this.state.listdata.map((unit, key) => {
                  return (
                    <Row key={key} style={{borderBottomWidth: 1, borderBottomColor: '#F1F3F6', paddingBottom: 10, paddingTop: 5, marginBottom: 10}}>
                      <Col size={2} style={{justifyContent: "center", paddingLeft: 15}}>
                        { (unit.status != 'unread') ? 
                          <Image style={{ width: 29, height: 29, resizeMode: "contain" }} source={require('../../assets/images/notification-list.png')} />
                          : 
                          <Image style={{ width: 29, height: 29, resizeMode: "contain" }} source={require('../../assets/images/notification-list-new.png')} />
                        }
                      </Col>
                      <Col size={16} style={{justifyContent: "center"}}>
                        <TouchableOpacity onPress={() => this.read(unit)}>
                          <Text style={[styles.titleBoldBlack]}>{unit.tittle}</Text>
                        </TouchableOpacity>
                        <Text style={[styles.title]}>{Moment.utc(unit.updated_at).format('YYYY/MM/DD hh:mm')}</Text>
                      </Col>
                    </Row>
                  );
                }) 
              }
            </Grid> */}

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
  container_form : {
    paddingBottom: 50,
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
    fontSize: 14,
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
