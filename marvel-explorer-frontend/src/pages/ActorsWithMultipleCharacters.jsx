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
  CardMedia,
  TextField,
  InputAdornment,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import MovieIcon from '@mui/icons-material/Movie';
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

  // Get sorted list of actors and filter by search
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

  // Handle refresh button click
  const handleRefresh = () => {
    setPage(0);
    setActorsData({});
    setHasMore(true);
    setInitialLoad(true);
    setSearchQuery('');
  };

  // Handle search input
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
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
        <InfiniteScroll
          dataLength={actors.length}
          next={loadMoreActors}
          hasMore={hasMore}
          loader={
            <Box textAlign="center" py={3}>
              <CircularProgress size={40} />
            </Box>
          }
          endMessage={
            <Box textAlign="center" py={3}>
              <Typography color="textSecondary">
                {actors.length > 0
                  ? `Showing all ${actors.length} of ${totalActors} actors`
                  : 'No actors found'}
              </Typography>
            </Box>
          }
        >
          <Grid container spacing={3}>
            {actors.map((actor) => (
              <Grid item xs={12} md={6} key={actor}>
                <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Box sx={{ display: 'flex', p: 2, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                    <Avatar
                      src={`/api/placeholder/150/150?text=${encodeURIComponent(actor.split(' ')[0])}`}
                      alt={actor}
                      sx={{
                        width: 80,
                        height: 80,
                        mr: 2,
                        border: '2px solid',
                        borderColor: 'primary.main'
                      }}
                    />
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {actor}
                      </Typography>
                      <Chip
                        label={`${actorsData[actor]?.length || 0} different characters`}
                        color="secondary"
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Box>

                  <CardContent sx={{ flexGrow: 1, pt: 2 }}>
                    <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                      Characters Played:
                    </Typography>

                    <List>
                      {actorsData[actor]?.map((role, index) => (
                        <React.Fragment key={`${role.movieName}-${role.characterName}`}>
                          <ListItem
                            sx={{
                              p: 2,
                              borderRadius: 1,
                              bgcolor: index % 2 === 0 ? 'rgba(0,0,0,0.02)' : 'transparent',
                            }}
                          >
                            <Box sx={{ width: '100%' }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Typography variant="body1" fontWeight="bold" color="primary">
                                  {role.characterName}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                <MovieIcon color="action" fontSize="small" sx={{ mr: 1 }} />
                                <Typography variant="body2" color="text.secondary">
                                  {role.movieName}
                                </Typography>
                              </Box>
                              <Box sx={{ mt: 2 }}>
                                <CardMedia
                                  component="img"
                                  height="140"
                                  image={`/api/placeholder/300/150?text=${encodeURIComponent(role.movieName)}`}
                                  alt={role.movieName}
                                  sx={{
                                    borderRadius: 1,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    objectFit: 'cover',
                                    objectPosition: 'center',
                                  }}
                                />
                              </Box>
                            </Box>
                          </ListItem>
                          {index < actorsData[actor].length - 1 && <Divider component="li" />}
                        </React.Fragment>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </InfiniteScroll>
      )}

      {/* Load more button (when not using infinite scroll) */}
      {hasMore && !loading && (
        <Box textAlign="center" mt={3}>
          <Button onClick={loadMoreActors} variant="outlined" color="primary">
            Load More Actors
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ActorsWithMultipleCharacters;
