// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

// Import the API Provider
import { ApiProvider } from './contexts/ApiContext';

// Pages
import Home from './pages/Home';
import MoviesPerActor from './pages/MoviesPerActor';
import ActorsWithMultipleCharacters from './pages/ActorsWithMultipleCharacters';
import CharactersWithMultipleActors from './pages/CharactersWithMultipleActors';

// Components
import Header from './components/Header';
import Footer from './components/Footer';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#E23636', // Marvel Red
    },
    secondary: {
      main: '#518CCA', // Marvel Blue
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
  },
});

function App() {
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