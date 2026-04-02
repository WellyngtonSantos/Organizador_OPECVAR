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
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import LockResetIcon from '@mui/icons-material/LockReset';
import DeleteIcon from '@mui/icons-material/Delete';
import type { User } from '../types/user';
import { useUsers } from '../hooks/useUsers';
import ConfirmDialog from '../components/common/ConfirmDialog';

interface UserFormState {
  name: string;
  email: string;
  password: string;
  role: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

export default function UsersPage() {
  const { users, loading, createUser, updateUser, resetPassword, deleteUser } = useUsers();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState<UserFormState>({ name: '', email: '', password: '', role: 'ANALYST' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordUserId, setPasswordUserId] = useState<string>('');
  const [newPassword, setNewPassword] = useState('');

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string>('');

  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'success' });

  const handleOpenCreate = useCallback(() => {
    setForm({ name: '', email: '', password: '', role: 'ANALYST' });
    setFormErrors({});
    setDialogMode('create');
    setDialogOpen(true);
  }, []);

  const handleOpenEdit = useCallback((user: User) => {
    setEditingUser(user);
    setForm({ name: user.name, email: user.email, password: '', role: user.role });
    setFormErrors({});
    setDialogMode('edit');
    setDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingUser(null);
  }, []);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = 'Nome obrigatorio';
    if (!form.email.trim()) errors.email = 'Email obrigatorio';
    if (dialogMode === 'create') {
      if (form.password.length < 8) errors.password = 'Minimo 8 caracteres';
      else if (!/[A-Z]/.test(form.password)) errors.password = 'Deve conter ao menos uma letra maiuscula';
      else if (!/[0-9]/.test(form.password)) errors.password = 'Deve conter ao menos um numero';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;
    try {
      if (dialogMode === 'create') {
        await createUser(form);
        setSnackbar({ open: true, message: 'Usuario criado com sucesso!', severity: 'success' });
      } else if (editingUser) {
        await updateUser(editingUser.id, { name: form.name, email: form.email, role: form.role });
        setSnackbar({ open: true, message: 'Usuario atualizado com sucesso!', severity: 'success' });
      }
      handleCloseDialog();
    } catch {
      setSnackbar({ open: true, message: 'Erro ao salvar usuario. Verifique se o email ja existe.', severity: 'error' });
    }
  }, [form, dialogMode, editingUser, createUser, updateUser, handleCloseDialog]);

  const handleToggleActive = useCallback(async (user: User) => {
    try {
      await updateUser(user.id, { active: !user.active });
      setSnackbar({
        open: true,
        message: `Usuario ${!user.active ? 'ativado' : 'desativado'} com sucesso!`,
        severity: 'success',
      });
    } catch {
      setSnackbar({ open: true, message: 'Erro ao alterar status do usuario.', severity: 'error' });
    }
  }, [updateUser]);

  const handleOpenResetPassword = useCallback((userId: string) => {
    setPasswordUserId(userId);
    setNewPassword('');
    setPasswordDialogOpen(true);
  }, []);

  const passwordValid = newPassword.length >= 8 && /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword);

  const handleResetPassword = useCallback(async () => {
    if (!passwordValid) return;
    try {
      await resetPassword(passwordUserId, newPassword);
      setPasswordDialogOpen(false);
      setSnackbar({ open: true, message: 'Senha resetada com sucesso!', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Erro ao resetar senha.', severity: 'error' });
    }
  }, [passwordUserId, newPassword, passwordValid, resetPassword]);

  const handleOpenDelete = useCallback((userId: string) => {
    setDeleteUserId(userId);
    setDeleteDialogOpen(true);
  }, []);

  const handleDelete = useCallback(async () => {
    try {
      await deleteUser(deleteUserId);
      setDeleteDialogOpen(false);
      setSnackbar({ open: true, message: 'Usuario excluido com sucesso!', severity: 'success' });
    } catch {
      setSnackbar({
        open: true,
        message: 'Erro ao excluir usuario. Desative-o se possuir tarefas atribuidas.',
        severity: 'error',
      });
      setDeleteDialogOpen(false);
    }
  }, [deleteUserId, deleteUser]);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">Gestao de Usuarios</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
          Novo Usuario
        </Button>
      </Stack>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Nome</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Cargo</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell align="right"><strong>Acoes</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">Carregando...</TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">Nenhum usuario encontrado</TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} sx={{ opacity: user.active ? 1 : 0.5 }}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role === 'MANAGER' ? 'Gestor' : 'Analista'}
                      size="small"
                      color={user.role === 'MANAGER' ? 'primary' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={user.active}
                          onChange={() => handleToggleActive(user)}
                          size="small"
                        />
                      }
                      label={user.active ? 'Ativo' : 'Inativo'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => handleOpenEdit(user)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Resetar senha">
                      <IconButton size="small" onClick={() => handleOpenResetPassword(user.id)}>
                        <LockResetIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton size="small" onClick={() => handleOpenDelete(user.id)} sx={{ color: 'error.main' }}>
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
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle>{dialogMode === 'create' ? 'Novo Usuario' : 'Editar Usuario'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nome"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              error={!!formErrors.name}
              helperText={formErrors.name}
              fullWidth
              size="small"
            />
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              error={!!formErrors.email}
              helperText={formErrors.email}
              fullWidth
              size="small"
            />
            {dialogMode === 'create' && (
              <TextField
                label="Senha"
                type="password"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                error={!!formErrors.password}
                helperText={formErrors.password || 'Min 8 chars, 1 maiuscula, 1 numero'}
                fullWidth
                size="small"
              />
            )}
            <FormControl size="small" fullWidth>
              <InputLabel>Cargo</InputLabel>
              <Select
                value={form.role}
                label="Cargo"
                onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
              >
                <MenuItem value="ANALYST">Analista</MenuItem>
                <MenuItem value="MANAGER">Gestor</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {dialogMode === 'create' ? 'Criar' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Resetar Senha</DialogTitle>
        <DialogContent>
          <TextField
            label="Nova Senha"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
            size="small"
            sx={{ mt: 1 }}
            helperText="Min 8 chars, 1 maiuscula, 1 numero"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleResetPassword} disabled={!passwordValid}>
            Resetar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Excluir Usuario"
        message="Tem certeza que deseja excluir este usuario? Se ele possuir tarefas atribuidas, desative-o ao inves de excluir."
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
