import React, { useState, useEffect, useCallback } from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { Status, Priority } from '../../types/task';
import type { Bucket } from '../../types/task';
import type { User } from '../../types/user';
import { statusLabels, priorityLabels } from '../../utils/formatters';
import type { FilterParams } from '../../types/common';

interface TaskFiltersProps {
  filters: FilterParams;
  onFilterChange: (filters: FilterParams) => void;
  buckets: Bucket[];
  analysts: User[];
}

export default function TaskFilters({
  filters,
  onFilterChange,
  buckets,
  analysts,
}: TaskFiltersProps) {
  const [searchText, setSearchText] = useState(filters.search ?? '');

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchText !== (filters.search ?? '')) {
        onFilterChange({ ...filters, search: searchText || undefined, page: 1 });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectChange = useCallback(
    (field: keyof FilterParams) => (event: SelectChangeEvent<string>) => {
      const value = event.target.value;
      onFilterChange({ ...filters, [field]: value || undefined, page: 1 });
    },
    [filters, onFilterChange],
  );

  const handleClearFilters = useCallback(() => {
    setSearchText('');
    onFilterChange({ page: 1, pageSize: filters.pageSize });
  }, [filters.pageSize, onFilterChange]);

  const hasActiveFilters =
    !!filters.status ||
    !!filters.priority ||
    !!filters.bucketId ||
    !!filters.analystId ||
    !!searchText;

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        flexWrap: 'wrap',
        alignItems: 'center',
        mb: 2,
        '& > *': { minWidth: 140 },
      }}
    >
      <TextField
        size="small"
        placeholder="Buscar tarefas..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
        sx={{ minWidth: 220 }}
      />

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Status</InputLabel>
        <Select
          value={filters.status ?? ''}
          label="Status"
          onChange={handleSelectChange('status')}
        >
          <MenuItem value="">Todos</MenuItem>
          {Object.values(Status).map((s) => (
            <MenuItem key={s} value={s}>
              {statusLabels[s]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Prioridade</InputLabel>
        <Select
          value={filters.priority ?? ''}
          label="Prioridade"
          onChange={handleSelectChange('priority')}
        >
          <MenuItem value="">Todas</MenuItem>
          {Object.values(Priority).map((p) => (
            <MenuItem key={p} value={p}>
              {priorityLabels[p]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Bucket</InputLabel>
        <Select
          value={filters.bucketId ?? ''}
          label="Bucket"
          onChange={handleSelectChange('bucketId')}
        >
          <MenuItem value="">Todos</MenuItem>
          {buckets.map((b) => (
            <MenuItem key={b.id} value={b.id}>
              {b.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Analista</InputLabel>
        <Select
          value={filters.analystId ?? ''}
          label="Analista"
          onChange={handleSelectChange('analystId')}
        >
          <MenuItem value="">Todos</MenuItem>
          {analysts.map((a) => (
            <MenuItem key={a.id} value={a.id}>
              {a.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {hasActiveFilters && (
        <Button
          variant="outlined"
          size="small"
          startIcon={<ClearIcon />}
          onClick={handleClearFilters}
        >
          Limpar Filtros
        </Button>
      )}
    </Stack>
  );
}
