import React from 'react';
import { Typography, Box, Grid, Card, CardContent, CardMedia, CardActions, Button, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { MarvelGradientText, MarvelSection } from '../components/ui/MarvelTheme';

const Home = () => {
  return (
    <Box>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <MarvelGradientText variant="h2" component="h1" sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' }, mb: 2 }}>
          MARVEL EXPLORER
        </MarvelGradientText>
        <Typography variant="h5" component="p" color="text.secondary">
          Discover connections between Marvel movies, actors, and characters
        </Typography>
      </Box>

      <MarvelSection sx={{ mb: 6, p: 4 }}>
        <Typography variant="h6" gutterBottom color="text.secondary" sx={{ fontWeight: 500 }}>
          Welcome to the Marvel Explorer! This application helps you discover interesting connections in the Marvel Cinematic Universe:
        </Typography>
        <ul style={{ color: '#555', lineHeight: 1.8 }}>
          <li>Find out which actors have played multiple Marvel characters</li>
          <li>Discover which characters have been portrayed by different actors</li>
          <li>Explore the Marvel filmography of your favorite actors</li>
        </ul>
      </MarvelSection>

      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 20px rgba(0,0,0,0.15)',
              }
            }}>
              <CardMedia
                component="div"
                sx={{
                  height: 200,
                  bgcolor: '#E23636', // Marvel red
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1.5rem',
                  backgroundImage: 'linear-gradient(135deg, #E23636 0%, #F5F5F5 100%)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::after': {
                    content: '"🎬"',
                    position: 'absolute',
                    fontSize: '5rem',
                    opacity: 0.2
                  }
                }}
              >
                MOVIES PER ACTOR
              </CardMedia>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="h2" gutterBottom color="primary" fontWeight="bold">
                  Movies Per Actor
                </Typography>
                <Typography variant="body1">
                  Explore which Marvel movies each actor has appeared in throughout the Marvel Cinematic Universe.
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  component={RouterLink}
                  to="/movies-per-actor"
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  Explore
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 20px rgba(0,0,0,0.15)',
              }
            }}>
              <CardMedia
                component="div"
                sx={{
                  height: 200,
                  bgcolor: '#518CCA', // Marvel blue
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1.5rem',
                  backgroundImage: 'linear-gradient(135deg, #518CCA 0%, #F5F5F5 100%)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::after': {
                    content: '"👨‍🎤"',
                    position: 'absolute',
                    fontSize: '5rem',
                    opacity: 0.2
                  }
                }}
              >
                ACTORS & CHARACTERS
              </CardMedia>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="h2" gutterBottom color="primary" fontWeight="bold">
                  Actors with Multiple Characters
                </Typography>
                <Typography variant="body1">
                  Discover which actors have portrayed different Marvel characters in various films.
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  component={RouterLink}
                  to="/actors-with-multiple-characters"
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  Explore
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 20px rgba(0,0,0,0.15)',
              }
            }}>
              <CardMedia
                component="div"
                sx={{
                  height: 200,
                  bgcolor: '#F78F3F', // Marvel orange
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1.5rem',
                  backgroundImage: 'linear-gradient(135deg, #F78F3F 0%, #F5F5F5 100%)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::after': {
                    content: '"🦸‍♂️"',
                    position: 'absolute',
                    fontSize: '5rem',
                    opacity: 0.2
                  }
                }}
              >
                CHARACTERS & ACTORS
              </CardMedia>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="h2" gutterBottom color="primary" fontWeight="bold">
                  Characters with Multiple Actors
                </Typography>
                <Typography variant="body1">
                  Find out which Marvel characters have been portrayed by different actors across various films.
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  component={RouterLink}
                  to="/characters-with-multiple-actors"
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  Explore
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 6, mb: 4, textAlign: 'center' }}>
          <Button
            component={RouterLink}
            to="/admin"
            variant="outlined"
            color="secondary"
            sx={{ mt: 2 }}
          >
            Database Administration
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
