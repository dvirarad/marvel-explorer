// src/pages/Home.jsx
import React from 'react';
import { Typography, Box, Grid, Card, CardContent, CardActions, Button, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Home = () => {
    return (
        <Box>
            <Box sx={{ mb: 6, textAlign: 'center' }}>
                <Typography variant="h3" component="h1" gutterBottom color="primary">
                    Marvel Explorer
                </Typography>
                <Typography variant="h5" component="p" gutterBottom color="text.secondary">
                    Discover connections between Marvel movies, actors, and characters
                </Typography>
            </Box>

            <Container maxWidth="lg">
                <Grid container spacing={4}>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="h5" component="h2" gutterBottom>
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
                                >
                                    Explore
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="h5" component="h2" gutterBottom>
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
                                >
                                    Explore
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="h5" component="h2" gutterBottom>
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
                                >
                                    Explore
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default Home;