import React, { useEffect, useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import RefreshIcon from '@mui/icons-material/Refresh';
import SecurityIcon from '@mui/icons-material/Security';
import dayjs from 'dayjs';
import apiClient from '../api/client';

interface AuditLogEntry {
  id: string;
  action: string;
  userId: string | null;
  email: string | null;
  ipAddress: string;
  userAgent: string | null;
  details: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string } | null;
}

const ACTION_LABELS: Record<string, { label: string; color: 'success' | 'error' | 'warning' | 'info' | 'default' }> = {
  LOGIN_SUCCESS: { label: 'Login OK', color: 'success' },
  LOGIN_FAILED: { label: 'Login Falhou', color: 'error' },
  TOKEN_INVALID: { label: 'Token Invalido', color: 'error' },
  TOKEN_EXPIRED: { label: 'Token Expirado', color: 'warning' },
  ACCESS_DENIED: { label: 'Acesso Negado', color: 'error' },
  REGISTER: { label: 'Registro', color: 'info' },
  PASSWORD_RESET: { label: 'Reset Senha', color: 'warning' },
  USER_CREATED: { label: 'Usuario Criado', color: 'info' },
  USER_DELETED: { label: 'Usuario Excluido', color: 'error' },
  ACCOUNT_LOCKED: { label: 'Conta Bloqueada', color: 'error' },
};

const ALL_ACTIONS = Object.keys(ACTION_LABELS);

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [loading, setLoading] = useState(false);
  const [filterAction, setFilterAction] = useState('');
  const [filterIp, setFilterIp] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page: page + 1,
        limit: rowsPerPage,
      };
      if (filterAction) params.action = filterAction;
      if (filterIp) params.ipAddress = filterIp;

      const { data } = await apiClient.get('/audit-logs', { params });
      setLogs(data.items);
      setTotal(data.total);
    } catch {
      // silently fail — user sees empty table
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filterAction, filterIp]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
        <SecurityIcon color="primary" />
        <Typography variant="h4">Log de Auditoria</Typography>
        <Tooltip title="Atualizar">
          <IconButton onClick={fetchLogs} size="small" sx={{ ml: 1 }}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Paper sx={{ mb: 2, p: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            select
            label="Acao"
            value={filterAction}
            onChange={(e) => { setFilterAction(e.target.value); setPage(0); }}
            size="small"
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">Todas</MenuItem>
            {ALL_ACTIONS.map((a) => (
              <MenuItem key={a} value={a}>{ACTION_LABELS[a].label}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Filtrar por IP"
            value={filterIp}
            onChange={(e) => { setFilterIp(e.target.value); setPage(0); }}
            size="small"
            sx={{ minWidth: 160 }}
          />
          <Typography variant="body2" color="text.secondary">
            {total} registro(s)
          </Typography>
        </Stack>
      </Paper>

      <Paper>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 320px)' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>Data/Hora</TableCell>
                <TableCell>Acao</TableCell>
                <TableCell>Usuario</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>IP</TableCell>
                <TableCell>Detalhes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">Nenhum registro encontrado</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => {
                  const actionInfo = ACTION_LABELS[log.action] || { label: log.action, color: 'default' as const };
                  return (
                    <TableRow key={log.id} hover>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {dayjs(log.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                      </TableCell>
                      <TableCell>
                        <Chip label={actionInfo.label} color={actionInfo.color} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{log.user?.name || '-'}</TableCell>
                      <TableCell>{log.email || log.user?.email || '-'}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace" fontSize={12}>
                          {log.ipAddress}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontSize={12} sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {log.details || '-'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
          labelRowsPerPage="Linhas por pagina:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Paper>
    </Box>
  );
}
