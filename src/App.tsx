import React, {} from 'react';
import { Platform } from 'react-native';
import {} from 'react-native';
import WebRoute from './navigations/WebRoute';
import AppNavigation from './navigations/AppNavigation';

const App = () => {
  return (
    <React.Fragment>
      {
        Platform.OS == 'web' ?
        <React.Fragment>
            <WebRoute />
        </React.Fragment>:
        <React.Fragment>
          <AppNavigation />
        </React.Fragment>
      }
    </React.Fragment>
  );
};

export default App;