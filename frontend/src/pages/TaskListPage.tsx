import React, { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import AddIcon from '@mui/icons-material/Add';
import { useTasks } from '../hooks/useTasks';
import { useTimer } from '../hooks/useTimer';
import { useBuckets } from '../hooks/useBuckets';
import { useAnalysts } from '../hooks/useAnalysts';
import type { FilterParams } from '../types/common';
import type { CreateTaskInput } from '../types/task';
import TaskFilters from '../components/tasks/TaskFilters';
import TaskDataGrid from '../components/tasks/TaskDataGrid';
import TaskDetailPanel from '../components/tasks/TaskDetailPanel';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

export default function TaskListPage() {
  const [filters, setFilters] = useState<FilterParams>({ page: 1, pageSize: 25 });
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<'create' | 'edit'>('edit');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { tasks, total, loading, fetchTasks, createTask, deleteTask } = useTasks(filters);
  const { activeSession } = useTimer();
  const { buckets } = useBuckets();
  const { analysts } = useAnalysts();

  const handleFilterChange = useCallback((newFilters: FilterParams) => {
    setFilters(newFilters);
  }, []);

  const handlePageChange = useCallback(
    (page: number, pageSize: number) => {
      setFilters((prev) => ({ ...prev, page, pageSize }));
    },
    [],
  );

  const handleRowClick = useCallback((taskId: string) => {
    setSelectedTaskId(taskId);
    setPanelMode('edit');
    setPanelOpen(true);
  }, []);

  const handleNewTask = useCallback(() => {
    setSelectedTaskId(null);
    setPanelMode('create');
    setPanelOpen(true);
  }, []);

  const handleClosePanel = useCallback(() => {
    setPanelOpen(false);
    setSelectedTaskId(null);
  }, []);

  const handleCreateTask = useCallback(
    async (data: CreateTaskInput) => {
      const task = await createTask(data);
      setSnackbar({ open: true, message: 'Tarefa criada com sucesso!', severity: 'success' });
      return task;
    },
    [createTask],
  );

  const handleTaskUpdated = useCallback(() => {
    setSnackbar({ open: true, message: 'Tarefa atualizada com sucesso!', severity: 'success' });
    fetchTasks(filters);
  }, [fetchTasks, filters]);

  const handleTaskDeleted = useCallback(() => {
    setSnackbar({ open: true, message: 'Tarefa excluida com sucesso!', severity: 'success' });
    fetchTasks(filters);
  }, [fetchTasks, filters]);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  return (
    <Box>
      {/* Page header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h4">Tarefas</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleNewTask}
        >
          Nova Tarefa
        </Button>
      </Stack>

      {/* Filters */}
      <TaskFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        buckets={buckets}
        analysts={analysts}
      />

      {/* Data Grid */}
      <TaskDataGrid
        tasks={tasks}
        loading={loading}
        total={total}
        page={filters.page ?? 1}
        pageSize={filters.pageSize ?? 25}
        onPageChange={handlePageChange}
        onRowClick={handleRowClick}
        activeTimerTaskId={activeSession?.taskId}
      />

      {/* Detail Panel */}
      <TaskDetailPanel
        open={panelOpen}
        taskId={selectedTaskId}
        mode={panelMode}
        onClose={handleClosePanel}
        onCreateTask={handleCreateTask}
        onTaskCreated={() => {
          /* task is already added to list by createTask */
        }}
        onTaskUpdated={handleTaskUpdated}
        onTaskDeleted={handleTaskDeleted}
      />

      {/* Snackbar feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
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
