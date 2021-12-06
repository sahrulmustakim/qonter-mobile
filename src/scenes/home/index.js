import React, { Component } from 'react';
import { Dimensions, StyleSheet, StatusBar, View, RefreshControl, Image, TouchableOpacity, BackHandler, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Flex, VStack, HStack, Button, IconButton, Icon, Text, Center, Badge, Box, Pressable, FlatList, Avatar, Spacer } from 'native-base';
import MaterialIcons from 'react-native-vector-icons/dist/MaterialIcons';
import { Actions } from 'react-native-router-flux';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import Toast from 'react-native-easy-toast';
import Colors from '../../styles/colors';
import Typography from '../../styles/typography';
import HeaderMenu from '../../components/headers/menu';
import Footer from '../../components/footer';
import Slider from '../../components/promo/slider';
import ApiServices from '../../services/ApiServices';
import global from '../../utils/Global';
import Moment from 'moment';
import NetInfo from '@react-native-community/netinfo';

export default class Home extends Component {
  constructor(props) {
    super(props)
  
    this.state = {
      products: [],
      sliders: [],
      info_covid: [],
      info: [],
      promo: [],
      productsRow: 5,
      saldo: 0,
      dompet: 0,
      userdata: null,
      profile: null,
      dompet_status: 'true',
      isConnected: false
    }
  }

