// src/pages/AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  LinearProgress,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { useApi } from '../contexts/ApiContext';
import webSocketService from '../services/WebSocketService';

const AdminPanel = () => {
  const apiService = useApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // WebSocket and progress states
  const [connected, setConnected] = useState(false);
  const [progress, setProgress] = useState({
    percent: 0,
    message: '',
    status: null,
    eta: 0,
    details: {},
  });
  const [currentTask, setCurrentTask] = useState(null);
  const [showProgress, setShowProgress] = useState(false);

  // Connect to WebSocket when component mounts
  useEffect(() => {
    // Connect to WebSocket server
    webSocketService.connect();

    // Listen for connection state
    const unsubscribeConnection = webSocketService.onConnection(setConnected);

    // Listen for progress updates
    const unsubscribeProgress = webSocketService.onProgress('all', (data) => {
      // Only show progress for data import, not for cleaning
      if (data.message && data.message.toLowerCase().includes('import')) {
        setShowProgress(true);
        setProgress(data);
      }

      if (data.status === 'completed') {
        setLoading(false);
        setSnackbar({
          open: true,
          message: data.message || 'Operation completed successfully',
          severity: 'success',
        });

        // Reset progress after completion
        setTimeout(() => {
          setShowProgress(false);
          setProgress({
            percent: 0,
            message: '',
            status: null,
            eta: 0,
            details: {},
          });
        }, 3000);
      } else if (data.status === 'error') {
        setLoading(false);
        setError(data.message || 'An error occurred');
        setSnackbar({
          open: true,
          message: data.message || 'An error occurred',
          severity: 'error',
        });
        setShowProgress(false);
      }
    });

    // Clean up listeners on unmount
    return () => {
      unsubscribeConnection();
      unsubscribeProgress();
      // Don't disconnect here since other components might still be using the socket
    };
  }, []);

  const handleCleanDatabase = () => {
    setDialogAction('clean');
    setOpenDialog(true);
  };

  const handleReloadDatabase = () => {
    setDialogAction('reload');
    setOpenDialog(true);
  };

  const handleConfirmAction = async () => {
    setOpenDialog(false);
    setLoading(true);
    setError(null);

    // Reset progress
    setProgress({
      percent: 0,
      message: '',
      status: 'running',
      eta: 0,
      details: {},
    });

    // Only show progress for reload, not for clean
    setShowProgress(dialogAction === 'reload');

    // Generate a unique task ID
    const taskId = `${dialogAction}-db-${Date.now()}`;
    setCurrentTask(taskId);

    try {
      if (dialogAction === 'clean') {
        await apiService.cleanDatabase({ taskId });
        // For clean operations, we don't get progress updates, so handle completion here
        setLoading(false);
        setSnackbar({
          open: true,
          message: 'Database cleaned successfully!',
          severity: 'success',
        });
      } else if (dialogAction === 'reload') {
        await apiService.reloadDatabase({ taskId });
        // For reload, progress updates come via WebSocket, don't set loading to false here
        setSnackbar({
          open: true,
          message: 'Database reload started. Progress will be shown below...',
          severity: 'info',
        });
      }
    } catch (err) {
      setLoading(false);
      setError(
        `Failed to ${dialogAction} database: ${err.response?.data?.message || err.message}`
      );
      setSnackbar({
        open: true,
        message: `Error: ${err.response?.data?.message || err.message}`,
        severity: 'error',
      });
      setShowProgress(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Format ETA as mm:ss
  const formatEta = (seconds) => {
    if (!seconds || seconds <= 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get progress status for display
  const getProgressStatusChip = () => {
    switch (progress.status) {
      case 'running':
        return <Chip color="primary" icon={<AccessTimeIcon />} label="In Progress" />;
      case 'completed':
        return <Chip color="success" icon={<CheckCircleIcon />} label="Completed" />;
      case 'error':
        return <Chip color="error" icon={<ErrorIcon />} label="Error" />;
      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom color="primary"
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
                  }}>
        Database Administration
      </Typography>

      {!connected && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          WebSocket connection is not established. Progress updates will not be available.
        </Alert>
      )}

      <Paper sx={{ p: 3, mt: 3, mb: 3, backgroundColor: 'rgba(0,0,0,0.02)' }}>
        <Typography variant="h6" gutterBottom>
          Database Management
        </Typography>

        <Typography variant="body1" paragraph>
          Use these controls to manage the Marvel database. This allows you to refresh data and images from TMDB.
          Please use with caution as these actions cannot be undone.
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          If you don't see images for actors and movies, try reloading the database using the button below.
          The reload process will fetch and store all image URLs from TMDB. Progress will be shown only
          during the data import phase, not during database cleaning.
        </Alert>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 3 }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleCleanDatabase}
            disabled={loading}
          >
            Clean Database
          </Button>

          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={handleReloadDatabase}
            disabled={loading}
          >
            Reload Database with Images
          </Button>
        </Box>

        {loading && !showProgress && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 3 }}>
            <CircularProgress size={24} sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {dialogAction === 'clean'
                ? 'Cleaning database...'
                : 'Preparing to reload database...'}
            </Typography>
          </Box>
        )}

        {showProgress && (
          <Card sx={{ mt: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" color="primary">
                  Importing Marvel Data
                </Typography>
                {getProgressStatusChip()}
              </Box>

              <LinearProgress
                variant="determinate"
                value={progress.percent || 0}
                sx={{ height: 10, borderRadius: 5, mb: 2 }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {progress.percent || 0}% Complete
                </Typography>
                {progress.eta > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      ETA: {formatEta(progress.eta)}
                    </Typography>
                  </Box>
                )}
              </Box>

              <Typography variant="body1">
                {progress.message || 'Processing...'}
              </Typography>

              {progress.details?.current && progress.details?.total && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Processing movie {progress.details.current} of {progress.details.total}
                </Typography>
              )}
            </CardContent>
          </Card>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {dialogAction === 'clean' ? 'Clean Database?' : 'Reload Database?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {dialogAction === 'clean'
              ? 'This will remove ALL data from the database. This action cannot be undone.'
              : 'This will clean the database and reload all data from TMDB API including images. This may take several minutes to complete.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleConfirmAction}
            color={dialogAction === 'clean' ? 'error' : 'primary'}
            autoFocus
          >
            {dialogAction === 'clean' ? 'Clean' : 'Reload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminPanel;
