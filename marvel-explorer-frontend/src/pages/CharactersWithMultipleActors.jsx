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
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useApi } from '../contexts/ApiContext';

const CharactersWithMultipleActors = () => {
    const apiService = useApi();
    const [charactersData, setCharactersData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await apiService.getCharactersWithMultipleActors();
                setCharactersData(data);
                setError(null);
            } catch (err) {
                setError('Failed to fetch data. Please try again later.');
                console.error('Error fetching characters with multiple actors:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [apiService]);

    // Get sorted list of characters
    const characters = Object.keys(charactersData).sort();

    // Prepare data for visualization
    const chartData = characters.map(character => ({
        name: character,
        actors: charactersData[character]?.length || 0
    }));

    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom>
                Characters with Multiple Actors
            </Typography>

            {loading ? (
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
                    <Box sx={{ mb: 4, height: 300 }}>
                        <Typography variant="h6" gutterBottom>
                            Actors per Character
                        </Typography>
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
                                />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="actors" fill="#3f51b5" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>

                    <Grid container spacing={3}>
                        {characters.map((character) => (
                            <Grid item xs={12} md={6} key={character}>
                                <Card>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <Avatar
                                                sx={{
                                                    bgcolor: 'secondary.main',
                                                    width: 56,
                                                    height: 56,
                                                    mr: 2,
                                                }}
                                            >
                                                {character.split(' ')[0][0]}
                                            </Avatar>
                                            <Typography variant="h6">{character}</Typography>
                                        </Box>

                                        <Divider sx={{ mb: 2 }} />

                                        <Typography variant="subtitle1" gutterBottom>
                                            Played by:
                                        </Typography>

                                        <List>
                                            {charactersData[character].map((role, index) => (
                                                <React.Fragment key={`${role.movieName}-${role.actorName}`}>
                                                    <ListItem>
                                                        <ListItemText
                                                            primary={role.actorName}
                                                            secondary={
                                                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                                                    <Chip
                                                                        label={role.movieName}
                                                                        size="small"
                                                                        color="primary"
                                                                        variant="outlined"
                                                                    />
                                                                </Box>
                                                            }
                                                        />
                                                    </ListItem>
                                                    {index < charactersData[character].length - 1 && <Divider variant="inset" component="li" />}
                                                </React.Fragment>
                                            ))}
                                        </List>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </>
            )}
        </Box>
    );
};

export default CharactersWithMultipleActors;