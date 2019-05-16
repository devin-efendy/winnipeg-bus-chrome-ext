import React from 'react';
import { render } from 'react-dom';
// import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
// import { orange, lightBlue } from '@material-ui/core/colors';

import App from './App';

// const theme = createMuiTheme({
//   palette: {
//     // primary: {
//     //   light: '#757ce8',
//     //   main: '#3f50b5',
//     //   dark: '#002884',
//     //   contrastText: '#fff'
//     // },
//     // secondary: {
//     //   light: '#ff7961',
//     //   main: '#f44336',
//     //   dark: '#ba000d',
//     //   contrastText: '#000'
//     // }
//   }
// });

render(
  // <MuiThemeProvider theme={theme}>
  <App />,
  // </MuiThemeProvider>,
  document.getElementById('root')
);
