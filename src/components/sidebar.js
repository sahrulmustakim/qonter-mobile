import React, {Component} from 'react';
import { StyleSheet, Alert, Image, View, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VStack, HStack, Button, IconButton, Icon, Text, Center, Badge, Box, Pressable, FlatList, Avatar, Spacer, ScrollView } from 'native-base';
import MaterialIcons from 'react-native-vector-icons/dist/MaterialIcons';
import { Actions } from 'react-native-router-flux';
import Colors from '../styles/colors';
import Typography from '../styles/typography';
import global from '../utils/Global';

export default class SideBar extends Component {
  _isMounted = false

  constructor(props) {
    super(props)

    this.state = {
      userdata: null
    }
  }

  async componentDidMount() {
    this._isMounted = true
    
    // GET USER
    await global.getProfile().then((item) => {
      this.setState({ userdata: item })
      // console.log(item)
    })
  }
  
  async logout() {
    await AsyncStorage.clear()
		Actions.reset('login')
  }

  confirmLogout() {
    Alert.alert(
      'Konfirmasi',
      'Apakah Anda yakin akan keluar ?',
      [
        {
          text: 'Batal',
          style: 'cancel',
        },
        {text: 'OK', onPress: () => this.logout()},
      ],
      {cancelable: false},
    )
  }

  goTo(route){
    if(route == 'logout'){
      Actions.drawerClose()
      this.confirmLogout()
    }else{
      Actions.drawerClose()
      Actions[route].call()
    }
  }

  componentWillUnmount() {
    this._isMounted = false
  }
  
