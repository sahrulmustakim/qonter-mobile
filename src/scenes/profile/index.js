import React, { Component } from 'react'
import { StyleSheet, AsyncStorage, StatusBar, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native'
import { Grid, Col, Row, Icon, Button } from 'native-base'
import { Actions } from 'react-native-router-flux'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import Toast from 'react-native-easy-toast'
import { Colors, Typography } from '../../styles'
import HeaderBack from '../../components/headers/back'
import Moment from 'moment'
import { POST, GET } from '../../services/ApiServices'
import { getProfile, formatPrice } from '../../utils/Global'

export default class Profile extends Component {
  _isMounted = false

  constructor(props) {
    super(props)
  
    this.state = {
      userdata: null,
      profile: null,
      history: [],
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
      console.log(result)
      this.setState({ profile: result })
    }).catch(error => {
      console.log(error)
    })

    // RIWAYAT
    await GET('riwayat/transaksi/'+this.state.userdata.id+'/5', {}, true).then(async (result) => {
      this.setState({ history: result })
    }).catch(error => {
      console.log(error)
    })
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  async next() {
    Actions.reset('menus')
  }

  historyPlafon() {
    if(this.state.profile != null){
      return this.state.profile.user[0].paylater_requests.slice(0, 5).map((item, index) => {
        if(item.status == 'true'){
          return (
            <Row key={index} style={styles.rowHistory}>
              <Col size={1} style={{justifyContent: "center", alignItems: "center"}}>
                <Image style={{ width: 34, height: 34, resizeMode: "contain" }} source={require('../../assets/images/dbcurrency.png')} />
              </Col>
              <Col size={11} style={{justifyContent: "flex-start"}}>
                <Text style={styles.labelStatus}>Disetujui</Text>
                <Grid style={{paddingLeft: 10, paddingRight: 10}}>
                  <Col size={6} style={{justifyContent: "flex-start"}}>
                    <Text style={styles.itemLabel}>Pengajuan Limit</Text>
                    <Text style={styles.itemValue}>Rp{formatPrice(item.amount)}</Text>
                  </Col>
                  <Col size={6} style={{justifyContent: "flex-start"}}>
                    <Text style={styles.itemLabel}>Jatuh Tempo</Text>
                    <Text style={styles.itemValue}>{Moment(item.due_date).format('DD MMMM YYYY')}</Text>
                  </Col>
                </Grid>
              </Col>
            </Row>
          )
        }
      })
    }
  }

  historyTagihan() {
    if(this.state.profile != null){
      return this.state.history.map((item, index) => {
        if(index < 3){
          return (
            <Row key={index} style={styles.rowTagihan}>
              <Col size={1} style={{justifyContent: "center", alignItems: "center"}}>
                <Image style={{ width: 34, height: 34, resizeMode: "contain" }} source={require('../../assets/images/dbcurrency.png')} />
              </Col>
              <Col size={7} style={{justifyContent: "flex-start"}}>
                <Grid style={{paddingLeft: 10, paddingRight: 10}}>
                  <Text style={[styles.titleBoldBlack]}>{item.ref_id_TP}</Text>
                  <Row style={{paddingTop: 5}}>
                    {
                      (typeof item.grand_total !== 'undefined') ? 
                      <Col size={6} style={{justifyContent: "flex-start"}}>
                        <Text style={[styles.titleSmallBlack]}>Harga</Text>
                        <Text style={[styles.titleSmallBlackBold]}>Rp{formatPrice(item.grand_total)}</Text>
                      </Col>
                      :false
                    }
                    {
                      (item.transaction_types != null && typeof item.transaction_types.name !== 'undefined') ? 
                      <Col size={6} style={{justifyContent: "flex-start"}}>
                        <Text style={[styles.titleSmallBlack]}>Produk</Text>
                        <Text style={[styles.titleSmallBlackBold]}>{item.transaction_types.name}</Text>
                      </Col>
                      :false
                    }
                    {
                      (item.referer_table == null && item.referer_table == 'transfer_histories') ? 
                      <Col size={6} style={{justifyContent: "flex-start"}}>
                        <Text style={[styles.titleSmallBlack]}>Produk</Text>
                        <Text style={[styles.titleSmallBlackBold]}>Kirim Uang</Text>
                      </Col>
                      :false
                    }
                  </Row>
                </Grid>
              </Col>
              <Col size={4} style={{justifyContent: "center", alignItems: "flex-end"}}>
                <Text style={[styles.titleSmallBlack, {marginBottom: 5}]}>{Moment(item.created_at).format('DD MMMM YYYY hh:mm')}</Text>
                <Text style={(item.status.toLowerCase() == 'success') ? styles.titleBoldGreen : (item.status.toLowerCase() == 'pending') ? styles.titleBoldOrange : styles.titleBoldRed }>{item.status.toUpperCase()}</Text>
              </Col>
            </Row>
          )
        }
      })
    }
  }

	render() {
		return(
      <ScrollView style={styles.container} scrollEnabled={true}>

        <HeaderBack title="Profil Saya" />
        
        <View style={styles.container_form}>
          <Grid>
            <Col size={2} style={styles.gridColLeft}>
              {
                (this.state.userdata != null)
                ?
                <Image style={styles.imageSide} source={{uri: this.state.userdata.photo}}/>
                :
                <Image style={styles.imageSide} source={require('../../assets/images/default-user.png')}/>
              }
            </Col>
            <Col size={5} style={{paddingLeft: 10}}>
              {
                (this.state.userdata != null)
                ?
                <Text style={styles.title}>{this.state.userdata.name}</Text>
                :
                <Text style={styles.title}>Nama Lengkap</Text>
              }
              {
                (this.state.userdata != null)
                ?
                <Text style={styles.subtitle}>{this.state.userdata.referal_code}</Text>
                :
                <Text style={styles.subtitle}>Kode Referal</Text>
              }

              <View style={styles.userType}>
                {
                  (this.state.profile != null)
                  ?
                  <Text style={styles.titleType}>
                    {this.capitalizeFirstLetter(this.state.profile.user[0].roles.name).split('-').join(' ')}
                  </Text>
                  :
                  <Text style={styles.titleType}>Konter</Text>
                }
              </View>
            </Col>
            <Col size={3}>
              <TouchableOpacity style={{paddingLeft: 10, paddingRight: 10, paddingTop: 5, paddingBottom: 5, borderColor: Colors.PRIMARY, borderWidth: 1, borderRadius: 5}} onPress={() => Actions.update_profile()}>
                <Grid>
                  <Col size={3}>
                    <Icon type="Ionicons" name="create-outline" style={{ fontSize: 20, color: Colors.PRIMARY }} />
                  </Col>
                  <Col size={9}>
                    <Text style={{paddingTop: 4, color: Colors.PRIMARY}}>Ubah Profil</Text>
                  </Col>
                </Grid>
              </TouchableOpacity>
            </Col>
          </Grid>

          {
            (this.state.profile != null) ?
            <View style={styles.boxSaldo}>
              <Grid>
                <Col style={{borderRightWidth: 1, borderRightColor: '#CFCFCF', paddingLeft: 3, paddingRight: 10}}>
                  <TouchableOpacity onPress={() => Actions.wallet()}>
                    <Grid>
                      <Col size={2} style={{alignItems: "center", padding: 5}}>
                        <Image style={{ width: 25, height: 25, resizeMode: "contain" }} source={require('../../assets/images/cashin.png')} />
                      </Col>
                      <Col size={8} style={{paddingTop: 2}}>
                        <Text style={styles.labelBox}>Saldo</Text>
                        <Text style={styles.labelPrice}>Rp{(typeof this.state.profile.user[0].balances !== 'undefined' && this.state.profile.user[0].balances != null) ? formatPrice(this.state.profile.user[0].balances.amount) : 0}</Text>
                      </Col>
                    </Grid>
                  </TouchableOpacity>
                </Col>
                { (this.state.userdata != null && this.state.userdata.role_id == 5) ?
                <Col style={{paddingLeft: 10, paddingRight: 10}}>
                  <TouchableOpacity onPress={() => Actions.paylater()}>
                    <Grid>
                      <Col size={2} style={{alignItems: "center", padding: 5}}>
                        <Image style={{ width: 25, height: 25, resizeMode: "contain" }} source={require('../../assets/images/cashout.png')} />
                      </Col>
                      <Col size={8} style={{paddingTop: 2}}>
                        <Text style={styles.labelBox}>Qonter</Text>
                        <Text style={styles.labelPrice}>Rp{(typeof this.state.profile.user[0].paylaters !== 'undefined' && this.state.profile.user[0].paylaters != null) ? formatPrice(this.state.profile.user[0].paylaters.amount) : 0}</Text>
                      </Col>
                    </Grid>
                  </TouchableOpacity>
                </Col>
                : false }
              </Grid>
            </View>
            : false
          }

          {
            (this.state.profile != null) ?
            <View style={styles.boxSaldo}>
              <Grid>
                { (this.state.userdata != null && this.state.userdata.role_id != 5) ?
                  <Col style={{borderRightWidth: 1, borderRightColor: '#CFCFCF', paddingTop: 5}}>
                    <TouchableOpacity style={{alignItems: "center", width: '100%'}} onPress={() => Actions.komisi_withdraw({detail: this.state.profile.komisi})}>
                      <Image style={{ width: 42, height: 42, resizeMode: "contain" }} source={require('../../assets/images/dbcurrency.png')} />
                      <Text style={styles.labelCenter}>Komisi</Text>
                      <View style={styles.boxValue}>
                        <Text style={styles.valueCenter}>Rp{(typeof this.state.profile.komisi !== 'undefined' && this.state.profile.komisi != null) ? formatPrice(this.state.profile.komisi.amount) : 0}</Text>
                      </View>
                    </TouchableOpacity>
                  </Col>
                : false }
                { (this.state.userdata != null && this.state.userdata.role_id != 5 && this.state.userdata.role_id != 4) ?
                <Col style={{borderRightWidth: 1, borderRightColor: '#CFCFCF', paddingTop: 5, alignItems: "center"}}>
                  <TouchableOpacity style={{alignItems: "center", width: '100%'}} onPress={() => Actions.sales_konter()}>
                    <Image style={{ width: 38, height: 38, resizeMode: "contain" }} source={require('../../assets/images/default-user.png')} />
                    <Text style={[styles.labelCenter, {paddingTop: 5}]}>Total Konter</Text>
                    <View style={styles.boxValue}>
                      <Text style={styles.valueCenter}>{(typeof this.state.profile.konter !== 'undefined' && this.state.profile.konter != null) ? this.state.profile.konter : 0}</Text>
                    </View>
                  </TouchableOpacity>
                </Col>
                : 
                <Col style={{borderRightWidth: 1, borderRightColor: '#CFCFCF', paddingTop: 5, alignItems: "center"}}>
                  <TouchableOpacity style={{alignItems: "center", width: '100%'}} onPress={() => Actions.reward()}>
                    <Image style={{ width: 42, height: 42, resizeMode: "contain" }} source={require('../../assets/images/dbcurrency.png')} />
                    <Text style={styles.labelCenter}>Poin</Text>
                    <View style={styles.boxValue}>
                      <Text style={styles.valueCenter}>{(typeof this.state.profile.user[0].points !== 'undefined' && this.state.profile.user[0].points != null) ? this.state.profile.user[0].points.amount : 0}</Text>
                    </View>
                  </TouchableOpacity>
                </Col>
                }
                <Col style={{paddingTop: 5, alignItems: "center"}}>
                  <TouchableOpacity style={{alignItems: "center", width: '100%'}} onPress={() => Actions.history()}>
                    <Image style={{ width: 42, height: 42, resizeMode: "contain" }} source={require('../../assets/images/dbcurrency.png')} />
                    <Text style={styles.labelCenter}>Total Transaksi</Text>
                    <View style={styles.boxValue}>
                      <Text style={styles.valueCenter}>{(typeof this.state.profile.user[0].transactions !== 'undefined' && this.state.profile.user[0].transactions != null) ? this.state.profile.user[0].transactions.length : 0}</Text>
                    </View>
                  </TouchableOpacity>
                </Col>
              </Grid>
            </View>
            : false
          }

          { (this.state.userdata != null && this.state.userdata.role_id == 5) ?
            <View style={styles.boxHistory}>
              <Text style={styles.titleHistory}>Riwayat Penambahan Qonter</Text>
              <Grid>
                {this.historyPlafon()}
              </Grid>
            </View>
          : false }

          <View style={styles.boxHistory}>
            <Text style={styles.titleHistory}>Riwayat Transaksi Terakhir</Text>
            <Grid>
              {this.historyTagihan()}
            </Grid>
          </View>
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
  container_form : {
    margin: 15,
  },
  gridColLeft: {
    alignItems: "center", 
    alignContent: "center",
    justifyContent: "center"
  },
  imageSide: {
    height: 70,
    width: 70,
    borderRadius: 35,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ABABAB',
    resizeMode: "cover",
  },
  title: {
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
    marginBottom: 10,
  },
  userType: {
    backgroundColor: '#F1F4F9',
    borderRadius: 5,
    width: '90%',
    height: 25,
    marginBottom: 5,
    alignItems: "center",
    justifyContent: "center"
  },
  titleType: {
    fontSize: 14,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontWeight: Typography.FONT_WEIGHT_REGULAR,
    color: Colors.PRIMARY,
    textAlign: "center"
  },
  titleBoldBlack: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: '#232323',
    fontSize: 16,
  },
  boxSaldo: {
    backgroundColor: '#F1F4F9',
    borderRadius: 5,
    marginTop: 15,
    borderRadius: 5,
    width: '100%',
    padding: 7
  },
  labelBox: {
    color: '#000', 
    fontSize: 11, 
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
  },
  labelPrice: {
    color: Colors.PRIMARY, 
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    fontSize: 14, 
    paddingBottom: 4
  },
  labelCenter: {
    color: Colors.PRIMARY, 
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    fontSize: 14, 
    paddingBottom: 4,
    textAlign: "center"
  },
  boxValue: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: '#FFF',
    borderRadius: 5,
    marginTop: 5,
    marginBottom: 5,
    padding: 5,
    width: '75%'
  },
  valueCenter: {
    color: Colors.PRIMARY, 
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    fontSize: 12, 
    textAlign: "center"
  },
  boxHistory: {
    marginTop: 10,
    marginBottom: 10,
  },
  titleHistory: {
    color: '#484848', 
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    fontSize: 14, 
    paddingLeft: 5,
    marginBottom: 10
  },
  rowHistory: {
    paddingTop: 5,
    paddingBottom: 5,
    borderTopWidth: 1,
    borderTopColor: '#F1F3F6'
  },
  labelDate: {
    color: '#484848', 
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontWeight: Typography.FONT_WEIGHT_REGULAR,
    fontSize: 12, 
  },
  labelStatus: {
    marginLeft: 10,
    marginTop: 2,
    marginBottom: 2,
    backgroundColor: Colors.PRIMARY,
    color: '#FFF',
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontWeight: Typography.FONT_WEIGHT_REGULAR,
    fontSize: 12,
    borderRadius: 5,
    width: 60,
    paddingTop: 2,
    paddingBottom: 2,
    textAlign: "center"
  },
  itemLabel: {
    color: '#333333',
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontWeight: Typography.FONT_WEIGHT_REGULAR,
    fontSize: 14,
  },
  itemValue: {
    color: '#333333',
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    fontSize: 14,
    marginBottom: 2,
  },
  rowTagihan: {
    paddingTop: 10,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F3F6'
  },
  itemLabelGray: {
    color: '#787878',
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontWeight: Typography.FONT_WEIGHT_REGULAR,
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
