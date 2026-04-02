import React, { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import AddIcon from '@mui/icons-material/Add';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import TableChartIcon from '@mui/icons-material/TableChart';
import { useTasks } from '../hooks/useTasks';
import { useTimer } from '../hooks/useTimer';
import { useBuckets } from '../hooks/useBuckets';
import { useAnalysts } from '../hooks/useAnalysts';
import type { FilterParams } from '../types/common';
import type { CreateTaskInput } from '../types/task';
import TaskFilters from '../components/tasks/TaskFilters';
import TaskDataGrid from '../components/tasks/TaskDataGrid';
import TaskDetailPanel from '../components/tasks/TaskDetailPanel';
import ImportDialog from '../components/tasks/ImportDialog';

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

  // Export menu
  const [exportAnchor, setExportAnchor] = useState<null | HTMLElement>(null);
  const [exporting, setExporting] = useState(false);

  const handleExport = useCallback(
    async (format: 'xlsx' | 'csv') => {
      setExportAnchor(null);
      setExporting(true);
      try {
        const params = new URLSearchParams();
        if (filters.status) params.set('status', Array.isArray(filters.status) ? filters.status.join(',') : filters.status);
        if (filters.priority) params.set('priority', Array.isArray(filters.priority) ? filters.priority.join(',') : filters.priority);
        if (filters.bucketId) params.set('bucketId', Array.isArray(filters.bucketId) ? filters.bucketId.join(',') : filters.bucketId);
        if (filters.analystId) params.set('analystId', Array.isArray(filters.analystId) ? filters.analystId.join(',') : filters.analystId);

        const token = localStorage.getItem('token');
        const url = `/api/export/${format}?${params.toString()}`;

        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Erro no export');

        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `tarefas_${new Date().toISOString().slice(0, 10)}.${format}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);

        setSnackbar({ open: true, message: 'Arquivo exportado com sucesso!', severity: 'success' });
      } catch {
        setSnackbar({ open: true, message: 'Erro ao exportar arquivo.', severity: 'error' });
      } finally {
        setExporting(false);
      }
    },
    [filters],
  );

  // Import dialog
  const [importOpen, setImportOpen] = useState(false);

  const handleImported = useCallback(() => {
    fetchTasks(filters);
    setSnackbar({ open: true, message: 'Tarefas importadas com sucesso!', severity: 'success' });
  }, [fetchTasks, filters]);

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
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<FileUploadIcon />}
            onClick={() => setImportOpen(true)}
          >
            Importar
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={(e) => setExportAnchor(e.currentTarget)}
            disabled={exporting}
          >
            {exporting ? 'Exportando...' : 'Exportar'}
          </Button>
          <Menu
            anchorEl={exportAnchor}
            open={Boolean(exportAnchor)}
            onClose={() => setExportAnchor(null)}
          >
            <MenuItem onClick={() => handleExport('xlsx')}>
              <ListItemIcon><TableChartIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Excel (.xlsx)</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleExport('csv')}>
              <ListItemIcon><DescriptionIcon fontSize="small" /></ListItemIcon>
              <ListItemText>CSV (.csv)</ListItemText>
            </MenuItem>
          </Menu>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleNewTask}
          >
            Nova Tarefa
          </Button>
        </Stack>
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

      {/* Import Dialog */}
      <ImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={handleImported}
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
