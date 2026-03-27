import React from 'react';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';

interface PageSkeletonProps {
  variant: 'dashboard' | 'queue' | 'table';
}

function DashboardSkeleton() {
  return (
    <Stack spacing={3}>
      {/* Summary cards */}
      <Grid container spacing={2}>
        {[1, 2, 3, 4].map((i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Paper sx={{ p: 2.5, borderRadius: 2 }}>
              <Skeleton variant="text" width="60%" height={20} />
              <Skeleton variant="text" width="40%" height={40} />
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {[1, 2].map((i) => (
          <Grid item xs={12} md={6} key={i}>
            <Paper sx={{ p: 2.5, borderRadius: 2 }}>
              <Skeleton variant="text" width="50%" height={24} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 1 }} />
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {[1, 2].map((i) => (
          <Grid item xs={12} md={6} key={i}>
            <Paper sx={{ p: 2.5, borderRadius: 2 }}>
              <Skeleton variant="text" width="50%" height={24} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 1 }} />
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}

function QueueSkeleton() {
  return (
    <Paper sx={{ p: 2, borderRadius: 2 }}>
      <Skeleton variant="text" width="70%" height={20} sx={{ mb: 2 }} />
      {[1, 2, 3, 4, 5].map((i) => (
        <Box key={i} sx={{ mb: 1.5 }}>
          <Skeleton variant="rectangular" height={64} sx={{ borderRadius: 1 }} />
        </Box>
      ))}
    </Paper>
  );
}

function TableSkeleton() {
  return (
    <Paper sx={{ p: 2, borderRadius: 2 }}>
      <Skeleton variant="rectangular" height={40} sx={{ mb: 1, borderRadius: 1 }} />
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <Skeleton key={i} variant="rectangular" height={36} sx={{ mb: 0.5, borderRadius: 0.5 }} />
      ))}
    </Paper>
  );
}

export default function PageSkeleton({ variant }: PageSkeletonProps) {
  switch (variant) {
    case 'dashboard':
      return <DashboardSkeleton />;
    case 'queue':
      return <QueueSkeleton />;
    case 'table':
      return <TableSkeleton />;
  }
}
