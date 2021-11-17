import React, { Component } from 'react';
import { StyleSheet, Animated, TouchableOpacity, Text, Dimensions, View } from 'react-native';
import Colors from '../../styles/colors';
import Typography from '../../styles/typography';
import { UIActivityIndicator } from 'react-native-indicators';

export default class ButtonIndex extends Component {
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
      <TouchableOpacity style={styles.mybutton} disabled={this.state.loading} onPress={this.toggleAnimation}>
        <Animated.View style={[styles.mybuttonGrid, animatedWidth]}>
          {
            (this.state.loading) ? <UIActivityIndicator size={25} color={Colors.PRIMARY} /> : <Text style={styles.iconLabel}>{this.props.btnLabel}</Text>
          }
        </Animated.View>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  mybutton : {
    alignItems:'center',
    width: '100%',
    height: 50
  },
  mybuttonGrid: {
    borderRadius: 25,
    borderWidth: 1.5,
    padding: 6,
    borderColor: Colors.PRIMARY,
    alignItems: "center"
  },
  iconLabel: {
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    color: Colors.PRIMARY,
    fontSize: 18,
    paddingBottom: 5,
    paddingTop: 5
  },
})
