// src/components/ui/MarvelTheme.jsx
import React from 'react';
import { Box, Typography, styled } from '@mui/material';

// Heading with Marvel-style underline
export const MarvelHeading = ({ children, ...props }) => {
  return (
    <Typography
      variant="h4"
      component="h1"
      color="primary"
      sx={{
        position: 'relative',
        fontWeight: 'bold',
        mb: 3,
        '&:after': {
          content: '""',
          position: 'absolute',
          bottom: '-8px',
          left: '0',
          width: '60px',
          height: '4px',
          bgcolor: 'primary.main',
          borderRadius: '2px'
        },
        ...props.sx
      }}
      {...props}
    >
      {children}
    </Typography>
  );
};

// Marvel-style card with hover effects
export const MarvelCard = styled(Box)(({ theme }) => ({
  backgroundColor: '#ffffff',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
  }
}));

// Marvel-style character avatar with first letter
export const CharacterAvatar = ({ name, size = 60, ...props }) => {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: 'secondary.main',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: size / 2,
        border: '3px solid white',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        ...props.sx
      }}
      {...props}
    >
      {name ? name.charAt(0) : '?'}
    </Box>
  );
};

// Marvel-style section background with pattern
export const MarvelSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  backgroundImage: 'linear-gradient(145deg, #F8F8F8 30%, #EEEEEE 90%)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'url("/assets/marvel-pattern.png")',
    backgroundSize: '100px 100px',
    backgroundRepeat: 'repeat',
    opacity: 0.05,
    zIndex: 0,
    borderRadius: 'inherit',
  },
  '& > *': {
    position: 'relative',
    zIndex: 1,
  }
}));

// Marvel gradient text
export const MarvelGradientText = styled(Typography)(({ theme }) => ({
  background: 'linear-gradient(45deg, #E23636 30%, #FF5F5F 90%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontWeight: 'bold',
  display: 'inline-block',
}));

export default {
  MarvelHeading,
  MarvelCard,
  CharacterAvatar,
  MarvelSection,
  MarvelGradientText
};
