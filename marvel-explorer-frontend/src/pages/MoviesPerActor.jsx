// src/pages/MoviesPerActor.jsx
import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  TextField,
  Autocomplete,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useApi } from '../contexts/ApiContext';

const MoviesPerActor = () => {
  const apiService = useApi();
  const [moviesPerActor, setMoviesPerActor] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedActor, setSelectedActor] = useState(null);
  const [actorDetails, setActorDetails] = useState(null);
  const [movieImages, setMovieImages] = useState({});

  // Pagination state
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [totalActors, setTotalActors] = useState(0);

  // Initial data load
  useEffect(() => {
    if (initialLoad) {
      loadMoreActors();
    }
  }, [initialLoad]);

  // Function to load more actors
  const loadMoreActors = async () => {
    if (loading) return;

    try {
      setLoading(true);

      const response = await apiService.getMoviesPerActor(page, 20); // Load 20 actors at a time

      // Check if response has pagination info
      if (response.pagination) {
        setTotalActors(response.pagination.total);
        setHasMore(response.pagination.hasNextPage);
      } else {
        setHasMore(false);
      }

      // Merge new data with existing data
      setMoviesPerActor(prevData => ({
        ...prevData,
        ...(response.data || {}),
      }));

      // Increment page for next load
      setPage(prevPage => prevPage + 1);
      setInitialLoad(false);
    } catch (err) {
      setError('Failed to fetch data. Please try again later.');
      console.error('Error fetching movies per actor:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle actor selection
  const handleActorChange = (event, newValue) => {
    setSelectedActor(newValue);
  };

  // When an actor is selected, get their details from the backend
  useEffect(() => {
    const fetchActorDetails = async () => {
      if (selectedActor) {
        try {
          // For this MVP, we're using a placeholder for actor details
          // In a complete implementation, you would add a backend endpoint to fetch actor by name
          // with optional population of image
          setActorDetails({
            name: selectedActor,
            profileUrl: `/api/placeholder/300/450?text=${encodeURIComponent(selectedActor)}`
          });
        } catch (err) {
          console.error('Error fetching actor details:', err);
        }
      } else {
        setActorDetails(null);
      }
    };

    fetchActorDetails();
  }, [selectedActor]);

  // When an actor is selected, get movie images from backend
  useEffect(() => {
    const fetchMovieImages = async () => {
      if (selectedActor && moviesPerActor[selectedActor]) {
        const movies = moviesPerActor[selectedActor];
        const newImages = { ...movieImages };

        for (const movieTitle of movies) {
          if (!newImages[movieTitle]) {
            // Set placeholder for now
            newImages[movieTitle] = `/api/placeholder/200/300?text=${encodeURIComponent(movieTitle)}`;
          }
        }

        setMovieImages(newImages);
      }
    };

    fetchMovieImages();
  }, [selectedActor, moviesPerActor]);

  // Get sorted list of actors for Autocomplete
  const actors = Object.keys(moviesPerActor).sort();

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom color="primary"
                  sx={{
                    position: 'relative',
                    '&:after': {
                      content: '""',
                      position: 'absolute',
                      bottom: '-8px',
                      left: '0',
                      width: '60px',
                      height: '4px',
                      bgcolor: 'primary.main',
                      borderRadius: '2px'
                    }
                  }}>
        Movies Per Actor
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Select an Actor
              </Typography>

              {/* Combined search and selection field */}
              <Autocomplete
                id="actor-autocomplete"
                options={actors}
                value={selectedActor}
                onChange={handleActorChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search & Select Actor"
                    variant="outlined"
                    fullWidth
                  />
                )}
                loading={loading}
                loadingText="Loading actors..."
                noOptionsText="No actors found"
                fullWidth
              />

              {/* Load more actors button for infinite scrolling */}
              {actors.length < totalActors && hasMore && !loading && (
                <Box textAlign="center" mt={2}>
                  <Typography
                    color="primary"
                    sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={loadMoreActors}
                  >
                    Load more actors
                  </Typography>
                </Box>
              )}

              {loading && (
                <Box textAlign="center" mt={2}>
                  <CircularProgress size={24} />
                </Box>
              )}

              {/* Actor details card */}
              {actorDetails && (
                <Box mt={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar
                          src={actorDetails.profileUrl}
                          sx={{ width: 80, height: 80, mr: 2 }}
                          alt={actorDetails.name}
                        />
                        <Typography variant="h6">{actorDetails.name}</Typography>
                      </Box>

                      <Typography variant="body2" color="text.secondary">
                        {moviesPerActor[selectedActor]?.length || 0} Marvel movies
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              {selectedActor ? (
                <>
                  <Typography variant="h6" gutterBottom>
                    {selectedActor}'s Marvel Movies
                  </Typography>

                  <Divider sx={{ mb: 2 }} />

                  {moviesPerActor[selectedActor]?.length > 0 ? (
                    <List sx={{ width: '100%' }}>
                      {moviesPerActor[selectedActor].map((movie, index) => (
                        <React.Fragment key={movie}>
                          <ListItem alignItems="flex-start">
                            <ListItemAvatar>
                              <Avatar
                                variant="rounded"
                                src={movieImages[movie] || `/api/placeholder/200/300?text=${encodeURIComponent(movie)}`}
                                alt={movie}
                                sx={{ width: 60, height: 90, mr: 1 }}
                              />
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold' }}>
                                  {movie}
                                </Typography>
                              }
                            />
                          </ListItem>
                          {index < moviesPerActor[selectedActor].length - 1 && (
                            <Divider variant="inset" component="li" />
                          )}
                        </React.Fragment>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body1" color="text.secondary">
                      No movies found for this actor.
                    </Typography>
                  )}
                </>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  Please select an actor to see their Marvel movies.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MoviesPerActor;
