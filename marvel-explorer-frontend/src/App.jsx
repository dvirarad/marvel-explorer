// src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

// Import the API Provider
import { ApiProvider } from './contexts/ApiContext';

// Import WebSocket Service
import webSocketService from './services/WebSocketService';

// Pages
import Home from './pages/Home';
import MoviesPerActor from './pages/MoviesPerActor';
import ActorsWithMultipleCharacters from './pages/ActorsWithMultipleCharacters';
import CharactersWithMultipleActors from './pages/CharactersWithMultipleActors';
import AdminPanel from './pages/AdminPanel';

// Components
import Header from './components/Header';
import Footer from './components/Footer';

// Create a Marvel-themed theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#E23636', // Marvel Red
      dark: '#C11F1F',
      light: '#EF6F6F',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#518CCA', // Marvel Blue
      dark: '#2B5F8E',
      light: '#7DACDC',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F8F8F8',
      paper: '#FFFFFF',
    },
    error: {
      main: '#FF0000',
    },
    text: {
      primary: '#202020',
      secondary: '#555555',
    },
  },
  typography: {
    fontFamily: '"Roboto Condensed", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(to right, #E23636, #B80000)',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          },
        },
        containedPrimary: {
          backgroundImage: 'linear-gradient(to bottom right, #E23636, #B80000)',
        },
        containedSecondary: {
          backgroundImage: 'linear-gradient(to bottom right, #518CCA, #2B5F8E)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: `
            url('/assets/marvel-bg-pattern.png') fixed,
            linear-gradient(145deg, #FAFAFA 30%, #F0F0F0 90%)
          `,
          backgroundBlendMode: 'overlay',
        },
      },
    },
  },
});

function App() {
  // Initialize WebSocket connection when app starts
  useEffect(() => {
    // Connect to WebSocket server
    webSocketService.connect();

    // Clean up on app unmount
    return () => {
      webSocketService.disconnect();
    };
  }, []);

  return (
    <ApiProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: '100vh',
            }}
          >
            <Header />
            <Container component="main" sx={{ mt: 4, mb: 4, flex: 1 }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/movies-per-actor" element={<MoviesPerActor />} />
                <Route path="/actors-with-multiple-characters" element={<ActorsWithMultipleCharacters />} />
                <Route path="/characters-with-multiple-actors" element={<CharactersWithMultipleActors />} />
                <Route path="/admin" element={<AdminPanel />} />
              </Routes>
            </Container>
            <Footer />
          </Box>
        </Router>
      </ThemeProvider>
    </ApiProvider>
  );
}

export default App;
