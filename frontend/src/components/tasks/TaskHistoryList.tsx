import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import HistoryIcon from '@mui/icons-material/History';
import type { TaskHistory } from '../../types/task';
import { formatDateTime } from '../../utils/dateUtils';

interface TaskHistoryListProps {
  history: TaskHistory[];
  loading: boolean;
}

const fieldLabels: Record<string, string> = {
  name: 'Nome',
  analystId: 'Analista',
  bucketId: 'Bucket',
  priority: 'Prioridade',
  status: 'Status',
  receivedDate: 'Data de Recebimento',
  startDate: 'Data de Inicio',
  estimatedCompletionDate: 'Prazo Estimado',
  actualCompletionDate: 'Data de Conclusao',
  estimatedHours: 'Horas Estimadas',
  actualHours: 'Horas Reais',
  queueOrder: 'Ordem na Fila',
  labelIds: 'Etiquetas',
  creation: 'Criacao',
};

function getFieldLabel(field: string): string {
  return fieldLabels[field] ?? field;
}

function formatValue(value: string | null): string {
  if (value === null || value === '') return '-';
  return value;
}

export default function TaskHistoryList({ history, loading }: TaskHistoryListProps) {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (history.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <HistoryIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
        <Typography color="text.secondary">
          Nenhum historico disponivel.
        </Typography>
      </Box>
    );
  }

  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime(),
  );

  return (
    <Box sx={{ p: 1 }}>
      <List disablePadding>
        {sortedHistory.map((entry, index) => {
          const isCreation = entry.field === 'creation';

          return (
            <React.Fragment key={entry.id}>
              {index > 0 && <Divider component="li" />}
              <ListItem alignItems="flex-start" sx={{ px: 1, py: 1.5 }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Chip
                        label={getFieldLabel(entry.field)}
                        size="small"
                        variant="outlined"
                        color={isCreation ? 'success' : 'default'}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {formatDateTime(entry.changedAt)}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box component="span" sx={{ display: 'block', mt: 0.5 }}>
                      {isCreation ? (
                        <Typography variant="body2" component="span" color="success.main">
                          Tarefa criada
                        </Typography>
                      ) : (
                        <Typography variant="body2" component="span">
                          <Typography
                            component="span"
                            variant="body2"
                            sx={{ textDecoration: 'line-through', color: 'text.secondary', mr: 0.5 }}
                          >
                            {formatValue(entry.oldValue)}
                          </Typography>
                          {' -> '}
                          <Typography component="span" variant="body2" fontWeight={500}>
                            {formatValue(entry.newValue)}
                          </Typography>
                        </Typography>
                      )}
                      <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                        por {entry.user.name}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            </React.Fragment>
          );
        })}
      </List>
    </Box>
  );
}
