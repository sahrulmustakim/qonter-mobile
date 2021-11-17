/**
 * @format
 */

import {AppRegistry, LogBox} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
LogBox.ignoreAllLogs();
LogBox.ignoreLogs([
    "Deprecation in 'navigationOptions':",
    "Deprecation in 'createStackNavigator':",
    "Require cycle: node_modules\rn-fetch-blob\index.js",
    "Animated: `useNativeDriver` was not specified. This is a required option and must be explicitly set to `true` or `false`"
]);
