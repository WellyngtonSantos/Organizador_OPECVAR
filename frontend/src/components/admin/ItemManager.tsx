import React, { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ConfirmDialog from '../common/ConfirmDialog';

interface Item {
  id: string;
  name: string;
  color: string | null;
}

interface ItemManagerProps {
  title: string;
  items: Item[];
  loading: boolean;
  onCreate: (data: { name: string; color?: string | null }) => Promise<unknown>;
  onUpdate: (id: string, data: { name?: string; color?: string | null }) => Promise<unknown>;
  onDelete: (id: string) => Promise<void>;
  deleteErrorMessage?: string;
}

export default function ItemManager({
  title,
  items,
  loading,
  onCreate,
  onUpdate,
  onDelete,
  deleteErrorMessage = 'Erro ao excluir. O item possui tarefas associadas.',
}: ItemManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formColor, setFormColor] = useState('#1976d2');
  const [nameError, setNameError] = useState('');

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string>('');

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleOpenCreate = useCallback(() => {
    setFormName('');
    setFormColor('#1976d2');
    setNameError('');
    setDialogMode('create');
    setDialogOpen(true);
  }, []);

  const handleOpenEdit = useCallback((item: Item) => {
    setEditingId(item.id);
    setFormName(item.name);
    setFormColor(item.color || '#1976d2');
    setNameError('');
    setDialogMode('edit');
    setDialogOpen(true);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!formName.trim()) {
      setNameError('Nome obrigatorio');
      return;
    }
    try {
      if (dialogMode === 'create') {
        await onCreate({ name: formName.trim(), color: formColor });
        setSnackbar({ open: true, message: `${title.slice(0, -1)} criado com sucesso!`, severity: 'success' });
      } else if (editingId) {
        await onUpdate(editingId, { name: formName.trim(), color: formColor });
        setSnackbar({ open: true, message: `${title.slice(0, -1)} atualizado com sucesso!`, severity: 'success' });
      }
      setDialogOpen(false);
    } catch {
      setSnackbar({ open: true, message: 'Erro ao salvar. Nome pode ja existir.', severity: 'error' });
    }
  }, [formName, formColor, dialogMode, editingId, onCreate, onUpdate, title]);

  const handleDelete = useCallback(async () => {
    try {
      await onDelete(deleteId);
      setDeleteDialogOpen(false);
      setSnackbar({ open: true, message: `${title.slice(0, -1)} excluido com sucesso!`, severity: 'success' });
    } catch {
      setDeleteDialogOpen(false);
      setSnackbar({ open: true, message: deleteErrorMessage, severity: 'error' });
    }
  }, [deleteId, onDelete, title, deleteErrorMessage]);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6">{title}</Typography>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={handleOpenCreate} size="small">
          Novo
        </Button>
      </Stack>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell width={50}><strong>Cor</strong></TableCell>
              <TableCell><strong>Nome</strong></TableCell>
              <TableCell align="right" width={100}><strong>Acoes</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} align="center">Carregando...</TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">Nenhum item</TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: 1,
                        bgcolor: item.color || '#9e9e9e',
                        border: 1,
                        borderColor: 'divider',
                      }}
                    />
                  </TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => handleOpenEdit(item)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton
                        size="small"
                        onClick={() => { setDeleteId(item.id); setDeleteDialogOpen(true); }}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{dialogMode === 'create' ? 'Novo Item' : 'Editar Item'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nome"
              value={formName}
              onChange={(e) => { setFormName(e.target.value); setNameError(''); }}
              error={!!nameError}
              helperText={nameError}
              fullWidth
              size="small"
            />
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="body2">Cor:</Typography>
              <input
                type="color"
                value={formColor}
                onChange={(e) => setFormColor(e.target.value)}
                style={{ width: 48, height: 36, border: 'none', cursor: 'pointer', borderRadius: 4 }}
              />
              <Typography variant="caption" color="text.secondary">{formColor}</Typography>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {dialogMode === 'create' ? 'Criar' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Excluir Item"
        message="Tem certeza que deseja excluir este item? Itens com tarefas associadas nao podem ser excluidos."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />

      {/* Snackbar */}
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
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
