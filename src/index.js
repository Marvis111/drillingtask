/**
 * @format
 */
import {AppRegistry} from 'react-native';
import App from './App';
const appName = 'webtest'
AppRegistry.registerComponent(appName, () => App);
AppRegistry.runApplication(appName, {
    rootTag: document.getElementById('app-root')
  });
