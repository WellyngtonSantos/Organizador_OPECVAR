import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { useBuckets } from '../hooks/useBuckets';
import { useLabels } from '../hooks/useLabels';
import ItemManager from '../components/admin/ItemManager';

export default function AdminPage() {
  const { buckets, loading: bucketsLoading, createBucket, updateBucket, deleteBucket } = useBuckets();
  const { labels, loading: labelsLoading, createLabel, updateLabel, deleteLabel } = useLabels();

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Personalizacao
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <ItemManager
            title="Tipos de Tarefa"
            items={buckets}
            loading={bucketsLoading}
            onCreate={createBucket}
            onUpdate={updateBucket}
            onDelete={deleteBucket}
            deleteErrorMessage="Erro ao excluir tipo de tarefa. Remova as tarefas associadas primeiro."
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <ItemManager
            title="Setores Solicitantes"
            items={labels}
            loading={labelsLoading}
            onCreate={createLabel}
            onUpdate={updateLabel}
            onDelete={deleteLabel}
            deleteErrorMessage="Erro ao excluir setor solicitante. Remova as tarefas associadas primeiro."
          />
        </Grid>
      </Grid>
    </Box>
  );
}
