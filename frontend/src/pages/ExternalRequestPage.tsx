import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import apiClient from '../api/client';
import type { Bucket, Label } from '../types/task';

interface FormState {
  name: string;
  description: string;
  bucketId: string;
  priority: string;
  labelIds: string[];
  requesterName: string;
  requesterEmail: string;
}

const priorityOptions = [
  { value: 'LOW', label: 'Baixa' },
  { value: 'MEDIUM', label: 'Media' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'URGENT', label: 'Urgente' },
];

export default function ExternalRequestPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({
    name: '',
    description: '',
    bucketId: '',
    priority: 'MEDIUM',
    labelIds: [],
    requesterName: '',
    requesterEmail: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bucketsRes, labelsRes] = await Promise.all([
          apiClient.get('/public/buckets'),
          apiClient.get('/public/labels'),
        ]);
        setBuckets(bucketsRes.data.buckets);
        setLabels(labelsRes.data.labels);
      } catch {
        // Silently fail - form still works without pre-populated data
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
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
    const newErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) newErrors.name = 'Nome da tarefa e obrigatorio';
    if (!form.requesterName.trim()) newErrors.requesterName = 'Seu nome e obrigatorio';
    if (form.requesterEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.requesterEmail)) {
      newErrors.requesterEmail = 'Email invalido';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setSubmitError('');

    try {
      await apiClient.post('/public/tasks', {
        name: form.name.trim(),
        description: form.description.trim() || null,
        bucketId: form.bucketId || null,
        priority: form.priority,
        labelIds: form.labelIds.length > 0 ? form.labelIds : undefined,
        requesterName: form.requesterName.trim(),
        requesterEmail: form.requesterEmail.trim() || null,
      });
      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Erro ao enviar solicitacao. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const selectedLabels = labels.filter((l) => form.labelIds.includes(l.id));

  if (submitted) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #01579b 100%)'
              : 'linear-gradient(135deg, #1565c0 0%, #1976d2 50%, #42a5f5 100%)',
          p: 2,
        }}
      >
        <Paper elevation={8} sx={{ p: 5, borderRadius: 3, textAlign: 'center', maxWidth: 500 }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
            Solicitacao Enviada!
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Sua tarefa foi registrada com sucesso. A equipe OPECVAR sera notificada e entrara em contato em breve.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/login')}
            >
              Voltar ao Login
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setSubmitted(false);
                setForm({
                  name: '',
                  description: '',
                  bucketId: '',
                  priority: 'MEDIUM',
                  labelIds: [],
                  requesterName: form.requesterName,
                  requesterEmail: form.requesterEmail,
                });
              }}
            >
              Nova Solicitacao
            </Button>
          </Stack>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #01579b 100%)'
            : 'linear-gradient(135deg, #1565c0 0%, #1976d2 50%, #42a5f5 100%)',
        p: 2,
      }}
    >
      <Paper elevation={8} sx={{ p: 4, borderRadius: 3, width: '100%', maxWidth: 600 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight={600}>
            Solicitar Nova Tarefa
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Preencha os dados abaixo para registrar uma demanda junto a equipe OPECVAR
          </Typography>
        </Box>

        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            <Typography variant="subtitle2" color="primary" fontWeight={600}>
              Seus Dados
            </Typography>

            <Stack direction="row" spacing={2}>
              <TextField
                label="Seu Nome"
                value={form.requesterName}
                onChange={handleChange('requesterName')}
                error={!!errors.requesterName}
                helperText={errors.requesterName}
                required
                fullWidth
                size="small"
              />
              <TextField
                label="Seu Email (opcional)"
                type="email"
                value={form.requesterEmail}
                onChange={handleChange('requesterEmail')}
                error={!!errors.requesterEmail}
                helperText={errors.requesterEmail}
                fullWidth
                size="small"
              />
            </Stack>

            <Typography variant="subtitle2" color="primary" fontWeight={600} sx={{ pt: 1 }}>
              Dados da Tarefa
            </Typography>

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
              placeholder="Descreva a demanda com o maximo de detalhes possivel..."
            />

            <Stack direction="row" spacing={2}>
              {loadingData ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} />
                  <Typography variant="caption">Carregando opcoes...</Typography>
                </Box>
              ) : (
                <>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Tipo de Tarefa</InputLabel>
                    <Select
                      value={form.bucketId}
                      label="Tipo de Tarefa"
                      onChange={handleSelectChange('bucketId')}
                    >
                      <MenuItem value="">Nao especificado</MenuItem>
                      {buckets.map((b) => (
                        <MenuItem key={b.id} value={b.id}>
                          {b.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small" fullWidth>
                    <InputLabel>Prioridade</InputLabel>
                    <Select
                      value={form.priority}
                      label="Prioridade"
                      onChange={handleSelectChange('priority')}
                    >
                      {priorityOptions.map((p) => (
                        <MenuItem key={p.value} value={p.value}>
                          {p.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </>
              )}
            </Stack>

            {!loadingData && labels.length > 0 && (
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
            )}

            <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ pt: 1 }}>
              <Button
                variant="text"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/login')}
              >
                Voltar ao Login
              </Button>
              <Button
                type="submit"
                variant="contained"
                endIcon={loading ? undefined : <SendIcon />}
                disabled={loading}
                sx={{ px: 4 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Enviar Solicitacao'}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
