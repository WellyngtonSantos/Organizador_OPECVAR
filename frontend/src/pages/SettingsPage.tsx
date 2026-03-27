import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import InfoIcon from '@mui/icons-material/Info';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext';

export default function SettingsPage() {
  const { user } = useAuth();
  const { mode, toggleTheme } = useThemeMode();

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Configuracoes
      </Typography>

      <Stack spacing={3} sx={{ maxWidth: 600 }}>
        {/* User profile */}
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            Perfil do Usuario
          </Typography>

          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: 22 }}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <div>
              <Typography variant="h6">{user?.name}</Typography>
              <Chip
                label={user?.role === 'MANAGER' ? 'Gestor' : 'Analista'}
                size="small"
                color={user?.role === 'MANAGER' ? 'primary' : 'default'}
              />
            </div>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={1.5}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <PersonIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary" sx={{ width: 80 }}>
                Nome
              </Typography>
              <Typography variant="body2">{user?.name}</Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1.5}>
              <EmailIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary" sx={{ width: 80 }}>
                Email
              </Typography>
              <Typography variant="body2">{user?.email}</Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1.5}>
              <BadgeIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary" sx={{ width: 80 }}>
                Cargo
              </Typography>
              <Typography variant="body2">
                {user?.role === 'MANAGER' ? 'Gestor' : 'Analista'}
              </Typography>
            </Stack>
          </Stack>
        </Paper>

        {/* Appearance */}
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            Aparencia
          </Typography>

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" alignItems="center" spacing={1.5}>
              {mode === 'light' ? (
                <Brightness7Icon color="action" />
              ) : (
                <Brightness4Icon color="action" />
              )}
              <div>
                <Typography variant="body2">Modo Escuro</Typography>
                <Typography variant="caption" color="text.secondary">
                  {mode === 'light' ? 'Tema claro ativo' : 'Tema escuro ativo'}
                </Typography>
              </div>
            </Stack>
            <Switch
              checked={mode === 'dark'}
              onChange={toggleTheme}
              color="primary"
            />
          </Stack>
        </Paper>

        {/* About */}
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            Sobre
          </Typography>

          <Stack spacing={1.5}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <InfoIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary" sx={{ width: 80 }}>
                Sistema
              </Typography>
              <Typography variant="body2">Organizador OPECVAR</Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1.5}>
              <InfoIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary" sx={{ width: 80 }}>
                Versao
              </Typography>
              <Typography variant="body2">1.0.0</Typography>
            </Stack>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}
