import React, { Component } from 'react';
import { Dimensions, StyleSheet, View, Image, Text, TouchableOpacity } from 'react-native';
import { Actions } from 'react-native-router-flux';
import Colors from '../../styles/colors';
import Carousel from 'react-native-banner-carousel';

const BannerWidth = Dimensions.get('window').width
const BannerHeight = 200

export default class Slider extends Component {
  constructor(props) {
    super(props)
  
    this.state = {}
  }

  renderItem(item, index) {
    return (
      <TouchableOpacity key={index} style={{height: BannerHeight}} onPress={() => Actions.promo_list()}>
        <Image style={{ width: BannerWidth, height: BannerHeight, resizeMode: "cover" }} source={{uri: item.image}} />
      </TouchableOpacity>
    )
  }

	render() {
		return (
      <View style={{width: '100%'}}>
        <Carousel
          autoplay
          autoplayTimeout={5000}
          loop
          index={0}
          pageSize={BannerWidth}
          pageIndicatorContainerStyle={{
            position: "absolute",
            height: 10,
            bottom: 5,
            alignItems: 'center',
          }}
          activePageIndicatorStyle={{
            backgroundColor: Colors.PRIMARY,
            opacity: 1,
            width: 10,
            borderRadius: 5,
            height: 10,
            marginTop: 0,
            marginLeft: 0
          }}
          pageIndicatorStyle={{
            backgroundColor: Colors.PRIMARY,
            opacity: 0.5,
            width: 6,
            borderRadius: 3,
            height: 6,
            marginTop: 2.5,
            marginLeft: 2
          }}
          pageIndicatorOffset={13}
        >
          {this.props.sliders.map((item, index) => this.renderItem(item, index))}
        </Carousel>
      </View>	
    )
	}
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    backgroundColor: '#fff',
    justifyContent: "flex-start",
  },
});