  render() {
    let items = []
    if(this.state.userdata != null && this.state.userdata.role_id == 5){
      items = [{
        title: 'Daftar Harga',
        icon: 'list-alt',
        key: 'pricelist',
        route: 'pricelist'
      },{
        title: 'Pengajuan Paylater',
        icon: 'account-balance-wallet',
        key: 'paylater_request',
        route: 'paylater_request'
      },{
        title: 'Poin & Reward',
        icon: 'local-play',
        key: 'reward',
        route: 'reward'
      },{
        title: 'Notifikasi',
        icon: 'circle-notifications',
        key: 'notification',
        route: 'notification'
      },{
        title: 'Cetak Struk',
        icon: 'print',
        key: 'print',
        route: 'print'
      },{
        title: 'Riwayat Transaksi',
        icon: 'history',
        key: 'history',
        route: 'history'
      },{
        title: 'Kode Semua Produk',
        icon: 'qr-code',
        key: 'productcode',
        route: 'productcode'
      },{
        title: 'Device Saya',
        icon: 'phonelink-setup',
        key: 'device',
        route: 'device'
      },{
        title: 'Reset Pin',
        icon: 'reset-tv',
        key: 'reset_pin',
        route: 'reset_pin'
      },{
        title: 'Customer Service',
        icon: 'chat',
        key: 'customerservice',
        route: 'customerservice'
      },{
        title: 'Tentang Kami',
        icon: 'info',
        key: 'aboutus',
        route: 'aboutus'
      },{
        title: 'Keluar',
        icon: 'logout',
        key: 'logout',
        route: 'logout'
      }]
    }else if(this.state.userdata != null && (this.state.userdata.role_id == 1)){
      items = [{
        title: 'Daftar Harga',
        icon: 'list-alt',
        key: 'pricelist',
        route: 'pricelist'
      },{
        title: 'Persetujuan Qonter',
        icon: require('../assets/images/currency.png'),
        key: 'sales_approval',
        route: 'sales_approval'
      },{
        title: 'Markup',
        icon: require('../assets/images/currency.png'),
        key: 'sales_markup',
        route: 'sales_markup'
      },{
        title: 'Konter',
        icon: require('../assets/images/icon-contact.png'),
        key: 'sales_konter',
        route: 'sales_konter'
      },{
        title: 'Tagihan Konter',
        icon: require('../assets/images/currency.png'),
        key: 'kolektor_approval',
        route: 'kolektor_approval'
      },{
        title: 'Setoran Saya',
        icon: require('../assets/images/currency.png'),
        key: 'sales_setoran',
        route: 'sales_setoran'
      },{
        title: 'Tambah Konter',
        icon: require('../assets/images/icon-contact.png'),
        key: 'sales_register',
        route: 'sales_register'
      },{
        title: 'Poin & Reward',
        icon: require('../assets/images/reward.png'),
        key: 'reward',
        route: 'reward'
      },{
        title: 'Notifikasi',
        icon: require('../assets/images/notifications.png'),
        key: 'notification',
        route: 'notification'
      },{
        title: 'Cetak Struk',
        icon: require('../assets/images/printer.png'),
        key: 'print',
        route: 'print'
      },{
        title: 'Riwayat Transaksi',
        icon: require('../assets/images/history.png'),
        key: 'history',
        route: 'history'
      },{
        title: 'Kode Referal',
        icon: require('../assets/images/barcode.png'),
        key: 'referal',
        route: 'referal'
      },{
        title: 'Kode Semua Produk',
        icon: require('../assets/images/code.png'),
        key: 'productcode',
        route: 'productcode'
      },{
        title: 'Device Saya',
        icon: require('../assets/images/icon-phone.png'),
        key: 'device',
        route: 'device'
      },{
        title: 'Reset Pin',
        icon: require('../assets/images/stopwatch.png'),
        key: 'reset_pin',
        route: 'reset_pin'
      },{
        title: 'Customer Service',
        icon: require('../assets/images/question.png'),
        key: 'customerservice',
        route: 'customerservice'
      },{
        title: 'Tentang Kami',
        icon: require('../assets/images/info.png'),
        key: 'aboutus',
        route: 'aboutus'
      },{
        title: 'Keluar',
        icon: require('../assets/images/exit.png'),
        key: 'logout',
        route: 'logout'
      }]
    }else if(this.state.userdata != null && (this.state.userdata.role_id == 3)){
      items = [{
        title: 'Daftar Harga',
        icon: require('../assets/images/list.png'),
        key: 'pricelist',
        route: 'pricelist'
      },{
        title: 'Persetujuan Qonter',
        icon: require('../assets/images/currency.png'),
        key: 'sales_approval',
        route: 'sales_approval'
      },{
        title: 'Konter',
        icon: require('../assets/images/icon-contact.png'),
        key: 'sales_konter',
        route: 'sales_konter'
      },{
        title: 'Tambah Konter',
        icon: require('../assets/images/icon-contact.png'),
        key: 'sales_register',
        route: 'sales_register'
      },{
        title: 'Poin & Reward',
        icon: require('../assets/images/reward.png'),
        key: 'reward',
        route: 'reward'
      },{
        title: 'Notifikasi',
        icon: require('../assets/images/notifications.png'),
        key: 'notification',
        route: 'notification'
      },{
        title: 'Cetak Struk',
        icon: require('../assets/images/printer.png'),
        key: 'print',
        route: 'print'
      },{
        title: 'Riwayat Transaksi',
        icon: require('../assets/images/history.png'),
        key: 'history',
        route: 'history'
      },{
        title: 'Kode Referal',
        icon: require('../assets/images/barcode.png'),
        key: 'referal',
        route: 'referal'
      },{
        title: 'Kode Semua Produk',
        icon: require('../assets/images/code.png'),
        key: 'productcode',
        route: 'productcode'
      },{
        title: 'Device Saya',
        icon: require('../assets/images/icon-phone.png'),
        key: 'device',
        route: 'device'
      },{
        title: 'Reset Pin',
        icon: require('../assets/images/stopwatch.png'),
        key: 'reset_pin',
        route: 'reset_pin'
      },{
        title: 'Customer Service',
        icon: require('../assets/images/question.png'),
        key: 'customerservice',
        route: 'customerservice'
      },{
        title: 'Tentang Kami',
        icon: require('../assets/images/info.png'),
        key: 'aboutus',
        route: 'aboutus'
      },{
        title: 'Keluar',
        icon: require('../assets/images/exit.png'),
        key: 'logout',
        route: 'logout'
      }]
    }else if(this.state.userdata != null && this.state.userdata.role_id == 2){
      items = [{
        title: 'Daftar Harga',
        icon: require('../assets/images/list.png'),
        key: 'pricelist',
        route: 'pricelist'
      },{
        title: 'Persetujuan Qonter',
        icon: require('../assets/images/currency.png'),
        key: 'sales_approval',
        route: 'sales_approval'
      },{
        title: 'Markup',
        icon: require('../assets/images/currency.png'),
        key: 'sales_markup',
        route: 'sales_markup'
      },{
        title: 'Konter',
        icon: require('../assets/images/icon-contact.png'),
        key: 'sales_konter',
        route: 'sales_konter'
      },{
        title: 'Tagihan Konter',
        icon: require('../assets/images/currency.png'),
        key: 'kolektor_approval',
        route: 'kolektor_approval'
      },{
        title: 'Tambah Konter',
        icon: require('../assets/images/icon-contact.png'),
        key: 'sales_register',
        route: 'sales_register'
      },{
        title: 'Poin & Reward',
        icon: require('../assets/images/reward.png'),
        key: 'reward',
        route: 'reward'
      },{
        title: 'Notifikasi',
        icon: require('../assets/images/notifications.png'),
        key: 'notification',
        route: 'notification'
      },{
        title: 'Cetak Struk',
        icon: require('../assets/images/printer.png'),
        key: 'print',
        route: 'print'
      },{
        title: 'Riwayat Transaksi',
        icon: require('../assets/images/history.png'),
        key: 'history',
        route: 'history'
      },{
        title: 'Kode Referal',
        icon: require('../assets/images/barcode.png'),
        key: 'referal',
        route: 'referal'
      },{
        title: 'Kode Semua Produk',
        icon: require('../assets/images/code.png'),
        key: 'productcode',
        route: 'productcode'
      },{
        title: 'Device Saya',
        icon: require('../assets/images/icon-phone.png'),
        key: 'device',
        route: 'device'
      },{
        title: 'Reset Pin',
        icon: require('../assets/images/stopwatch.png'),
        key: 'reset_pin',
        route: 'reset_pin'
      },{
        title: 'Customer Service',
        icon: require('../assets/images/question.png'),
        key: 'customerservice',
        route: 'customerservice'
      },{
        title: 'Tentang Kami',
        icon: require('../assets/images/info.png'),
        key: 'aboutus',
        route: 'aboutus'
      },{
        title: 'Keluar',
        icon: require('../assets/images/exit.png'),
        key: 'logout',
        route: 'logout'
      }]
    }else{
      items = [{
        title: 'Tagihan Konter',
        icon: require('../assets/images/currency.png'),
        key: 'kolektor_approval',
        route: 'kolektor_approval'
      },{
        title: 'Daftar Harga',
        icon: require('../assets/images/list.png'),
        key: 'pricelist',
        route: 'pricelist'
      },{
        title: 'Poin & Reward',
        icon: require('../assets/images/reward.png'),
        key: 'reward',
        route: 'reward'
      },{
        title: 'Notifikasi',
        icon: require('../assets/images/notifications.png'),
        key: 'notification',
        route: 'notification'
      },{
        title: 'Cetak Struk',
        icon: require('../assets/images/printer.png'),
        key: 'print',
        route: 'print'
      },{
        title: 'Riwayat Transaksi',
        icon: require('../assets/images/history.png'),
        key: 'history',
        route: 'history'
      },{
        title: 'Kode Referal',
        icon: require('../assets/images/barcode.png'),
        key: 'referal',
        route: 'referal'
      },{
        title: 'Kode Semua Produk',
        icon: require('../assets/images/code.png'),
        key: 'productcode',
        route: 'productcode'
      },{
        title: 'Device Saya',
        icon: require('../assets/images/icon-phone.png'),
        key: 'device',
        route: 'device'
      },{
        title: 'Reset Pin',
        icon: require('../assets/images/stopwatch.png'),
        key: 'reset_pin',
        route: 'reset_pin'
      },{
        title: 'Customer Service',
        icon: require('../assets/images/question.png'),
        key: 'customerservice',
        route: 'customerservice'
      },{
        title: 'Tentang Kami',
        icon: require('../assets/images/info.png'),
        key: 'aboutus',
        route: 'aboutus'
      },{
        title: 'Keluar',
        icon: require('../assets/images/exit.png'),
        key: 'logout',
        route: 'logout'
      }]
    }

    const profiles = [{
      id: 1,
      photo: this.state.userdata != null && typeof(this.state.userdata.photo) !== 'undefined' && this.state.userdata.photo != null ? this.state.userdata.photo : 'https://dev.qonter.online/assets/images/logo-round.png',
      name: this.state.userdata != null && typeof(this.state.userdata.name) !== 'undefined' && this.state.userdata.name != null ? this.state.userdata.name : 'Nama Lengkap',
      referal_code: this.state.userdata != null && typeof(this.state.userdata.referal_code) !== 'undefined' && this.state.userdata.referal_code != null ? this.state.userdata.referal_code : 'Kode Referal',
    }];

    return (
      <Box
        w={{
          base: "100%",
          md: "25%",
        }}
      >
        <FlatList
          data={profiles}
          renderItem={({ item }) => (
            <Box
              borderBottomWidth="1"
              _dark={{
                borderColor: "gray.600",
              }}
              borderColor="coolGray.200"
              pl="4"
              pr="2"
              py="2"
            >
              <HStack space={3} justifyContent="space-between">
                <Pressable
                  onPress={() => {
                    Actions.profile()
                  }}
                >
                  <Avatar
                    size="48px"
                    source={{
                      uri: item.photo,
                    }}
                  />
                </Pressable>
                <VStack>
                  <Pressable
                    onPress={() => {
                      Actions.profile()
                    }}
                  >
                    <Text
                      _dark={{
                        color: "warmGray.50",
                      }}
                      color="coolGray.800"
                      bold
                      style={{
                        fontSize: 16,
                        paddingTop: 4
                      }}
                    >
                      {item.name}
                    </Text>
                    <Text
                      color="coolGray.600"
                      _dark={{
                        color: "warmGray.200",
                      }}
                    >
                      {item.referal_code}
                    </Text>
                  </Pressable>
                  {/* <Button
                    variant="subtle"
                    size="sm"
                    style={{
                      marginTop: 10
                    }}
                    onPress={() => Actions.profile()}
                    endIcon={<Icon as={MaterialIcons} name="person-outline" size="xs" />}
                  >
                    Profil Saya
                  </Button> */}
                </VStack>
                <Spacer />
                <Text
                  fontSize="xs"
                  _dark={{
                    color: "warmGray.50",
                  }}
                  color="coolGray.800"
                  alignSelf="flex-start"
                  justifySelf="flex-end"
                >
                  <IconButton 
                    icon={
                      <Icon size="xs" as={
                        <MaterialIcons name='close' />
                      } 
                      color="black" />
                    } 
                    _pressed={{
                      bg: "white.600:alpha.20"
                    }} 
                    onPress={() => { 
                      Actions.drawerClose() 
                    }} 
                  />
                </Text>
              </HStack>
            </Box>
          )}
          keyExtractor={(item) => item.id}
        />

        {/* MENUS */}
        <ScrollView
          h={{
            base: "93%"
          }}
        >
          <FlatList
            data={items}
            renderItem={({ item }) => (
              <Box
                borderBottomWidth="1"
                _dark={{
                  borderColor: "gray.600",
                }}
                borderColor="coolGray.200"
                pl="4"
                pr="2"
                py="3"
              >
                <HStack space={3} justifyContent="space-between" onPress={() => item.route != '' ? this.goTo(item.route) : ''}>
                  {/* <Image source={item.icon} style={styles.imgMenuLeft} /> */}
                  <Icon as={MaterialIcons} name={item.icon} size="sm" style={
                    (item.key == 'logout') ? styles.logoutList : {
                      color: Colors.PRIMARY
                    }
                  } />
                  <VStack>
                    <Text style={(Actions.currentScene == item.key) ? [styles.activeList, styles.titleMenu] : (item.key == 'logout') ? [styles.logoutList, styles.titleMenu] : [styles.defaultList, styles.titleMenu]}>
                      {item.title}
                    </Text>
                  </VStack>
                  <Spacer />
                </HStack>
              </Box>
            )}
            keyExtractor={(item) => item.id}
          />
        </ScrollView>
      </Box>
    )
  }
}

const styles = StyleSheet.create({
  listView: {
    margin: 5,
  },
  defaultList: {
    color: '#000',
  },
  logoutList: {
    color: "#FF0000"
  },
  activeList: {
    color: "#0279b2",
  },
  viewSidebar: {
    height: 140,
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F6'
  },
  gridColLeft: {
    width: '25%'
  },
  gridColRight: {
    width: '75%'
  },
  imageSide: {
    height: 50,
    width: 50,
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ABABAB',
    resizeMode: "cover",
  },
  title: {
    paddingTop: 5,
    fontSize: 18,
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: '#333333',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontWeight: Typography.FONT_WEIGHT_REGULAR,
    color: '#ABABAB',
  },
  btnProfile: {
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ABABAB',
    width: '100%',
    height: 40,
    marginBottom: 5
  },
  iconMenuLeft: {
    color: Colors.PRIMARY,
    marginTop: 8,
    fontSize: 20,
  },
  imgMenuLeft: {
    width: 22,
    height: 22,
    resizeMode: "contain",
    marginTop: 3
  },
  titleProfile: {
    paddingTop: 9,
    fontSize: 14,
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
  },
  titleMenu: {
    paddingTop: 2,
    fontSize: 14,
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
  },
})
