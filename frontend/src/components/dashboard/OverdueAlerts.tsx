import React from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import Stack from '@mui/material/Stack';

interface OverdueAlertsProps {
  alerts: {
    taskId: string;
    taskName: string;
    analyst: string;
    daysOverdue: number;
  }[];
}

export default function OverdueAlerts({ alerts }: OverdueAlertsProps) {
  return (
    <Paper sx={{ p: 2.5, borderRadius: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <WarningAmberIcon color="error" />
        <Typography variant="subtitle1" fontWeight={600}>
          Alertas de Atraso
        </Typography>
        {alerts.length > 0 && (
          <Chip label={alerts.length} size="small" color="error" />
        )}
      </Stack>

      {alerts.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
          Nenhuma tarefa atrasada
        </Typography>
      ) : (
        <List dense disablePadding>
          {alerts.map((alert) => (
            <ListItem key={alert.taskId} disablePadding sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <WarningAmberIcon fontSize="small" color="warning" />
              </ListItemIcon>
              <ListItemText
                primary={alert.taskName}
                secondary={`${alert.analyst} - ${alert.daysOverdue} dia(s) de atraso`}
                primaryTypographyProps={{ variant: 'body2', noWrap: true }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
}
