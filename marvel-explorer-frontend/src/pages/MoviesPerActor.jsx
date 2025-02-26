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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  ListItem,
  ListItemText,
} from '@mui/material';
import { FixedSizeList as List } from 'react-window';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useApi } from '../contexts/ApiContext';

const MoviesPerActor = () => {
  const apiService = useApi();
  const [moviesPerActor, setMoviesPerActor] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedActor, setSelectedActor] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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

      const response = await apiService.getMoviesPerActor(page, 10); // Load 10 actors at a time

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

  // Get sorted list of actors
  const actors = Object.keys(moviesPerActor).sort();

  // Filter actors based on search query
  const filteredActors = actors.filter(actor =>
    actor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle actor selection
  const handleActorChange = (event) => {
    setSelectedActor(event.target.value);
  };

  // Handle search query change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Render function for virtualized list
  const renderMovieItem = ({ index, style }) => {
    if (!selectedActor || !moviesPerActor[selectedActor]) return null;

    const movie = moviesPerActor[selectedActor][index];

    return (
      <div style={style}>
        <ListItem>
          <ListItemText primary={movie} />
        </ListItem>
        {index < moviesPerActor[selectedActor].length - 1 && <Divider />}
      </div>
    );
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Movies Per Actor
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Select an Actor
              </Typography>
              <TextField
                fullWidth
                label="Search Actors"
                variant="outlined"
                value={searchQuery}
                onChange={handleSearchChange}
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel id="actor-select-label">Actor</InputLabel>
                <Select
                  labelId="actor-select-label"
                  id="actor-select"
                  value={selectedActor}
                  label="Actor"
                  onChange={handleActorChange}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {filteredActors.map((actor) => (
                    <MenuItem key={actor} value={actor}>
                      {actor}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Infinite scroll for loading more actors */}
              {filteredActors.length < totalActors && hasMore && (
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

                  {/* Use virtualized list for better performance with large data */}
                  {moviesPerActor[selectedActor]?.length > 0 ? (
                    <Box height={400} sx={{ overflowX: 'hidden' }}>
                      <List
                        height={400}
                        width="100%"
                        itemCount={moviesPerActor[selectedActor].length}
                        itemSize={50}
                      >
                        {renderMovieItem}
                      </List>
                    </Box>
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

      {/* Loading indicator */}
      {loading && (
        <Box textAlign="center" mt={3}>
          <CircularProgress size={40} />
        </Box>
      )}
    </Box>
  );
};

export default MoviesPerActor;
