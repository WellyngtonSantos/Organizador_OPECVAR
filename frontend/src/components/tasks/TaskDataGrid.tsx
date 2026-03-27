import React from 'react';
import Box from '@mui/material/Box';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridRowParams,
  GridPaginationModel,
  GridToolbarContainer,
  GridToolbarDensitySelector,
} from '@mui/x-data-grid';
import type { Task } from '../../types/task';
import StatusChip from '../common/StatusChip';
import PriorityChip from '../common/PriorityChip';
import { formatDate } from '../../utils/dateUtils';
import { isOverdue, isNearDeadline } from '../../utils/dateUtils';
import { formatHours } from '../../utils/formatters';

interface TaskDataGridProps {
  tasks: Task[];
  loading: boolean;
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number, pageSize: number) => void;
  onRowClick: (taskId: string) => void;
}

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarDensitySelector />
    </GridToolbarContainer>
  );
}

const columns: GridColDef[] = [
  {
    field: 'name',
    headerName: 'Nome',
    flex: 2,
    minWidth: 200,
  },
  {
    field: 'analyst',
    headerName: 'Analista',
    flex: 1,
    minWidth: 120,
    valueGetter: (_value: unknown, row: Task) => row.analyst?.name ?? '-',
  },
  {
    field: 'bucket',
    headerName: 'Bucket',
    flex: 1,
    minWidth: 120,
    renderCell: (params: GridRenderCellParams<Task>) => {
      const bucket = params.row.bucket;
      if (!bucket) return '-';
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: bucket.color ?? '#9e9e9e',
              flexShrink: 0,
            }}
          />
          {bucket.name}
        </Box>
      );
    },
  },
  {
    field: 'priority',
    headerName: 'Prioridade',
    width: 120,
    renderCell: (params: GridRenderCellParams<Task>) => (
      <PriorityChip priority={params.row.priority} />
    ),
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 140,
    renderCell: (params: GridRenderCellParams<Task>) => (
      <StatusChip status={params.row.status} />
    ),
  },
  {
    field: 'receivedDate',
    headerName: 'Recebimento',
    width: 120,
    valueGetter: (_value: unknown, row: Task) => formatDate(row.receivedDate),
  },
  {
    field: 'estimatedCompletionDate',
    headerName: 'Prazo',
    width: 120,
    valueGetter: (_value: unknown, row: Task) => formatDate(row.estimatedCompletionDate),
  },
  {
    field: 'estimatedHours',
    headerName: 'Horas Est.',
    width: 100,
    valueGetter: (_value: unknown, row: Task) => formatHours(row.estimatedHours),
  },
];

export default function TaskDataGrid({
  tasks,
  loading,
  total,
  page,
  pageSize,
  onPageChange,
  onRowClick,
}: TaskDataGridProps) {
  const handlePaginationModelChange = (model: GridPaginationModel) => {
    onPageChange(model.page + 1, model.pageSize);
  };

  const handleRowClick = (params: GridRowParams<Task>) => {
    onRowClick(params.row.id);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <DataGrid
        rows={tasks}
        columns={columns}
        loading={loading}
        rowCount={total}
        paginationMode="server"
        paginationModel={{ page: page - 1, pageSize }}
        onPaginationModelChange={handlePaginationModelChange}
        pageSizeOptions={[10, 25, 50]}
        onRowClick={handleRowClick}
        checkboxSelection
        disableRowSelectionOnClick
        slots={{ toolbar: CustomToolbar }}
        getRowClassName={(params) => {
          const row = params.row as Task;
          if (isOverdue(row.estimatedCompletionDate, row.status)) {
            return 'row-overdue';
          }
          if (isNearDeadline(row.estimatedCompletionDate, row.status)) {
            return 'row-near-deadline';
          }
          return '';
        }}
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 2,
          '& .row-overdue': {
            backgroundColor: '#FFEBEE',
            '&:hover': { backgroundColor: '#FFCDD2' },
          },
          '& .row-near-deadline': {
            backgroundColor: '#FFF8E1',
            '&:hover': { backgroundColor: '#FFECB3' },
          },
          '& .MuiDataGrid-row': {
            cursor: 'pointer',
          },
        }}
        localeText={{
          noRowsLabel: 'Nenhuma tarefa encontrada',
          MuiTablePagination: {
            labelRowsPerPage: 'Linhas por pagina:',
            labelDisplayedRows: ({ from, to, count }) =>
              `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`,
          },
          toolbarDensity: 'Densidade',
          toolbarDensityLabel: 'Densidade',
          toolbarDensityCompact: 'Compacta',
          toolbarDensityStandard: 'Padrao',
          toolbarDensityComfortable: 'Confortavel',
        }}
        autoHeight
      />
    </Box>
  );
}
