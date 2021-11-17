/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {Component} from 'react';
import { NativeBaseProvider } from 'native-base'
import GlobalFont from 'react-native-global-font';
import Moment from 'moment';
import Routes from './src/navigations/routes';

// Indonesian locale
var idLocale = require('moment/locale/id'); 
Moment.updateLocale('id', idLocale);

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userdata: null
    }

  }

  componentDidMount() {
    GlobalFont.applyGlobal('SourceSansPro-Regular')
    GlobalFont.applyGlobal('SourceSansPro-Bold')
    GlobalFont.applyGlobal('SourceSansPro-Black')
    GlobalFont.applyGlobal('SourceSansPro-Light')
    GlobalFont.applyGlobal('SourceSansPro-Thin')
    GlobalFont.applyGlobal('SourceSansPro-SemiBold')
    GlobalFont.applyGlobal('SourceSansPro-Medium')
  }

  render() {
    return (
      <NativeBaseProvider>
        <Routes/>
      </NativeBaseProvider>  
    )
  }
}
