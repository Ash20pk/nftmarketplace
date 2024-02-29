// index.js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import ConnectWallet from './components/ConnectWallet';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';


const root = ReactDOM.createRoot(document.getElementById("root"));
const darkTheme = createTheme({
  palette: {
    primary: {
      main: '#FF5733',
      // light: will be calculated from palette.primary.main,
      // dark: will be calculated from palette.primary.main,
      // contrastText: will be calculated to contrast with palette.primary.main
    },
    secondary: {
      main: '#E0C2FF',
      light: '#F5EBFF',
      // dark: will be calculated from palette.secondary.main,
      contrastText: '#47008F',
  },
}
});

root.render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
    <ConnectWallet>
      <App />
    </ConnectWallet>
    </ThemeProvider>
  </React.StrictMode>
);
