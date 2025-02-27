// src/pages/CharactersWithMultipleActors.jsx
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
  TextField,
  InputAdornment,
  Button,
  CardMedia,
  CardHeader,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import PersonIcon from '@mui/icons-material/Person';
import { useApi } from '../contexts/ApiContext';

const CharactersWithMultipleActors = () => {
  const apiService = useApi();
  const [charactersData, setCharactersData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCharactersWithMultipleActors(page, 10);

      // Merge new data with existing data
      setCharactersData(prevData => ({
        ...prevData,
        ...(response.data || {}),
      }));

      // Update pagination info
      if (response.pagination) {
        setHasMore(response.pagination.hasNextPage);
      } else {
        setHasMore(false);
      }

      setPage(prevPage => prevPage + 1);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data. Please try again later.');
      console.error('Error fetching characters with multiple actors:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get sorted list of characters and filter by search
  const characters = Object.keys(charactersData)
    .filter(name => name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort();

  // Prepare data for visualization
  const chartData = characters
    .map(character => ({
      name: character,
      actors: charactersData[character]?.length || 0
    }))
    .slice(0, 10); // Only show top 10 in chart

  // Handle search input
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Handle refresh button click
  const handleRefresh = () => {
    setPage(0);
    setCharactersData({});
    setHasMore(true);
    setSearchQuery('');
    fetchData();
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
          Characters with Multiple Actors
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
          placeholder="Search Characters"
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

      {loading && characters.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      ) : characters.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          No characters found who were played by multiple actors.
        </Alert>
      ) : (
        <>
          <Card sx={{ mb: 4 }}>
            <CardHeader title="Actors per Character" />
            <CardContent sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={70}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="actors"
                    fill="#E23636" // Marvel red
                    name="Number of Actors"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Grid container spacing={3}>
            {characters.map((character) => (
              <Grid item xs={12} md={6} key={character}>
                <Card sx={{ height: '100%' }}>
                  <Box sx={{
                    p: 2,
                    borderBottom: '1px solid rgba(0,0,0,0.08)',
                    background: 'linear-gradient(145deg, #f5f5f5, #ffffff)',
                  }}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 1,
                      position: 'relative',
                    }}>
                      {/* Character icon using first letter */}
                      <Avatar
                        sx={{
                          bgcolor: 'secondary.main',
                          width: 60,
                          height: 60,
                          mr: 2,
                          border: '3px solid white',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                        }}
                      >
                        {character.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="h5" fontWeight="bold">
                          {character}
                        </Typography>
                        <Chip
                          label={`${charactersData[character]?.length || 0} actors`}
                          color="primary"
                          size="small"
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </Box>
                    <CardMedia
                      component="img"
                      height="180"
                      image={`/api/placeholder/600/200?text=${encodeURIComponent(character)}`}
                      alt={character}
                      sx={{
                        mt: 2,
                        borderRadius: 1,
                        boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                      }}
                    />
                  </Box>

                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                      Portrayed by:
                    </Typography>

                    <List>
                      {charactersData[character].map((role, index) => (
                        <React.Fragment key={`${role.movieName}-${role.actorName}`}>
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
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                              <Avatar
                                src={`/api/placeholder/50/50?text=${encodeURIComponent(role.actorName.split(' ')[0])}`}
                                sx={{ mr: 1.5 }}
                              />
                              <Box>
                                <Typography variant="body1" fontWeight="bold">
                                  {role.actorName}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                  <Chip
                                    label={role.movieName}
                                    size="small"
                                    variant="outlined"
                                    color="secondary"
                                  />
                                </Box>
                              </Box>
                            </Box>
                          </ListItem>
                          {index < charactersData[character].length - 1 && (
                            <Divider variant="inset" component="li" />
                          )}
                        </React.Fragment>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Load more button */}
          {hasMore && !loading && (
            <Box textAlign="center" mt={4} mb={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={fetchData}
                disabled={loading}
              >
                Load More Characters
              </Button>
            </Box>
          )}

          {loading && (
            <Box textAlign="center" mt={3} mb={3}>
              <CircularProgress size={40} />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default CharactersWithMultipleActors;
