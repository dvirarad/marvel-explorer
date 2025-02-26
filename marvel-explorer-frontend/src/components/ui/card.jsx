// src/components/ui/card.jsx
import React from 'react';
import { Card as MuiCard, CardHeader as MuiCardHeader, CardContent as MuiCardContent,
    CardActions as MuiCardActions, CardMedia as MuiCardMedia } from '@mui/material';

export function Card({ children, className, ...props }) {
    return (
        <MuiCard className={className} {...props}>
            {children}
        </MuiCard>
    );
}

export function CardHeader(props) {
    return <MuiCardHeader {...props} />;
}

export function CardContent(props) {
    return <MuiCardContent {...props} />;
}

export function CardActions(props) {
    return <MuiCardActions {...props} />;
}

export function CardMedia(props) {
    return <MuiCardMedia {...props} />;
}

export function CardTitle({ children, ...props }) {
    return <div {...props}>{children}</div>;
}