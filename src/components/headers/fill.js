import React, { Component } from 'react'
import { StyleSheet, Alert, AsyncStorage, TouchableOpacity, Dimensions } from 'react-native'
import { Body, Header, Icon, Left, Right, Title, Grid, Col } from 'native-base'
import { Actions } from 'react-native-router-flux'
import { Colors, Typography } from '_styles'

export default class HeaderFill extends Component {
  constructor(props) {
    super(props)
  }
  
	render() {
    const screenWidth = Math.round(Dimensions.get('window').width)
    return(
			<Header style={[styles.header, { backgroundColor: this.props.bgcolor }]}>
        <Grid>
          <Col size={2} style={{justifyContent: "center"}}>
            <TouchableOpacity onPress={() => Actions.pop()}>
              <Icon type="FontAwesome" name="arrow-left" style={styles.iconMenuLeft}/>
            </TouchableOpacity>
          </Col>
          <Col size={14} style={{justifyContent: "center"}}>
            <Title style={styles.title}>{this.props.title}</Title>
          </Col>
        </Grid>
      </Header>
    )
	}
}

const screenWidth = Math.round(Dimensions.get('window').width)
const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#BDBDBD'
  },
  iconMenuLeft: {
    color: Colors.WHITE,
    fontSize: 20,
    fontWeight: "normal",
    marginLeft: 10
  },
  title: {
    color: Colors.WHITE,
    fontFamily: Typography.FONT_FAMILY_BOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    fontSize: 18,
  }
})
