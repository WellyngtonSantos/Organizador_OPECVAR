import React, { useState, useCallback, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { SelectChangeEvent } from '@mui/material/Select';
import { useAnalysts } from '../hooks/useAnalysts';
import { useQueue } from '../hooks/useQueue';
import AnalystQueue from '../components/queue/AnalystQueue';
import PageSkeleton from '../components/common/PageSkeleton';

export default function QueuePage() {
  const [selectedAnalystId, setSelectedAnalystId] = useState<string>('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { analysts } = useAnalysts();
  const { tasks, loading, fetchQueue, reorder, setTasks } = useQueue();

  const handleAnalystChange = useCallback(
    (event: SelectChangeEvent) => {
      const id = event.target.value;
      setSelectedAnalystId(id);
      if (id) {
        fetchQueue(id);
      }
    },
    [fetchQueue],
  );

  const handleReorder = useCallback(
    async (taskIds: string[]) => {
      if (!selectedAnalystId) return;
      try {
        await reorder(selectedAnalystId, taskIds);
        setSnackbar({ open: true, message: 'Fila reordenada com sucesso!', severity: 'success' });
      } catch {
        setSnackbar({ open: true, message: 'Erro ao reordenar a fila.', severity: 'error' });
        // Re-fetch to restore server state
        fetchQueue(selectedAnalystId);
      }
    },
    [selectedAnalystId, reorder, fetchQueue],
  );

  // Auto-select first analyst
  useEffect(() => {
    if (analysts.length > 0 && !selectedAnalystId) {
      const firstId = analysts[0].id;
      setSelectedAnalystId(firstId);
      fetchQueue(firstId);
    }
  }, [analysts, selectedAnalystId, fetchQueue]);

  const selectedAnalyst = analysts.find((a) => a.id === selectedAnalystId);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">Fila de Demandas</Typography>

        <FormControl sx={{ minWidth: 250 }}>
          <InputLabel>Analista</InputLabel>
          <Select
            value={selectedAnalystId}
            onChange={handleAnalystChange}
            label="Analista"
            size="small"
          >
            {analysts.map((analyst) => (
              <MenuItem key={analyst.id} value={analyst.id}>
                {analyst.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {loading && tasks.length === 0 ? (
        <PageSkeleton variant="queue" />
      ) : (
        <Paper sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
            Arraste as tarefas para reorganizar a ordem de prioridade de {selectedAnalyst?.name ?? 'analista'}.
          </Typography>

          <AnalystQueue
            analystName={selectedAnalyst?.name ?? ''}
            tasks={tasks}
            loading={loading}
            onReorder={handleReorder}
            onSetTasks={setTasks}
          />
        </Paper>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
