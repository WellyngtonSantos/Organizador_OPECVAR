import React, { useState, useEffect } from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import { Priority, Status } from '../../types/task';
import type { Task, CreateTaskInput, UpdateTaskInput, Label, Bucket } from '../../types/task';
import type { User } from '../../types/user';
import { statusLabels, priorityLabels } from '../../utils/formatters';

interface TaskFormProps {
  mode: 'create' | 'edit';
  task?: Task | null;
  analysts: User[];
  buckets: Bucket[];
  labels: Label[];
  onSubmit: (data: CreateTaskInput | UpdateTaskInput) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

interface FormState {
  name: string;
  description: string;
  analystId: string;
  bucketId: string;
  priority: Priority;
  status: Status;
  receivedDate: string;
  startDate: string;
  estimatedCompletionDate: string;
  estimatedHours: string;
  labelIds: string[];
}

function toDateInputValue(dateStr: string | null): string {
  if (!dateStr) return '';
  return dateStr.substring(0, 10);
}

export default function TaskForm({
  mode,
  task,
  analysts,
  buckets,
  labels,
  onSubmit,
  onCancel,
  loading = false,
}: TaskFormProps) {
  const [form, setForm] = useState<FormState>({
    name: '',
    description: '',
    analystId: '',
    bucketId: '',
    priority: Priority.MEDIUM,
    status: Status.NOT_STARTED,
    receivedDate: new Date().toISOString().substring(0, 10),
    startDate: '',
    estimatedCompletionDate: '',
    estimatedHours: '',
    labelIds: [],
  });

  const [errors, setErrors] = useState<{ name?: string }>({});

  useEffect(() => {
    if (mode === 'edit' && task) {
      setForm({
        name: task.name,
        description: task.description ?? '',
        analystId: task.analystId ?? '',
        bucketId: task.bucketId ?? '',
        priority: task.priority,
        status: task.status,
        receivedDate: toDateInputValue(task.receivedDate),
        startDate: toDateInputValue(task.startDate),
        estimatedCompletionDate: toDateInputValue(task.estimatedCompletionDate),
        estimatedHours: task.estimatedHours !== null ? String(task.estimatedHours) : '',
        labelIds: task.labels?.map((l) => l.label.id) ?? [],
      });
    }
  }, [mode, task]);

  const handleChange = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSelectChange = (field: keyof FormState) => (e: SelectChangeEvent<string>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleLabelsChange = (_: unknown, selectedLabels: Label[]) => {
    setForm((prev) => ({ ...prev, labelIds: selectedLabels.map((l) => l.id) }));
  };

  const validate = (): boolean => {
    const newErrors: { name?: string } = {};
    if (!form.name.trim()) newErrors.name = 'Nome e obrigatorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const data: CreateTaskInput | UpdateTaskInput = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      analystId: form.analystId || null,
      bucketId: form.bucketId || null,
      priority: form.priority,
      status: form.status,
      receivedDate: form.receivedDate,
      startDate: form.startDate || null,
      estimatedCompletionDate: form.estimatedCompletionDate || null,
      estimatedHours: form.estimatedHours ? parseFloat(form.estimatedHours) : null,
      labelIds: form.labelIds,
    };

    await onSubmit(data);
  };

  const selectedLabels = labels.filter((l) => form.labelIds.includes(l.id));

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
      <Stack spacing={2.5}>
        <TextField
          label="Nome da Tarefa"
          value={form.name}
          onChange={handleChange('name')}
          error={!!errors.name}
          helperText={errors.name}
          required
          fullWidth
          size="small"
        />

        <TextField
          label="Descricao"
          value={form.description}
          onChange={handleChange('description')}
          fullWidth
          size="small"
          multiline
          minRows={3}
          maxRows={8}
          placeholder="Anotacoes, detalhes, instrucoes..."
        />

        <FormControl size="small" fullWidth>
          <InputLabel>Analista</InputLabel>
          <Select
            value={form.analystId}
            label="Analista"
            onChange={handleSelectChange('analystId')}
          >
            <MenuItem value="">Nao atribuido</MenuItem>
            {analysts.map((a) => (
              <MenuItem key={a.id} value={a.id}>
                {a.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" fullWidth>
          <InputLabel>Tipo de Tarefa</InputLabel>
          <Select
            value={form.bucketId}
            label="Tipo de Tarefa"
            onChange={handleSelectChange('bucketId')}
          >
            <MenuItem value="">Nenhum</MenuItem>
            {buckets.map((b) => (
              <MenuItem key={b.id} value={b.id}>
                {b.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Stack direction="row" spacing={2}>
          <FormControl size="small" fullWidth>
            <InputLabel>Prioridade</InputLabel>
            <Select
              value={form.priority}
              label="Prioridade"
              onChange={handleSelectChange('priority')}
            >
              {Object.values(Priority).map((p) => (
                <MenuItem key={p} value={p}>
                  {priorityLabels[p]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={form.status}
              label="Status"
              onChange={handleSelectChange('status')}
            >
              {Object.values(Status).map((s) => (
                <MenuItem key={s} value={s}>
                  {statusLabels[s]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <Stack direction="row" spacing={2}>
          <TextField
            label="Data de Recebimento"
            type="date"
            value={form.receivedDate}
            onChange={handleChange('receivedDate')}
            size="small"
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Data de Inicio"
            type="date"
            value={form.startDate}
            onChange={handleChange('startDate')}
            size="small"
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Stack>

        <Stack direction="row" spacing={2}>
          <TextField
            label="Prazo Estimado"
            type="date"
            value={form.estimatedCompletionDate}
            onChange={handleChange('estimatedCompletionDate')}
            size="small"
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Horas Estimadas"
            type="number"
            value={form.estimatedHours}
            onChange={handleChange('estimatedHours')}
            size="small"
            fullWidth
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: 0, step: 0.5 }}
          />
        </Stack>

        <Autocomplete
          multiple
          options={labels}
          getOptionLabel={(option) => option.name}
          value={selectedLabels}
          onChange={handleLabelsChange}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderTags={(value, getTagProps) =>
            value.map((label, index) => {
              const { key, ...tagProps } = getTagProps({ index });
              return (
                <Chip
                  key={key}
                  label={label.name}
                  size="small"
                  sx={{
                    backgroundColor: label.color ?? undefined,
                    color: label.color ? '#fff' : undefined,
                  }}
                  {...tagProps}
                />
              );
            })
          }
          renderInput={(params) => (
            <TextField {...params} label="Setor Solicitante" size="small" />
          )}
          size="small"
        />

        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ pt: 1 }}>
          <Button variant="outlined" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Salvando...' : mode === 'create' ? 'Criar Tarefa' : 'Salvar'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
