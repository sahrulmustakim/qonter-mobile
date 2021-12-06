import React, { Component } from 'react'
import { StyleSheet, Animated, TouchableOpacity, Text, Dimensions, View } from 'react-native'
import Colors from '../../styles/colors'
import Typography from '../../styles/typography'
import { UIActivityIndicator } from 'react-native-indicators'

export default class buttonColor extends Component {
  constructor(props) {
    super(props)

    this.state={
      loading: false,
      animationValue : new Animated.Value(120)
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
        toValue : 120,
        timing : 2500
      }).start(() => {
        this.setState({loading : false})
      })
    })
  }

  render() {
    const animatedWidth = {
      width : this.state.animationValue,
      height : 35
    }
    return (
      <TouchableOpacity style={styles.mybutton} disabled={this.state.loading} onPress={this.toggleAnimation}>
        <Animated.View style={[styles.mybuttonGrid, animatedWidth, {borderColor: this.props.bgColor, backgroundColor: this.props.bgColor}]}>
          {
            (this.state.loading) ? <UIActivityIndicator size={25} color={this.props.textColor} /> : <Text style={[styles.iconLabel, {color: this.props.textColor}]}>{this.props.btnLabel}</Text>
          }
        </Animated.View>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  mybutton : {
    alignItems:'center',
    height: 35
  },
  mybuttonGrid: {
    borderRadius: 25,
    borderWidth: 1.5,
    padding: 5,
    borderColor: Colors.PRIMARY,
    backgroundColor: Colors.PRIMARY,
    alignItems: "center"
  },
  iconLabel: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: '#FFF',
    fontSize: 16,
  },
})
