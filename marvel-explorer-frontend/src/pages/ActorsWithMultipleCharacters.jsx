// src/pages/ActorsWithMultipleCharacters.jsx
import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  Avatar,
  Chip,
  Button,
  TextField,
  InputAdornment,
  CardMedia,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useApi } from '../contexts/ApiContext';

const ActorsWithMultipleCharacters = () => {
  const apiService = useApi();
  const [actorsData, setActorsData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination state
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [totalActors, setTotalActors] = useState(0);

  // Get sorted list of actors and filter by search query
  const actors = Object.keys(actorsData)
    .filter(name => name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort();

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

      const response = await apiService.getActorsWithMultipleCharacters(page, 5); // Load 5 actors at a time

      // Update total count and pagination info
      if (response.pagination) {
        setTotalActors(response.pagination.total);
        setHasMore(response.pagination.hasNextPage);
      } else {
        setHasMore(false);
      }

      // Merge new data with existing data
      setActorsData(prevData => ({
        ...prevData,
        ...(response.data || {}),
      }));

      // Increment page for next load
      setPage(prevPage => prevPage + 1);
      setInitialLoad(false);
    } catch (err) {
      setError('Failed to fetch data. Please try again later.');
      console.error('Error fetching actors with multiple characters:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle search input
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Handle refresh button click
  const handleRefresh = () => {
    setPage(0);
    setActorsData({});
    setHasMore(true);
    setInitialLoad(true);
    setSearchQuery('');
  };

  // Get actor image URL
  const getActorImageUrl = (actor, actorName) => {
    if (actor && actor.actorImageUrl) {
      return actor.actorImageUrl;
    }
    return `/api/placeholder/200/200?text=${encodeURIComponent(actorName.split(' ')[0])}`;
  };

  // Get movie image URL for a character
  const getMovieImageUrl = (role) => {
    if (role && role.movieImageUrl) {
      return role.movieImageUrl;
    }
    return `/api/placeholder/100/150?text=${encodeURIComponent(role.movieName)}`;
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography
          variant="h4"
          component="h1"
          color="primary"
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
          }}
        >
          Actors with Multiple Marvel Characters
        </Typography>
        <Button
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          variant="outlined"
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Search box */}
      <Box mb={3} mt={3}>
        <TextField
          fullWidth
          placeholder="Search Actors"
          variant="outlined"
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Use InfiniteScroll component */}
      {actors.length === 0 && !loading && !initialLoad ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          No actors found who played multiple Marvel characters.
        </Alert>
      ) : (
        <>
          <Grid container spacing={3}>
            {actors.map((actor) => {
              // Get actor data
              const actorData = actorsData[actor];
              const characters = actorData?.characters || [];
              const actorImageUrl = getActorImageUrl(actorData, actor);

              return (
                <Grid item xs={12} md={6} key={actor}>
                  <Card sx={{ height: '100%' }}>
                    <Box sx={{
                      p: 2,
                      borderBottom: '1px solid rgba(0,0,0,0.08)',
                      background: 'linear-gradient(145deg, #f5f5f5, #ffffff)'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar
                          src={actorImageUrl}
                          sx={{
                            width: 70,
                            height: 70,
                            mr: 2,
                            border: '3px solid white',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                          }}
                        />
                        <Box>
                          <Typography variant="h5" fontWeight="bold">
                            {actor}
                          </Typography>
                          <Chip
                            label={`${characters.length} characters`}
                            color="primary"
                            size="small"
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      </Box>
                    </Box>

                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                        Characters Played:
                      </Typography>

                      <List>
                        {characters.map((role, index) => (
                          <React.Fragment key={`${role.movieName}-${role.characterName}`}>
                            <ListItem
                              sx={{
                                p: 2,
                                borderRadius: 1,
                                bgcolor: index % 2 === 0 ? 'rgba(0,0,0,0.02)' : 'transparent',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                              }}
                            >
                              <Box width="100%">
                                <Typography variant="body1" fontWeight="bold">
                                  {role.characterName}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                  <Chip
                                    label={role.movieName}
                                    size="small"
                                    color="secondary"
                                    variant="outlined"
                                  />
                                </Box>
                              </Box>
                              {role.movieImageUrl && (
                                <Box mt={1} width="100%">
                                  <img
                                    src={getMovieImageUrl(role)}
                                    alt={role.movieName}
                                    style={{
                                      height: 80,
                                      borderRadius: '4px',
                                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}
                                  />
                                </Box>
                              )}
                            </ListItem>
                            {index < characters.length - 1 && <Divider component="li" />}
                          </React.Fragment>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* Load more button */}
          {hasMore && !loading && (
            <Box textAlign="center" mt={4} mb={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={loadMoreActors}
                disabled={loading}
              >
                Load More Actors
              </Button>
            </Box>
          )}

          {loading && (
            <Box textAlign="center" py={3}>
              <CircularProgress size={40} />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default ActorsWithMultipleCharacters;
