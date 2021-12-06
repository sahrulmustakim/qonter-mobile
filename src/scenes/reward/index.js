import React, { Component, useState } from 'react'
import { StyleSheet, AsyncStorage, StatusBar, Text, View, ScrollView, TouchableOpacity, Dimensions, Image, ImageBackground } from 'react-native'
import { Grid, Col, Form, Item, Input, Label, Icon, Row } from 'native-base'
import { Actions } from 'react-native-router-flux'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import Toast from 'react-native-easy-toast'
import { Colors, Typography } from '../../styles'
import Button from '../../components/buttons'
import ButtonColor from '../../components/buttons/color'
import HeaderFill from '../../components/headers/fill'
import Moment from 'moment'
import { POST, GET } from '../../services/ApiServices'
import { getProfile, formatPrice } from '../../utils/Global'

export default class Reward extends Component {
  _isMounted = false

  constructor(props) {
    super(props)
  
    this.state = {
      userdata: null,
      profile: null,
      nominal: 0,
      rewards: [],
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
      id: this.state.userdata.id
    }, true).then(async (result) => {
      this.setState({ profile: result })
    }).catch(error => {
      console.log(error)
    })

    // POIN
    await GET('user/point/'+this.state.userdata.id, {}, true).then(async (result) => {
      this.setState({ nominal: result.amount })
    }).catch(error => {
      console.log(error)
    })

    // REWARD
    await GET('reward', {}, true).then(async (result) => {
      this.setState({ rewards: result })
    }).catch(error => {
      console.log(error)
    })
  }

  render() {
    const deviceWidth = Dimensions.get('window').width;
		return(
      <View style={styles.container}>

        <HeaderFill title="Poin & Reward" bgcolor="#6EAAB2" />
        
        <View style={{backgroundColor: '#6EAAB2', height: 85, padding: 20}}>
          <Grid>
            <Col size={7} style={{justifyContent: "center"}}>
              <Label style={[styles.labelForm, {color: '#FFF'}]}>Total</Label>
              <Label style={[styles.titleBigBlack, {color: '#FFF'}]}>{this.state.nominal} Poin</Label>
            </Col>
            <Col size={5} style={{alignItems: "flex-end", justifyContent: "center"}}>
              <ButtonColor bgColor='#FFF' textColor='#6EAAB2' btnLabel='History' onPress={() => Actions.reward_saya()} />
            </Col>
          </Grid>
        </View>

        <View style={styles.container_form}>
          <ScrollView scrollEnabled={true}>
          
            <Grid>
              <Row style={{marginBottom: 5, marginTop: 5}}>
                <Col>
                  <Text style={[styles.titleBoldBlack, {paddingBottom: 5}]}>Daftar Reward Abata</Text>
                </Col>
              </Row>
              { this.state.rewards.map((item, key) => {
                return (
                  <Row key={key} style={{marginBottom: 10, height: 138}}>
                    <TouchableOpacity onPress={() => Actions.reward_detail({ item: item })}>
                      <Image style={{ width: deviceWidth-30, height: 128, resizeMode: "cover", borderRadius: 10 }} source={{uri: item.image}} />
                      
                      <Grid style={{position: "absolute", top: 0}}>
                        <Col size={8} style={{padding: 10, alignItems: "flex-start"}}>
                          <Text style={{color: '#000', backgroundColor: '#FFF', paddingTop: 4, paddingBottom: 4, paddingLeft: 8, paddingRight: 8, borderRadius: 5, fontWeight: "bold", fontSize: 14}}>
                            {item.tittle}
                          </Text>
                        </Col>
                        <Col size={4} style={{padding: 10, alignItems: "flex-end"}}>
                          <Text style={{color: Colors.PRIMARY, backgroundColor: '#FFF', paddingTop: 4, paddingBottom: 4, paddingLeft: 8, paddingRight: 8, borderRadius: 5, fontWeight: "bold", fontSize: 12}}>
                            {item.poin_redeem} Poin
                          </Text>
                        </Col>
                      </Grid>
                    </TouchableOpacity>
                  </Row>
                );
              })} 
            </Grid>

          </ScrollView>
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
