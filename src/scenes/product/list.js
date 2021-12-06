import React, { Component } from 'react'
import { StyleSheet, AsyncStorage, StatusBar, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native'
import { Grid, Col, Row, Icon } from 'native-base'
import { Actions } from 'react-native-router-flux'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import Toast from 'react-native-easy-toast'
import { Colors, Typography } from '../../styles'
import HeaderBack from '../../components/headers/back'
import { POST, GET } from '../../services/ApiServices'

export default class Product extends Component {
  _isMounted = false

  constructor(props) {
    super(props)
  
    this.state = {
      products: [],
      productsRow: 5
    }
  }

  async componentDidMount() {
    this._isMounted = true

    // PRODUCTS
    await GET('menu', {}, true).then(async (result) => {
      this.setState({ products: result })
    }).catch(error => {
      console.log(error)
    })
  }

  async next() {
    Actions.reset('menus')
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
      let cols = []
      for (let index = 0; index < (this.state.productsRow - item.length); index++) {
        cols.push({ title: '' })
      }
      
      return (
        <Row key={index} style={{marginBottom: 15}}>
          { item.map(
            (data, index) => 
              <Col key={index} style={{alignItems: "center", alignContent: "center"}}>
                {
                  (data.type == 'prepaid' || data.type == 'postpaid') ? 
                    <TouchableOpacity style={{alignItems: "center", alignContent: "center"}} onPress={() => (data.route == '') ? false : Actions.product_request({ product: data })}>
                      <Image style={{ width: 36, height: 36, resizeMode: "contain" }} source={{uri: data.icon}} />
                      <Text style={{textAlign: "center", paddingTop: 10, marginBottom: 10}}>{data.name}</Text>
                    </TouchableOpacity>
                  : false
                }
                {
                  (data.type == 'transfer') ? 
                    <TouchableOpacity style={{alignItems: "center", alignContent: "center"}} onPress={() => (data.route == '') ? false : Actions.product_transfer_request({ product: data })}>
                      <Image style={{ width: 36, height: 36, resizeMode: "contain" }} source={{uri: data.icon}} />
                      <Text style={{textAlign: "center", paddingTop: 10, marginBottom: 10}}>{data.name}</Text>
                    </TouchableOpacity>
                  : false
                }
                {
                  (data.type == 'external') ? 
                    <TouchableOpacity style={{alignItems: "center", alignContent: "center"}} onPress={() => (data.route == '') ? false : Actions.product_external({ product: data })}>
                      <Image style={{ width: 36, height: 36, resizeMode: "contain" }} source={{uri: data.icon}} />
                      <Text style={{textAlign: "center", paddingTop: 10, marginBottom: 10}}>{data.name}</Text>
                    </TouchableOpacity>
                  : false
                }
              </Col>
            )
          }
          { cols.map(
            (data, index) => 
              <Col key={index} style={{alignItems: "center", alignContent: "center"}}></Col>
            )
          }
        </Row>
      );
    });
  }

	render() {
		return(
      <ScrollView style={styles.container} scrollEnabled={false}>

        <HeaderBack title="Detail Produk Digital" />
        
        <View style={styles.container_form}>
          <Grid>
            {this.displayProducts()}
          </Grid>
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
    paddingTop: 10
  },
});
