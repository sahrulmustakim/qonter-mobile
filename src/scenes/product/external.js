import React, { Component } from 'react'
import { StyleSheet, AsyncStorage, StatusBar, Text, View, ScrollView, TouchableOpacity, Dimensions, Image, WebView } from 'react-native'
import { Grid, Col, Form, Item, Input, Label, Icon, Row } from 'native-base'
import { Actions } from 'react-native-router-flux'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import Toast from 'react-native-easy-toast'
import { Colors, Typography } from '../../styles'
import HeaderBack from '../../components/headers/back'
import Button from '../../components/buttons/index'
import ButtonFill from '../../components/buttons/fill'
import { GET } from '../../services/ApiServices'

export default class ProductCode extends Component {
  _isMounted = false

  constructor(props) {
    super(props)
  
    this.state = {
      link: null
    }
  }

  async componentDidMount() {
    this._isMounted = true

    await GET('products/external', {}, true).then((result) => {
      this.setState({ link: result[0] })
    }).catch(error => {
      console.log(error)
    })
  }

  async done() {
    Actions.reset('menus')
  }

	render() {
		return(
      <View style={styles.container}>

        <HeaderBack title={this.props.product.name} />
        
        {
          (this.state.link != null && typeof this.state.link.url !== 'undefined') ? 
            <WebView
              source={{
                uri: this.state.link.url
              }}
              style={{ width: '100%', height: '100%' }}
            />
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
    flex: 1,
  },
  container_top : {
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 25,
    paddingRight: 25,
    backgroundColor: '#F1F4F9',
    width: '100%'
  },
  container_form : {
    padding: 25
  },
  container_button : {
    paddingTop: 5,
    width: '100%',
    alignItems: "center"
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
    fontSize: 20
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
  linkTitle: {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontWeight: Typography.FONT_WEIGHT_REGULAR,
    color: '#333333',
    fontSize: 14,
    textDecorationLine: "underline"
  },
  linkTitleGreen: {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontWeight: Typography.FONT_WEIGHT_REGULAR,
    color: Colors.PRIMARY,
    fontSize: 14,
    textDecorationLine: "underline"
  },
});
