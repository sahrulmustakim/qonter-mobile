import React, { Component } from 'react'
import { StyleSheet, AsyncStorage, StatusBar, Text, View, ScrollView, RefreshControl, TouchableOpacity, Dimensions, Image, TextInput } from 'react-native'
import { Grid, Col, Form, Item, Input, Label, Icon, Row, Spinner } from 'native-base'
import { Actions } from 'react-native-router-flux'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import Toast from 'react-native-easy-toast'
import { Colors, Typography } from '_styles'
import Button from '_components/buttons'
import HeaderBack from '_headers/back'
import Moment from 'moment'
import { POST, GET } from '_services/ApiServices'
import { getProfile, formatPrice } from '_utils/Global'
import Pusher from 'pusher-js/react-native'
import { server_api } from '_configs/env'

export default class Chat extends Component {
  _isMounted = false
  pusher = null
  channel = null

  constructor(props) {
    super(props)
  
    this.state = {
      pesanList: [],
      pesanText: null,
      loading: false,
      userdata: null,
      refreshing: false,
    }
  }

  async componentDidMount() {
    this._isMounted = true
    var self = this

    // GET USER
    await getProfile().then((item) => {
      this.setState({ userdata: item })

      // Pusher Chat
      Pusher.logToConsole = false
      this.pusher = new Pusher(server_api.pusher_key, {
        cluster: 'ap1'
      })

      this.channel = this.pusher.subscribe('chat-'+item.id)

      // Pusher Refresh Chat
      var page = self
      this.channel.bind('refresh', async function() {
        await GET('chats/'+page.state.userdata.id, {}, true).then(async (result) => {
          page.setState({ pesanList: result })
        }).catch(error => {
          console.log(error)
        })
      })
    })

    // CHATS
    await GET('chats/'+this.state.userdata.id, {}, true).then(async (result) => {
      this.setState({ pesanList: result })
    }).catch(error => {
      console.log(error)
    })
  }

  _onRefresh = () => {
    Actions.refresh({key: Moment.utc().format('YYYYMMDDhhmmss')})
  }

  async sendChat(){
    if(this.state.pesanText == '' || this.state.pesanText == null){
      this.refs.toast_error.show('Silahkan tulis pesan Anda..', 1000)
    }else{
      this.setState({ loading: true })

      await POST('chat', {
        users_id: this.state.userdata.id,
        message: this.state.pesanText
      }, true).then(async (result) => {

        await GET('chats/'+this.state.userdata.id, {}, true).then(async (result) => {
          this.setState({ pesanList: result })
        }).catch(error => {
          console.log(error)
        })

        this.setState({ pesanText: null })
        this.pesanText.clear()
        this.setState({ loading: false })
      }).catch(error => {
        this.refs.toast_error.show(error.message, 1000)
        this.setState({ loading: false })
      })
    }
  }

	render() {
    var listdata = [];
    for(let i = 0; i < this.state.pesanList.length; i++){
      if(this.state.pesanList[i].type == 'admin'){
        listdata.push(
          <View key={i} style={styles.table}>
            <View style={styles.columnLeft}>
              <Text style={styles.titleLeft}>{'Admin :\n\n'+this.state.pesanList[i].message}</Text>
              <Text style={styles.titleDateLeft}>{Moment.utc(this.state.pesanList[i].created_at).format('YYYY/MM/DD hh:mm')}</Text>
            </View>
          </View>
        )
      }else{
        listdata.push(
          <View key={i} style={styles.table}>
            <View style={styles.columnRight}>  
              <Text style={styles.titleRight}>{this.state.pesanList[i].message}</Text>
              <Text style={styles.titleDateRight}>{Moment.utc(this.state.pesanList[i].created_at).format('YYYY/MM/DD hh:mm')}</Text>
            </View>
          </View>
        )
      }
    }
		return(
      <View style={styles.container}>

        <HeaderBack title="Chat Admin" />
        
        <ScrollView 
          ref={ref => {this.scrollView = ref}}
          onContentSizeChange={() => this.scrollView.scrollToEnd({animated: true})}
          style={{marginBottom: 70}}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this._onRefresh}
            />
          }>

          <View style={styles.containerMiddle}>
            { listdata }
          </View>
        </ScrollView>

        <View style={styles.container_button}>
          <View style={styles.table}>
            <View style={styles.columnBottomLeft}>
              <TextInput ref={(input) => { this.pesanText = input; }}
                onChangeText = {(value) => this.setState({pesanText: value})} 
                placeholder="Ketik untuk menulis pesan..." 
                style={styles.textInput} />
            </View>
            <View style={styles.columnBottomRight}>
              <TouchableOpacity disabled={this.state.loading} onPress={() => this.sendChat()}>
                <Image style={styles.button} source={require('_assets/images/button-chat.png')}/>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <StatusBar backgroundColor={Colors.PRIMARY} barStyle={"light-content"} />
        <Toast ref="toast_error" style={{backgroundColor:Colors.ALERT, width: '90%'}} position='top' positionValue={35} />
        <Toast ref="toast_success" style={{backgroundColor:Colors.SUCCESS, width: '90%'}} position='top' positionValue={35} />
        {/* <KeyboardSpacer/> */}
      </View>	
    )
	}
}

const screenWidth = Math.round(Dimensions.get('window').width)
const ratio = screenWidth/185
const styles = StyleSheet.create({
  container : {
    flex: 1,
    backgroundColor: '#E5E5E5'
  },
  containerTop: {
    alignItems: 'center',
    marginTop: '30%'
  },
	banner: {
		height: (175 * ratio) - 175,
    width: screenWidth - 225,
    marginBottom: 50,
	},
  containerMiddle: {
  	padding: 20,
    alignItems: 'center',
    alignContent: 'center'
  },
  table: {
    flexGrow: 1,
    alignItems: 'flex-start',
    alignContent: 'flex-start',
    flexDirection: 'row'
  },
  columnLeft: {
    width: '100%',
    alignItems: 'flex-start',
    alignContent: 'flex-start'
  },
  columnRight: {
    width: '100%',
    alignItems: 'flex-end',
    alignContent: 'flex-end'
  },
  columnBottomLeft: {
    width: '85%',
    alignItems: 'flex-start',
    alignContent: 'flex-start'
  },
  columnBottomRight: {
    width: '15%',
    alignItems: 'flex-end',
    alignContent: 'flex-end'
  },
  titleLeft: {
    color: '#000',
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 15,
    paddingBottom: 25,
    marginBottom: 15,
    minWidth: 120
  },
  titleRight: {
    color: '#FFF',
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    backgroundColor: '#55B748',
    borderRadius: 8,
    padding: 15,
    paddingBottom: 25,
    marginBottom: 15,
    minWidth: 120
  },
  titleDateRight: {
    position: 'absolute',
    right: 15,
    bottom: 20,
    color: '#FFF',
    fontFamily: 'Poppins-Regular',
  	fontSize: 10
  },
  titleDateLeft: {
    position: 'absolute',
    left: 15,
    bottom: 20,
    color: '#151522',
    fontFamily: 'Poppins-Regular',
  	fontSize: 10
  },
  container_button: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    flexGrow: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    flexDirection: 'row',
    width: screenWidth,
    backgroundColor: '#FFF',
    height: 70,
    padding: 10
  },
  textInput:{
    height: 50,
    width: '100%',
    fontFamily: 'Poppins-Regular',
    borderRadius: 5,
    borderWidth: 1,
    backgroundColor: '#EEEEEE',
    borderColor: '#EEEEEE',
    paddingLeft: 15
  },
  button: {
    height: 50,
    width: 50,
    resizeMode: 'stretch',
  }
});
