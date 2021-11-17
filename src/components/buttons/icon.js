import React, { Component } from 'react';
import { StyleSheet, Animated, TouchableOpacity, Image, Dimensions, View } from 'react-native';
import { VStack, HStack, Button, IconButton, Icon, Text, Center, Box } from 'native-base';
import FontAwesome5 from 'react-native-vector-icons/dist/FontAwesome5';
import Colors from '../../styles/colors';
import Typography from '../../styles/typography';
import { UIActivityIndicator } from 'react-native-indicators';

export default class ButtonIcon extends Component {
  constructor(props) {
    super(props)

    this.state={
      loading: false,
      animationValue : new Animated.Value(Math.round(Dimensions.get('window').width - 50))
    }
  }

  toggleAnimation = async () => {
    this.setState({loading : true})
    Animated.timing(this.state.animationValue, {
      toValue : 50,
      timing : 2500
    }).start(async () => {
      // Action
      await this.props.onPress()

      Animated.timing(this.state.animationValue, {
        toValue : Math.round(Dimensions.get('window').width - 50),
        timing : 2500
      }).start(() => {
        this.setState({loading : false})
      })
    })
  }

  render() {
    const animatedWidth = {
      width : this.state.animationValue,
      height : 50
    }
    return (
      <TouchableOpacity style={styles.mybutton} onPress={this.toggleAnimation}>
        <Animated.View style={[styles.mybuttonGrid, animatedWidth]}>
          {
            (this.state.loading) ? 
            <UIActivityIndicator size={25} color={Colors.PRIMARY} /> : 
            <View style={{display: "flex", flexDirection: "row"}}>
              <Icon size="sm" as={
                  <FontAwesome5 name={this.props.btnIcon} />
                } 
                color={Colors.PRIMARY} />
              <Text style={[styles.iconLabel, this.props.btnIcon == 'whatsapp' ? {
                paddingLeft: 4
              } : false]}>{this.props.btnLabel}</Text>
            </View>
          }
        </Animated.View>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  mybutton : {
    alignItems:'center',
    justifyContent: 'center',
    width: '100%',
    height: 50
  },
  mybuttonGrid: {
    borderRadius: 25,
    borderWidth: 1.5,
    padding: 6,
    borderColor: Colors.PRIMARY,
    alignItems: "center",
    justifyContent: 'center',
  },
	icon: {
    height: 32,
    width: 32,
    resizeMode: "stretch",
    paddingRight: 5,
  },
  iconLabel: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: Colors.PRIMARY,
    fontSize: 14,
    paddingLeft: 8,
    paddingTop: 2
  },
})
