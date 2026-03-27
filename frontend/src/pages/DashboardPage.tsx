import React, { useState, useCallback, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { SelectChangeEvent } from '@mui/material/Select';
import PageSkeleton from '../components/common/PageSkeleton';
import { getMonday } from '../utils/dateUtils';
import { useDashboard } from '../hooks/useDashboard';
import { useAnalysts } from '../hooks/useAnalysts';
import WeekSelector from '../components/dashboard/WeekSelector';
import SummaryCards from '../components/dashboard/SummaryCards';
import HoursPerDayChart from '../components/dashboard/HoursPerDayChart';
import HoursPerAnalystChart from '../components/dashboard/HoursPerAnalystChart';
import BucketDistributionChart from '../components/dashboard/BucketDistributionChart';
import WeeklyTasksChart from '../components/dashboard/WeeklyTasksChart';
import EfficiencyCard from '../components/dashboard/EfficiencyCard';
import OverdueAlerts from '../components/dashboard/OverdueAlerts';

export default function DashboardPage() {
  const [monday, setMonday] = useState<Date>(() => getMonday());
  const [selectedAnalystId, setSelectedAnalystId] = useState<string>('');
  const { dashboard, loading, error, fetchDashboard } = useDashboard();
  const { analysts } = useAnalysts();

  useEffect(() => {
    fetchDashboard(monday.toISOString(), selectedAnalystId || undefined);
  }, [monday, selectedAnalystId, fetchDashboard]);

  const handlePrevious = useCallback(() => {
    setMonday((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  }, []);

  const handleNext = useCallback(() => {
    setMonday((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  }, []);

  const handleToday = useCallback(() => {
    setMonday(getMonday());
  }, []);

  const handleAnalystChange = useCallback((event: SelectChangeEvent) => {
    setSelectedAnalystId(event.target.value);
  }, []);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }} flexWrap="wrap" gap={2}>
        <Typography variant="h4">Dashboard Semanal</Typography>
        <Stack direction="row" alignItems="center" spacing={2}>
          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel>Analista</InputLabel>
            <Select
              value={selectedAnalystId}
              onChange={handleAnalystChange}
              label="Analista"
            >
              <MenuItem value="">Todos</MenuItem>
              {analysts.map((a) => (
                <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <WeekSelector
            monday={monday}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onToday={handleToday}
          />
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && !dashboard && <PageSkeleton variant="dashboard" />}

      {dashboard && (
        <Stack spacing={3}>
          <SummaryCards
            open={dashboard.summary.open}
            completed={dashboard.summary.completed}
            standBy={dashboard.summary.standBy}
            overdue={dashboard.summary.overdue}
          />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <HoursPerDayChart data={dashboard.hoursPerDay} />
            </Grid>
            <Grid item xs={12} md={6}>
              <HoursPerAnalystChart data={dashboard.hoursPerAnalyst} />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <WeeklyTasksChart data={dashboard.weeklyTasks} />
            </Grid>
            <Grid item xs={12} md={6}>
              <BucketDistributionChart data={dashboard.bucketDistribution} />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <EfficiencyCard
                estimated={dashboard.efficiency.estimated}
                actual={dashboard.efficiency.actual}
                ratio={dashboard.efficiency.ratio}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <OverdueAlerts alerts={dashboard.overdueAlerts} />
            </Grid>
          </Grid>
        </Stack>
      )}
    </Box>
  );
}
