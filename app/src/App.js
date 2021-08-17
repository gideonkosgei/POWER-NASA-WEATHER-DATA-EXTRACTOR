import React from 'react';
import { Router} from 'react-router-dom';
import { createBrowserHistory } from 'history';
import MomentUtils from '@date-io/moment';
import { ThemeProvider } from '@material-ui/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { renderRoutes } from 'react-router-config';

import theme from './theme';
import routes from './routes';
import {ScrollReset,GoogleAnalytics, CookiesNotification} from './components';
import './mixins/chartjs';
import './mixins/moment';
import './mixins/validate';
import './mixins/prismjs';
import './mock';
import './assets/scss/index.scss';
const history = createBrowserHistory();
const App = () => {    
  return (       
      <ThemeProvider theme={theme}>
        <MuiPickersUtilsProvider utils={MomentUtils}>
          <Router history={history}>            
            <ScrollReset />
            <GoogleAnalytics />
            <CookiesNotification />                
            {renderRoutes(routes)}                      
          </Router>
        </MuiPickersUtilsProvider>
      </ThemeProvider>    
    
  );
};
export default App;


