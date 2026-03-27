import React, { useState, useCallback, useRef } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import FolderIcon from '@mui/icons-material/Folder';
import LabelIcon from '@mui/icons-material/Label';
import apiClient from '../../api/client';

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}

interface ImportResult {
  totalRows: number;
  imported: number;
  skipped: number;
  errors: string[];
  createdUsers: string[];
  createdBuckets: string[];
  createdLabels: string[];
}

export default function ImportDialog({ open, onClose, onImported }: ImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleReset = useCallback(() => {
    setFile(null);
    setResult(null);
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    if (result && result.imported > 0) {
      onImported();
    }
    handleReset();
    onClose();
  }, [result, onImported, onClose, handleReset]);

  const handleFileSelect = useCallback((selectedFile: File) => {
    if (!selectedFile.name.endsWith('.xlsx')) {
      setError('Apenas arquivos .xlsx sao aceitos');
      return;
    }
    setFile(selectedFile);
    setError(null);
    setResult(null);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFileSelect(f);
  }, [handleFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelect(f);
  }, [handleFileSelect]);

  const handleUpload = useCallback(async () => {
    if (!file) return;
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post('/import/xlsx', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResult(response.data.result);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao importar arquivo';
      setError(message);
    } finally {
      setUploading(false);
    }
  }, [file]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Importar Tarefas do Planner</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {/* File upload area */}
          {!result && (
            <Paper
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => inputRef.current?.click()}
              sx={{
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                border: 2,
                borderStyle: 'dashed',
                borderColor: dragOver ? 'primary.main' : 'divider',
                bgcolor: dragOver ? 'action.hover' : 'background.default',
                borderRadius: 2,
                transition: 'all 0.2s',
                '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
              }}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx"
                onChange={handleInputChange}
                style={{ display: 'none' }}
              />
              {file ? (
                <Stack alignItems="center" spacing={1}>
                  <InsertDriveFileIcon sx={{ fontSize: 48, color: 'success.main' }} />
                  <Typography variant="body1" fontWeight={600}>{file.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(file.size / 1024).toFixed(1)} KB - Clique para trocar
                  </Typography>
                </Stack>
              ) : (
                <Stack alignItems="center" spacing={1}>
                  <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                  <Typography variant="body1">
                    Arraste o arquivo .xlsx aqui ou clique para selecionar
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Formato esperado: Export do Microsoft Planner
                  </Typography>
                </Stack>
              )}
            </Paper>
          )}

          {/* Upload progress */}
          {uploading && (
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>Importando tarefas...</Typography>
              <LinearProgress />
            </Box>
          )}

          {/* Error */}
          {error && <Alert severity="error">{error}</Alert>}

          {/* Result */}
          {result && (
            <Stack spacing={2}>
              <Alert severity={result.skipped > 0 ? 'warning' : 'success'}>
                {result.imported} de {result.totalRows} tarefas importadas com sucesso
                {result.skipped > 0 && ` (${result.skipped} com erro)`}
              </Alert>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip icon={<CheckCircleIcon />} label={`${result.imported} importadas`} color="success" size="small" />
                {result.skipped > 0 && (
                  <Chip icon={<ErrorIcon />} label={`${result.skipped} erros`} color="error" size="small" />
                )}
              </Stack>

              {/* Created entities */}
              {result.createdUsers.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    <PersonAddIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                    Usuarios criados ({result.createdUsers.length}):
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {result.createdUsers.join(', ')}
                  </Typography>
                  <Typography variant="caption" display="block" color="warning.main" sx={{ mt: 0.5 }}>
                    Senha padrao: mudar123
                  </Typography>
                </Box>
              )}

              {result.createdBuckets.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    <FolderIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                    Buckets criados: {result.createdBuckets.join(', ')}
                  </Typography>
                </Box>
              )}

              {result.createdLabels.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    <LabelIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                    Etiquetas criadas: {result.createdLabels.join(', ')}
                  </Typography>
                </Box>
              )}

              {/* Errors detail */}
              {result.errors.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" color="error" sx={{ mb: 0.5 }}>
                    Erros:
                  </Typography>
                  <List dense disablePadding sx={{ maxHeight: 150, overflow: 'auto' }}>
                    {result.errors.map((err, i) => (
                      <ListItem key={i} disablePadding sx={{ py: 0.25 }}>
                        <ListItemIcon sx={{ minWidth: 24 }}>
                          <ErrorIcon fontSize="small" color="error" />
                        </ListItemIcon>
                        <ListItemText
                          primary={err}
                          primaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Stack>
          )}

          {/* Info box */}
          {!result && !uploading && (
            <Alert severity="info" variant="outlined">
              <Typography variant="caption">
                <strong>Mapeamento automatico:</strong> Buckets, etiquetas e usuarios serao criados
                automaticamente se nao existirem no sistema. Usuarios criados recebem senha padrao "mudar123".
              </Typography>
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        {result ? (
          <Button variant="contained" onClick={handleClose}>Fechar</Button>
        ) : (
          <>
            <Button onClick={handleClose} disabled={uploading}>Cancelar</Button>
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={!file || uploading}
            >
              {uploading ? 'Importando...' : 'Importar'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
