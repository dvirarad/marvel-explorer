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
import { useApi } from '../contexts/ApiContext';

const MoviesPerActor = () => {
  const apiService = useApi();
  const [moviesPerActor, setMoviesPerActor] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedActor, setSelectedActor] = useState(null);
  const [actorDetails, setActorDetails] = useState(null);

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

      // Update total count and pagination info
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

    // Update actor details when selected
    if (newValue && moviesPerActor[newValue]) {
      setActorDetails({
        name: newValue,
        profileUrl: moviesPerActor[newValue]?.actorImageUrl || `/api/placeholder/300/450?text=${encodeURIComponent(newValue)}`
      });
    } else {
      setActorDetails(null);
    }
  };

  // Get sorted list of actors for Autocomplete
  const actors = Object.keys(moviesPerActor).sort();

  // Get movie list for selected actor
  const getMoviesForSelectedActor = () => {
    if (!selectedActor || !moviesPerActor[selectedActor]) return [];

    // Handle both old and new response formats
    const actorData = moviesPerActor[selectedActor];

    // If it's the new format with movies array
    if (actorData.movies) {
      return actorData.movies;
    }

    // If it's the old format (just an array of movie titles)
    if (Array.isArray(actorData)) {
      return actorData;
    }

    return [];
  };

  // Get movie image URL
  const getMovieImageUrl = (movie) => {
    // If movie is an object with imageUrl property
    if (typeof movie === 'object' && movie.imageUrl) {
      return movie.imageUrl;
    }

    // Otherwise use a placeholder
    const title = typeof movie === 'object' ? movie.title : movie;
    return `/api/placeholder/200/300?text=${encodeURIComponent(title)}`;
  };

  // Get movie title
  const getMovieTitle = (movie) => {
    return typeof movie === 'object' ? movie.title : movie;
  };

  // Get number of movies for selected actor
  const getMovieCount = () => {
    if (!selectedActor || !moviesPerActor[selectedActor]) return 0;

    const actorData = moviesPerActor[selectedActor];

    if (actorData.movies) {
      return actorData.movies.length;
    }

    if (Array.isArray(actorData)) {
      return actorData.length;
    }

    return 0;
  };

  const movies = getMoviesForSelectedActor();

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
                        {getMovieCount()} Marvel movies
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

                  {movies.length > 0 ? (
                    <List sx={{ width: '100%' }}>
                      {movies.map((movie, index) => (
                        <React.Fragment key={getMovieTitle(movie)}>
                          <ListItem alignItems="flex-start">
                            <ListItemAvatar>
                              <Avatar
                                variant="rounded"
                                src={getMovieImageUrl(movie)}
                                alt={getMovieTitle(movie)}
                                sx={{ width: 60, height: 90, mr: 1 }}
                              />
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold' }}>
                                  {getMovieTitle(movie)}
                                </Typography>
                              }
                            />
                          </ListItem>
                          {index < movies.length - 1 && (
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
