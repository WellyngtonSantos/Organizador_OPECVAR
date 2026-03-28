import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import AddTaskIcon from '@mui/icons-material/AddTask';
import LoginForm from '../components/auth/LoginForm';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { token, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate('/tasks', { replace: true });
    }
  }, [token, navigate]);

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
    navigate('/tasks', { replace: true });
  };

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
      <Paper
        elevation={8}
        sx={{
          p: 5,
          borderRadius: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <LoginForm onLogin={handleLogin} />

        <Divider sx={{ width: '100%', my: 2 }}>
          <Typography variant="caption" color="text.secondary">
            ou
          </Typography>
        </Divider>

        <Button
          variant="outlined"
          fullWidth
          startIcon={<AddTaskIcon />}
          onClick={() => navigate('/request')}
          sx={{ textTransform: 'none' }}
        >
          Solicitar nova tarefa (acesso externo)
        </Button>
      </Paper>
    </Box>
  );
}
