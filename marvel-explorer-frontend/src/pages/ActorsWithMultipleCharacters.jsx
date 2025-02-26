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
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useApi } from '../contexts/ApiContext';

const ActorsWithMultipleCharacters = () => {
  const apiService = useApi();
  const [actorsData, setActorsData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination state
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [totalActors, setTotalActors] = useState(0);

  // Get sorted list of actors
  const actors = Object.keys(actorsData).sort();

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
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" component="h1">
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
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: 'primary.main',
                          width: 56,
                          height: 56,
                          mr: 2,
                        }}
                      >
                        {actor.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <Typography variant="h6">{actor}</Typography>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <Typography variant="subtitle1" gutterBottom>
                      Characters Played:
                    </Typography>

                    <List>
                      {actorsData[actor]?.map((role, index) => (
                        <React.Fragment key={`${role.movieName}-${role.characterName}`}>
                          <ListItem>
                            <ListItemText
                              primary={role.characterName}
                              secondary={
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                  <Chip
                                    label={role.movieName}
                                    size="small"
                                    color="secondary"
                                    variant="outlined"
                                  />
                                </Box>
                              }
                            />
                          </ListItem>
                          {index < actorsData[actor].length - 1 && <Divider variant="inset" component="li" />}
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
    </Box>
  );
};

export default ActorsWithMultipleCharacters;
