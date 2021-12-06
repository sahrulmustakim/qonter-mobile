import React, { Component, useState } from 'react'
import { StyleSheet, AsyncStorage, StatusBar, Text, View, ScrollView, TouchableOpacity, Dimensions, Image, ImageBackground } from 'react-native'
import { Grid, Col, Form, Item, Input, Label, Icon, Row } from 'native-base'
import { Actions } from 'react-native-router-flux'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import Toast from 'react-native-easy-toast'
import { Colors, Typography } from '../../styles'
import Button from '../../components/buttons'
import ButtonFill from '../../components/buttons/fill'
import HeaderBack from '../../components/headers/back'
import Moment from 'moment'
import { POST, GET } from '../../services/ApiServices'
import { getProfile, formatPrice } from '../../utils/Global'

export default class Reward extends Component {
  _isMounted = false

  constructor(props) {
    super(props)
  
    this.state = {
      userdata: null,
    }
  }

  async componentDidMount() {
    this._isMounted = true

    // GET USER
    await getProfile().then((item) => {
      this.setState({ userdata: item })
    })
  }

  async submit() {
    await POST('tukar/poin', {
      users_id: this.state.userdata.id,
      reward_id: this.props.item.id
    }, true).then(async (result) => {
      if(typeof result.error !== 'undefined'){
        this.refs.toast_error.show(result.message, 1000)
        return false
      }
      this.refs.toast_success.show('Penukaran Poin Berhasil.', 1000)
      Actions.reward_saya()
    }).catch(error => {
      console.log(error)
    })
  }

	render() {
		return(
      <View style={styles.container}>

        <HeaderBack title="Poin & Reward" />
        
        <View style={styles.container_form}>
          <Grid>
            <Row style={{marginBottom: 10, height: 200}}>
              <ImageBackground
                source={{uri: this.props.item.image}}
                style={{width: '100%', height: '100%'}}
                imageStyle={{borderRadius: 10, resizeMode: "cover"}}
              >
              </ImageBackground>
            </Row>
            <Row style={{marginBottom: 10, height: 10}}>
              <Col>
                <Text style={[styles.titleBoldBlack]}>{this.props.item.tittle}</Text>
              </Col>
            </Row>
            <Row style={{marginBottom: 10, height: 15}}>
              <Col>
                <Text style={[styles.title]}>Poin Redeem : {this.props.item.poin_redeem}</Text>
              </Col>
            </Row>
            <Row style={{marginBottom: 10, height: 75}}>
              <Col>
                <Text style={[styles.title]}>{this.props.item.description}</Text>
              </Col>
            </Row>
          </Grid>
        </View>
        <View style={styles.container_bottom}>
          <ButtonFill btnLabel='Tukar Poin' onPress={() => this.submit()} />
        </View>
        
        <StatusBar backgroundColor={'#6EAAB2'} barStyle={"light-content"} />
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
    fontSize: 21
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
  titleBoldRed: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: '#F63F3F',
    fontSize: 16,
  },
});
