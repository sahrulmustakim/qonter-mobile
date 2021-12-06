import React, { Component } from 'react'
import { StyleSheet, AsyncStorage, StatusBar, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native'
import { Grid, Col, Row, Icon } from 'native-base'
import { Actions } from 'react-native-router-flux'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import Clipboard from "@react-native-community/clipboard"
import Toast from 'react-native-easy-toast'
import { Colors, Typography } from '../../styles'
import HeaderBack from '../../components/headers/back'
import Moment from 'moment'
import { POST, GET } from '../../services/ApiServices'

export default class Promo extends Component {
  _isMounted = false

  constructor(props) {
    super(props)
  
    this.state = {
      promos: [],
    }
  }

  async componentDidMount() {
    this._isMounted = true

    // PROMO
    await GET('promo/slide', {}, true).then(async (result) => {
      this.setState({ promos: result.promo })
    }).catch(error => {
      console.log(error)
    })
  }

  async next() {
    Actions.reset('menus')
  }

  copyText(text) {
    Clipboard.setString(text)
    this.refs.toast_success.show('Berhasil di salin', 1000)
  }

  renderItem(item, index){
    return (
      <View key={index} style={styles.box}>
        <Image style={{ width: '100%', height: 138, borderRadius: 10, resizeMode: "cover" }} source={{uri: item.image}} />
        <Grid style={{padding: 5}}>
          <Row>
            <Col size={1} style={{alignItems: "center", padding: 5}}>
              <Image style={{ width: 24, height: 24, resizeMode: "contain" }} source={require('../../assets/images/stopwatch.png')} />
            </Col>
            <Col size={9} style={{paddingTop: 2}}>
              <Text style={styles.subtitle}>Periode Promo</Text>
              <Text style={styles.title}>{Moment(item.start_date).format('DD MMMM YYYY')} - {Moment(item.end_date).format('DD MMMM YYYY')}</Text>
            </Col>
          </Row>
          <Row style={{paddingTop: 10, paddingBottom: 5}}>
            <Col size={1} style={{alignItems: "center", padding: 5}}>
              <Image style={{ width: 24, height: 24, resizeMode: "contain" }} source={require('../../assets/images/coupon.png')} />
            </Col>
            <Col size={6.5} style={{paddingTop: 2}}>
              <Text style={styles.subtitle}>Kode Promo</Text>
              <Text style={styles.title}>{item.code}</Text>
            </Col>
            <Col size={2.5} style={{paddingTop: 2, justifyContent: "center", alignItems: "center"}}>
              <TouchableOpacity style={styles.buttonCopy} onPress={() => this.copyText(item.code)}>
                <Text style={styles.labelBtn}>Salin Kode</Text>
              </TouchableOpacity>
            </Col>
          </Row>
        </Grid>
      </View>
    )
  }

	render() {
		return(
      <ScrollView style={styles.container} scrollEnabled={false}>

        <HeaderBack title="Promo" />
        
        <View style={styles.container_form}>
          {this.state.promos.map((item, index) => this.renderItem(item, index))}
        </View>

        <StatusBar backgroundColor={Colors.PRIMARY} barStyle={"light-content"} />
        <Toast ref="toast_error" style={{backgroundColor:Colors.ALERT, width: '90%'}} position='top' positionValue={35} />
        <Toast ref="toast_success" style={{backgroundColor:Colors.SUCCESS, width: '90%'}} position='top' positionValue={35} />
        <KeyboardSpacer/>
      </ScrollView>	
    )
	}
}

const styles = StyleSheet.create({
  container : {
    flex: 1,
  },
  subtitle : {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontWeight: Typography.FONT_WEIGHT_REGULAR,
    color: '#5F5F5F',
    fontSize: 12,
  },
  title : {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: Colors.PRIMARY,
    fontSize: 14,
  },
  container_form : {
    margin: 15,
  },
  box: {
    width: '100%',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D6D6D6',
    marginBottom: 15,
  },
  buttonCopy: {
    borderRadius: 3,
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 10,
    paddingRight: 10,
  },
  labelBtn: {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontWeight: Typography.FONT_WEIGHT_REGULAR,
    color: Colors.PRIMARY,
    fontSize: 12,
    textAlign: "center"
  }
});
