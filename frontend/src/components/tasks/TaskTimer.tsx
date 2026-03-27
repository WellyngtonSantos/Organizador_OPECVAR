import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import TimerIcon from '@mui/icons-material/Timer';
import type { TimerSession } from '../../types/task';
import { formatDateTime } from '../../utils/dateUtils';
import { formatElapsed, formatHours } from '../../utils/formatters';

interface TaskTimerProps {
  taskId: string;
  activeSession: TimerSession | null;
  elapsed: number;
  onStart: () => Promise<void>;
  onStop: () => Promise<void>;
  sessions: TimerSession[];
  sessionsLoading: boolean;
  onDeleteSession: (sessionId: string) => Promise<void>;
}

export default function TaskTimer({
  taskId,
  activeSession,
  elapsed,
  onStart,
  onStop,
  sessions,
  sessionsLoading,
  onDeleteSession,
}: TaskTimerProps) {
  const isRunning = activeSession !== null;

  const completedSessions = sessions.filter((s) => s.stoppedAt !== null);

  return (
    <Box sx={{ p: 2 }}>
      {/* Timer controls */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Tooltip title={isRunning ? 'Parar timer' : 'Iniciar timer'}>
          <IconButton
            onClick={isRunning ? onStop : onStart}
            sx={{
              width: 56,
              height: 56,
              bgcolor: isRunning ? 'error.main' : 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: isRunning ? 'error.dark' : 'primary.dark',
              },
            }}
          >
            {isRunning ? <StopIcon fontSize="large" /> : <PlayArrowIcon fontSize="large" />}
          </IconButton>
        </Tooltip>

        {isRunning && (
          <Stack direction="row" spacing={1} alignItems="center">
            <TimerIcon color="error" />
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'monospace',
                fontWeight: 600,
                color: 'error.main',
              }}
            >
              {formatElapsed(elapsed)}
            </Typography>
          </Stack>
        )}

        {!isRunning && (
          <Typography variant="body2" color="text.secondary">
            Clique para iniciar o timer
          </Typography>
        )}
      </Stack>

      {/* Sessions divider */}
      <Divider sx={{ mb: 2 }}>
        <Chip label="Sessoes" size="small" variant="outlined" />
      </Divider>

      {/* Sessions list */}
      {sessionsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : completedSessions.length === 0 ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <TimerIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary">
            Nenhuma sessao registrada.
          </Typography>
        </Box>
      ) : (
        <List disablePadding>
          {[...completedSessions]
            .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
            .map((session, index) => (
              <React.Fragment key={session.id}>
                {index > 0 && <Divider component="li" />}
                <ListItem
                  alignItems="flex-start"
                  sx={{ px: 1, py: 1.5 }}
                  secondaryAction={
                    <Tooltip title="Excluir sessao">
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => onDeleteSession(session.id)}
                        sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  }
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          {formatDateTime(session.startedAt)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box component="span" sx={{ display: 'block', mt: 0.5 }}>
                        <Typography variant="body2" component="span" fontWeight={500}>
                          Duracao: {session.hours !== null ? formatHours(session.hours) : '-'}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))}
        </List>
      )}
    </Box>
  );
}
