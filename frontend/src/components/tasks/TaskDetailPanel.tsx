import React, { useState, useCallback } from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CircularProgress from '@mui/material/CircularProgress';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTask } from '../../hooks/useTask';
import { useBuckets } from '../../hooks/useBuckets';
import { useLabels } from '../../hooks/useLabels';
import { useAnalysts } from '../../hooks/useAnalysts';
import type { CreateTaskInput, UpdateTaskInput } from '../../types/task';
import TaskForm from './TaskForm';
import TaskNotes from './TaskNotes';
import TaskHistoryList from './TaskHistoryList';
import ConfirmDialog from '../common/ConfirmDialog';

interface TaskDetailPanelProps {
  open: boolean;
  taskId?: string | null;
  mode: 'create' | 'edit';
  onClose: () => void;
  onTaskCreated?: (task: unknown) => void;
  onTaskUpdated?: () => void;
  onTaskDeleted?: () => void;
  onCreateTask?: (data: CreateTaskInput) => Promise<unknown>;
}

const DRAWER_WIDTH = 520;

export default function TaskDetailPanel({
  open,
  taskId,
  mode,
  onClose,
  onTaskCreated,
  onTaskUpdated,
  onTaskDeleted,
  onCreateTask,
}: TaskDetailPanelProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    task,
    loading,
    updateTask,
    deleteTask: deleteTaskFromHook,
    notes,
    notesLoading,
    addNote,
    deleteNote,
    history,
    historyLoading,
    fetchHistory,
  } = useTask(mode === 'edit' && taskId ? taskId : undefined);

  const { buckets } = useBuckets();
  const { labels } = useLabels();
  const { analysts } = useAnalysts();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    if (newValue === 2 && history.length === 0) {
      fetchHistory();
    }
  };

  const handleSubmit = useCallback(
    async (data: CreateTaskInput | UpdateTaskInput) => {
      setSaving(true);
      try {
        if (mode === 'create' && onCreateTask) {
          const created = await onCreateTask(data as CreateTaskInput);
          onTaskCreated?.(created);
          onClose();
        } else {
          await updateTask(data as UpdateTaskInput);
          onTaskUpdated?.();
        }
      } finally {
        setSaving(false);
      }
    },
    [mode, onCreateTask, onTaskCreated, onClose, updateTask, onTaskUpdated],
  );

  const handleDelete = useCallback(async () => {
    setConfirmDeleteOpen(false);
    try {
      await deleteTaskFromHook();
      onTaskDeleted?.();
      onClose();
    } catch {
      // error is handled by the hook
    }
  }, [deleteTaskFromHook, onTaskDeleted, onClose]);

  const handleAddNote = useCallback(
    async (content: string) => {
      await addNote(content);
    },
    [addNote],
  );

  const handleDeleteNote = useCallback(
    async (noteId: string) => {
      await deleteNote(noteId);
    },
    [deleteNote],
  );

  const title = mode === 'create' ? 'Nova Tarefa' : task?.name ?? 'Carregando...';

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        sx={{
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            maxWidth: '100vw',
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6" noWrap sx={{ flex: 1, mr: 1 }}>
            {title}
          </Typography>
          <Stack direction="row" spacing={0.5}>
            {mode === 'edit' && (
              <IconButton
                size="small"
                onClick={() => setConfirmDeleteOpen(true)}
                sx={{ color: 'error.main' }}
              >
                <DeleteIcon />
              </IconButton>
            )}
            <IconButton size="small" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </Box>

        {/* Content */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {mode === 'edit' && (
              <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
                <Tab label="Detalhes" />
                <Tab label="Notas" />
                <Tab label="Historico" />
              </Tabs>
            )}

            <Box sx={{ overflow: 'auto', flex: 1 }}>
              {(mode === 'create' || activeTab === 0) && (
                <TaskForm
                  mode={mode}
                  task={task}
                  analysts={analysts}
                  buckets={buckets}
                  labels={labels}
                  onSubmit={handleSubmit}
                  onCancel={onClose}
                  loading={saving}
                />
              )}

              {mode === 'edit' && activeTab === 1 && (
                <TaskNotes
                  notes={notes}
                  loading={notesLoading}
                  onAddNote={handleAddNote}
                  onDeleteNote={handleDeleteNote}
                />
              )}

              {mode === 'edit' && activeTab === 2 && (
                <TaskHistoryList history={history} loading={historyLoading} />
              )}
            </Box>
          </>
        )}
      </Drawer>

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Excluir Tarefa"
        message="Tem certeza que deseja excluir esta tarefa? Esta acao nao pode ser desfeita."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </>
  );
}