  async componentDidMount() {
    const inet = await NetInfo.fetch()
    this.setState({ isConnected: inet.isConnected })
    // console.log(inet)

    // if(inet.isConnected){
      // GET USER
      await global.getProfile().then((item) => {
        this.setState({ userdata: item })
      })

      // GET PROFILE
      await ApiServices.POST('profile', {
        id: this.state.userdata.id
      }, true).then(async (result) => {
        // console.log(JSON.stringify(result))
        if(result.user[0].devices.length == 0){
          await AsyncStorage.clear()
          Actions.reset('login')
        }else if(result.user[0].blokir_login == 1 || result.user[0].signature == null){
          await AsyncStorage.clear()
          Actions.reset('login')
        }
        else if(result.user[0].verif.pin == null){
          Actions.reset('login_pin')
        }
        this.setState({ profile: result })
        
        // SALDO
        if(result.user[0].balances != null){
          this.setState({ saldo: result.user[0].balances.amount })
        }
        
        // DOMPET
        if(result.user[0].paylaters != null){
          this.setState({ dompet: result.user[0].paylaters.amount })
          this.setState({ dompet_status: result.user[0].paylaters.status })
        }
      }).catch(async (error) => {
        console.log(JSON.stringify(error))
        this.refs.toast_error.show('Silahkan periksa koneksi Anda', 3000)
        // setTimeout(() => {
        //   BackHandler.exitApp()
        // }, 3000);
      })
    // }else{
    //   this.refs.toast_error.show('Silahkan periksa koneksi Anda', 3000)
    //   // setTimeout(() => {
    //   //   BackHandler.exitApp()
    //   // }, 3000);
    // }

    // PRODUCTS
    await ApiServices.GET('menu', {}, true).then(async (result) => {
      let products = []
      result.map((item, index) => {
        if(index <= 9){
          products.push(item)
        }
      })
      this.setState({ products: products })
      // console.log(result)
    }).catch(error => {
      console.log('menu: '+error)
    })

    // SLIDER
    await ApiServices.GET('slider', {}, true).then(async (result) => {
      this.setState({ sliders: result.slider })
    }).catch(error => {
      console.log('slider: '+error)
    })

    // INFO
    await ApiServices.GET('info/slide', {}, true).then(async (result) => {
      let info_covid = []
      let info = []
      await result.info.map((item, index) => {
        if(item.category == 'info covid'){
          info_covid.push(item)
        }else{
          info.push(item)
        }
      })
      this.setState({ info_covid: info_covid })
      this.setState({ info: info })
    }).catch(error => {
      console.log('info: '+error)
    })

    // PROMO
    await ApiServices.GET('promo/slide', {}, true).then(async (result) => {
      this.setState({ promo: result.promo })
    }).catch(error => {
      console.log('promo: '+error)
    })

    // CLEAR TRX
    await AsyncStorage.removeItem('request_data')
    await AsyncStorage.removeItem('promo_data')
    await AsyncStorage.removeItem('promo_code')
    await AsyncStorage.removeItem('payment_method')
    await AsyncStorage.removeItem('transaction_request')
    await AsyncStorage.removeItem('transaction_response')
    await AsyncStorage.removeItem('postpaid_data')

    await AsyncStorage.removeItem('tf_request_data')
    await AsyncStorage.removeItem('tf_promo_data')
    await AsyncStorage.removeItem('tf_promo_code')
    await AsyncStorage.removeItem('tf_payment_method')
    await AsyncStorage.removeItem('tf_product_data')
    await AsyncStorage.removeItem('tf_bank_data')
    await AsyncStorage.removeItem('tf_response_data')

    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress)
  }

  handleBackPress() {
    if(Actions.currentScene == 'home'){
      BackHandler.exitApp()
      return true
    }else{
      return false
    }
  }

  _onRefresh = () => {
    Actions.refresh({key: Moment.utc().format('YYYYMMDDhhmmss')})
  }

  displayProducts() {
    let arr = this.state.products.reduce((acc, item, idx) => {
      let group = acc.pop();
      if (group.length == this.state.productsRow) {
        acc.push(group);
        group = [];
      }
      group.push(item);
      acc.push(group);
      return acc;
    }, [[]]);

    return arr.map((item, index) => {
      return (
        <HStack justifyContent="space-between" key={index}>
          { item.map(
            (data, subindex) => 
              <Center w={{ base: '20%' }} key={subindex} style={{alignItems: "center", alignContent: "center", marginTop: 10}}>
                {
                  (data.type == 'prepaid' || data.type == 'postpaid') ? 
                    <TouchableOpacity style={{alignItems: "center", alignContent: "center"}} onPress={() => (data.route == '') ? false : Actions.product_request({ product: data })}>
                      <Image style={{ width: 36, height: 36, resizeMode: "contain" }} source={{uri: data.icon}} />
                      <Text style={{textAlign: "center", paddingTop: 10, marginBottom: 10, height: 50}}>{data.name}</Text>
                    </TouchableOpacity>
                  : false
                }
                {
                  (data.type == 'transfer') ? 
                    <TouchableOpacity style={{alignItems: "center", alignContent: "center"}} onPress={() => (data.route == '') ? false : Actions.product_transfer_request({ product: data })}>
                      <Image style={{ width: 36, height: 36, resizeMode: "contain" }} source={{uri: data.icon}} />
                      <Text style={{textAlign: "center", paddingTop: 10, marginBottom: 10, height: 50}}>{data.name}</Text>
                    </TouchableOpacity>
                  : false
                }
                {
                  (data.type == 'external') ? 
                    <TouchableOpacity style={{alignItems: "center", alignContent: "center"}} onPress={() => (data.route == '') ? false : Actions.product_external({ product: data })}>
                      <Image style={{ width: 36, height: 36, resizeMode: "contain" }} source={{uri: data.icon}} />
                      <Text style={{textAlign: "center", paddingTop: 10, marginBottom: 10, height: 50}}>{data.name}</Text>
                    </TouchableOpacity>
                  : false
                }
              </Center>
            )
          }
        </HStack>
      );
    });
  }

  renderBanner(item, index) {
    return (
      <TouchableOpacity key={index} onPress={() => Actions.promo_list()}>
        <Image style={styles.banner} source={{uri: item.image}} />
      </TouchableOpacity>
    )
  }

	render() {
		return(
      <View style={[styles.container, {backgroundColor: 'white'}]}>

        <HeaderMenu />

        <ScrollView 
          ref={ref => {this.scrollView = ref}}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this._onRefresh}
            />
          }
          style={[styles.container, {marginBottom: 60}]} 
          scrollEnabled={true}>

          <Slider sliders={this.state.sliders} />

          <View style={styles.boxSaldo}>
            {
              (this.state.userdata != null && this.state.userdata.role_id == 5) ? 
              <HStack>
                <Center w={{ base: '50%' }} style={{borderRightWidth: 1, borderRightColor: '#CFCFCF', paddingLeft: 3, paddingRight: 10}}>
                  <TouchableOpacity onPress={() => Actions.wallet()}>
                    <HStack>
                      <Center w={{ base: '25%' }} style={{alignItems: "center", padding: 5}}>
                        <Image style={{ width: 25, height: 25, resizeMode: "contain" }} source={require('../../assets/images/cashin.png')} />
                      </Center>
                      <Center w={{ base: '87%' }} style={{paddingTop: 2, alignItems: 'flex-start'}}>
                        <Text style={styles.labelBox}>Saldo</Text>
                        <Text style={styles.labelPrice}>Rp {global.formatPrice(this.state.saldo)}</Text>
                      </Center>
                    </HStack>
                  </TouchableOpacity>
                </Center>
                <Center w={{ base: '50%' }} style={{paddingLeft: 10, paddingRight: 10}}>
                  <TouchableOpacity onPress={() => Actions.paylater()}>
                    <HStack>
                      <Center w={{ base: '25%' }} style={{alignItems: "center", padding: 5}}>
                        <Image style={{ width: 25, height: 25, resizeMode: "contain" }} source={require('../../assets/images/cashout.png')} />
                      </Center>
                      <Center w={{ base: '75%' }} style={{paddingTop: 2, alignItems: 'flex-start'}}>
                        <Text style={styles.labelBox}>Dompet Abata</Text>
                        <Text style={styles.labelPrice}>
                          Rp {global.formatPrice(this.state.dompet)} {' '}
                          {
                            (this.state.dompet_status == 'false') ? 
                            <Text style={{color: '#cc4b37', fontSize: 10, fontWeight: "bold"}}>Diblokir</Text>
                            : false
                          }
                        </Text>
                      </Center>
                    </HStack>
                  </TouchableOpacity>
                </Center>
              </HStack>
              : 
              <TouchableOpacity onPress={() => Actions.wallet()}>
                <HStack>
                  <Center w={{ base: '25%' }} style={{alignItems: "center", padding: 5}}>
                    <Image style={{ width: 25, height: 25, resizeMode: "contain" }} source={require('../../assets/images/cashin.png')} />
                  </Center>
                  <Center w={{ base: '75%' }} style={{paddingTop: 2, alignItems: 'flex-start'}}>
                    <Text style={styles.labelBox}>Saldo</Text>
                    <Text style={styles.labelPrice}>Rp {global.formatPrice(this.state.saldo)}</Text>
                  </Center>
                </HStack>
              </TouchableOpacity>
            }
          </View>

          <View style={{right: 0, width: '100%', alignItems: 'flex-end'}}>
            <TouchableOpacity onPress={() => Actions.product_list()}>
              <HStack alignItems='flex-end'>
                <Text style={{color: Colors.PRIMARY, fontWeight: "bold"}}>Semua Produk</Text>
                <Icon size="sm" as={
                    <MaterialIcons name='keyboard-arrow-right' />
                  } 
                  style={{
                    paddingTop: 4
                  }}
                  color={Colors.PRIMARY} />
              </HStack>
            </TouchableOpacity>
          </View>

          <View style={{width: '100%', padding: 10}}>
            { this.displayProducts() }
          </View>

          {
            (this.state.info_covid.length > 0)
            ?
            <View style={{width: '100%', padding: 10}}>
              <Text style={styles.title}>{this.state.info_covid[0].name}</Text>
              <Text style={styles.subtitle}>{this.state.info_covid[0].description}</Text>
              <Image style={styles.banner} source={{uri: this.state.info_covid[0].image}} />
            </View>
            :
            <View style={{width: '100%', padding: 10}}>
              <Text style={styles.titleBig}>Info Covid 19</Text>
            </View>
          }

        </ScrollView>

        <Footer />

        <StatusBar backgroundColor={Colors.PRIMARY} barStyle={"light-content"} />
        <Toast ref="toast_error" style={{backgroundColor:Colors.ALERT, width: '90%'}} position='top' positionValue={35} />
        <Toast ref="toast_success" style={{backgroundColor:Colors.SUCCESS, width: '90%'}} position='top' positionValue={35} />
      </View>	
    )
	}
}

const BannerWidth = Dimensions.get('window').width - 30
const BannerHeight = 180
const styles = StyleSheet.create({
  container : {
    flex: 1
  },
  titleBig : {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: Colors.PRIMARY,
    fontSize: 14,
    marginBottom: 10
  },
  title : {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: '#000',
    fontSize: 12,
    marginBottom: 5,
  },
  subtitle : {
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontWeight: Typography.FONT_WEIGHT_REGULAR,
    color: '#353535',
    fontSize: 12,
    marginBottom: 15,
  },
  banner: { 
    width: BannerWidth,
    height: BannerHeight,
    marginBottom: 10,
    resizeMode: 'contain' 
  },
  container_form : {
    marginTop: 15,
    marginLeft: 15,
    marginRight: 15,
    paddingBottom: 75
  },
  boxSaldo: {
    margin: 10,
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
    borderRadius: 5,
    padding: 7
  },
  labelBox: {
    color: '#000', 
    fontSize: 11, 
    fontWeight: "bold"
  },
  labelPrice: {
    color: Colors.PRIMARY, 
    fontWeight: "bold", 
    fontSize: 14, 
    paddingBottom: 4
  }
});
