
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';

const Header = () => {
    return (
        <AppBar position="static">
        <Toolbar>
            <Typography
                variant="h6"
    component={RouterLink}
    to="/"
    sx={{
        flexGrow: 1,
            textDecoration: 'none',
            color: 'white',
            fontWeight: 'bold',
    }}
>
    Marvel Explorer
    </Typography>
    <Box>
    <Button
        component={RouterLink}
    to="/movies-per-actor"
    color="inherit"
        >
        Movies Per Actor
    </Button>
    <Button
    component={RouterLink}
    to="/actors-with-multiple-characters"
    color="inherit"
        >
        Actors with Multiple Characters
    </Button>
    <Button
    component={RouterLink}
    to="/characters-with-multiple-actors"
    color="inherit"
        >
        Characters with Multiple Actors
    </Button>
    </Box>
    </Toolbar>
    </AppBar>
);
};

export default Header;