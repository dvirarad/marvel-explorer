import React from 'react';
import { Box, Typography, Container, Link } from '@mui/material';

const Footer = () => {
    return (
        <Box
            component="footer"
            sx={{
                py: 3,
                px: 2,
                mt: 'auto',
                backgroundColor: theme => theme.palette.grey[100],
            }}
        >
            <Container maxWidth="lg">
                <Typography variant="body2" color="text.secondary" align="center">
                    {'© '}
                    {new Date().getFullYear()}
                    {' Marvel Explorer. Data provided by '}
                    <Link
                        color="inherit"
                        href="https://www.themoviedb.org/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        TMDB
                    </Link>
                    {'.'}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                    This product uses the TMDB API but is not endorsed or certified by TMDB.
                </Typography>
            </Container>
        </Box>
    );
};

export default Footer;
