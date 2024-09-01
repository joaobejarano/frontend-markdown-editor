// src/components/MarkdownEditor.js
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import io from 'socket.io-client';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Importa jwt-decode
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, IconButton, Button, Box, Stack, TextField, List, ListItem, ListItemText, Divider, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import LogoutIcon from '@mui/icons-material/Logout';

const socket = io('http://localhost:4000', {
  auth: {
    token: localStorage.getItem('token'),
  },
});

const MarkdownEditor = () => {
  const [text, setText] = useState('');
  const [documentId, setDocumentId] = useState(null);
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(''); // Para armazenar o usuário que está editando
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  const fetchHistory = async (docId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:4000/api/documents/${docId}/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(response.data);
    } catch (err) {
      console.error('Failed to fetch document history:', err);
    }
  };

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          navigate('/login');
          return;
        }

        const decodedToken = jwtDecode(token);  // Decodifica o token JWT
        const username = decodedToken.username || 'Desconhecido';  // Extrai o nome de usuário

        const response = await axios.get('http://localhost:4000/api/documents', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.length > 0) {
          // Se houver documentos, pegue o primeiro
          const document = response.data[0];
          setText(document.content);
          setDocumentId(document.id);
          fetchHistory(document.id);
        } else {
          // Se não houver documentos, crie um novo
          const newDocument = await axios.post('http://localhost:4000/api/documents', {
            content: '',
            version: 1,
            createdBy: username,  // Usa o nome de usuário do token decodificado
          }, {
            headers: { Authorization: `Bearer ${token}` },
          });

          setText(newDocument.data.content);
          setDocumentId(newDocument.data.id);
          console.log('Novo documento criado:', newDocument.data.id);
        }
      } catch (err) {
        console.error('Failed to fetch or create document:', err);
        if (err.response && err.response.status === 401) {
          navigate('/login');
        }
      }
    };


    fetchDocument();

    socket.on('updateText', (newText) => {
      setText(newText);
    });

    socket.on('userConnected', (connectedUsers) => {
      setUsers(Object.values(connectedUsers));
    });

    socket.on('userDisconnected', (connectedUsers) => {
      setUsers(Object.values(connectedUsers));
    });

    socket.on('userEditing', (user) => {
      console.log('User editing:', user);
      setEditingUser(user); // Atualiza o nome do usuário que está editando
    });

    return () => {
      socket.off('updateText');
      socket.off('userConnected');
      socket.off('userDisconnected');
      socket.off('userEditing');
    };
  }, [navigate]);

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    socket.emit('textChange', newText);  // Envia apenas a string diretamente

    const token = localStorage.getItem('token');
    const decodedToken = jwtDecode(token);
    const username = decodedToken.username;
    console.log(username)

    socket.emit('userEditing', username); // Envia o nome do usuário que está editando

    if (documentId) {
      const token = localStorage.getItem('token');
      axios.put(`http://localhost:4000/api/documents/${documentId}`, {
        content: newText,
        version: history.length + 1,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(err => console.error('Failed to save document:', err));
    } else {
      console.error('Document ID is null');
    }
  };

  const handleSaveVersion = async () => {
    if (documentId) {
      try {
        const token = localStorage.getItem('token');
        await axios.post(`http://localhost:4000/api/documents/${documentId}/saveVersion`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Nova versão salva e iniciada');
        fetchHistory(documentId);  // Atualiza o histórico de versões
      } catch (err) {
        console.error('Failed to save new version:', err);
      }
    } else {
      console.error('Document ID is null');
    }
  };

  const restoreVersion = async (versionId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:4000/api/documents/${versionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setText(response.data.content);
    } catch (err) {
      console.error('Failed to restore document version:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  console.log(users);

  
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Menu Lateral */}
      <Box sx={{ width: '240px', bgcolor: 'background.paper', p: 2 }}>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<LogoutIcon />} 
          onClick={handleLogout} 
          fullWidth
          sx={{ mb: 2 }}
        >
          Logout
        </Button>
        <List component="nav">
          <Typography variant="h6">Versões</Typography>
          {history.map((version) => (
            <ListItem button key={version.id} onClick={() => restoreVersion(version.id)}>
              <ListItemText primary={`Versão ${version.version}`} secondary={new Date(version.createdAt).toLocaleString()} />
            </ListItem>
          ))}
        </List>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6">Usuários Conectados</Typography>
        <List>
          {users.map((user, index) => (
            <ListItem key={index}>
              <ListItemText primary={user.username} />
            </ListItem>
          ))}
        </List>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6">Usuário Editando</Typography>
        <Box sx={{ mt: 1, pl: 2 }}>
          {editingUser && <strong>{editingUser} está editando...</strong>}
        </Box>
      </Box>

      {/* Conteúdo Principal */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Menu Superior */}
        <AppBar position="static" color="default" sx={{ mb: 2 }}>
          <Toolbar>
            <IconButton color="inherit">
              <SaveIcon />
            </IconButton>
            <Button onClick={handleSaveVersion} variant="outlined" color="primary" sx={{ ml: 2 }}>
              Salvar Versão Atual e Iniciar Nova
            </Button>
          </Toolbar>
        </AppBar>

        {/* Editor e Preview */}
        <Stack direction="row" spacing={1} sx={{ flexGrow: 1, height: '100%' }}>
          <Box sx={{ width: '50%', height: '100%' }}>
            <TextField
              value={text}
              onChange={handleTextChange}
              multiline
              fullWidth
              variant="outlined"
              minRows={30}
              placeholder="Digite seu markdown aqui..."
              sx={{ height: '100%' }}
              InputProps={{
                style: { fontFamily: 'monospace', fontSize: '16px', height: '100%' },
              }}
            />
          </Box>
          <Box sx={{ width: '50%', height: '100%' }}>
            <Box sx={{ border: '1px solid #ccc', borderRadius: '4px', padding: '16px', height: '96%' }}>
              <ReactMarkdown>{text}</ReactMarkdown>
            </Box>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};
export default MarkdownEditor;
