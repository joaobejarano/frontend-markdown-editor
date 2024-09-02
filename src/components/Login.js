import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Link, Container, Avatar, CssBaseline, Stack, Alert } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const baseUrl = 'http://localhost:4000';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Email inválido');
      return;
    }
    try {
      const response = await axios.post(`${baseUrl}/api/auth/login`, { email, password });
      localStorage.setItem('token', response.data.token);
      navigate('/editor');
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setErrorMessage('Erro ao fazer login. Verifique suas credenciais e tente novamente.');
    }
  };

  const goToRegister = () => {
    navigate('/register');
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Welcome to Markdown Editor
        </Typography>
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h6">
          Login
        </Typography>
        <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1 }}>
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="E-mail"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, bgcolor: 'primary.main' }}
          >
            Sign in
          </Button>
          <Stack direction="row" justifyContent="center">
            <Link onClick={goToRegister} variant="body2" sx={{ cursor: 'pointer' }}>
              {"Don't have an account? Register"}
            </Link>
          </Stack>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
