import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import io from 'socket.io-client';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, IconButton, Button, Box, TextField, List, ListItem, ListItemText, Divider, Typography, Stack } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatStrikethroughIcon from '@mui/icons-material/FormatStrikethrough';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import LinkIcon from '@mui/icons-material/Link';
import CodeIcon from '@mui/icons-material/Code';
import rehypeSanitize from 'rehype-sanitize';

const baseUrl = 'https://markdown-editor-2itj.onrender.com';

const socket = io(`${baseUrl}`, {
  auth: {
    token: localStorage.getItem('token'),
  },
});

const MarkdownEditor = () => {
  const [text, setText] = useState('');
  const [documentId, setDocumentId] = useState(null);
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState('');
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  const fetchHistory = async (docId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${baseUrl}/api/documents/${docId}/history`, {
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

        const decodedToken = jwtDecode(token);
        const username = decodedToken.username || 'Desconhecido';

        const response = await axios.get(`${baseUrl}/api/documents`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.length > 0) {
          const document = response.data[0];
          setText(document.content);
          setDocumentId(document.id);
          fetchHistory(document.id);
        } else {
          const newDocument = await axios.post(`${baseUrl}/api/documents`, {
            content: '',
            version: 1,
            createdBy: username,
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
      setEditingUser(user);
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

    if (documentId) {
      const token = localStorage.getItem('token');
      axios.put(`${baseUrl}/api/documents/${documentId}`, {
        content: newText,
        version: history.length + 1,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(err => console.error('Failed to save document:', err));
    } else {
      console.error('Document ID is null');
    }

    socket.emit('textChange', newText);

    const decodedToken = jwtDecode(localStorage.getItem('token'));
    const username = decodedToken.username;
    socket.emit('userEditing', username);
  };

  const handleSaveVersion = async () => {
    if (documentId) {
      try {
        const token = localStorage.getItem('token');
        await axios.post(`${baseUrl}/api/documents/${documentId}/saveVersion`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Nova versão salva e iniciada');
        fetchHistory(documentId);
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
      const response = await axios.get(`${baseUrl}/api/documents/${versionId}`, {
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

  const insertTextAtCursor = (textToInsert) => {
    const textarea = document.querySelector('textarea');
    const cursorPosition = textarea.selectionStart;
    const newText = `${text.slice(0, cursorPosition)}${textToInsert}${text.slice(cursorPosition)}`;
    setText(newText);
    socket.emit('textChange', newText);
  };

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
            <IconButton onClick={() => insertTextAtCursor('**')}><FormatBoldIcon /></IconButton>
            <IconButton onClick={() => insertTextAtCursor('*')}><FormatItalicIcon /></IconButton>
            <IconButton onClick={() => insertTextAtCursor('~~')}><FormatStrikethroughIcon /></IconButton>
            <IconButton onClick={() => insertTextAtCursor('> ')}><FormatQuoteIcon /></IconButton>
            <IconButton onClick={() => insertTextAtCursor('- ')}><FormatListBulletedIcon /></IconButton>
            <IconButton onClick={() => insertTextAtCursor('1. ')}><FormatListNumberedIcon /></IconButton>
            <IconButton onClick={() => insertTextAtCursor('``')}><CodeIcon /></IconButton>
            <IconButton onClick={() => insertTextAtCursor('[]()')}><LinkIcon /></IconButton>
            <Button onClick={handleSaveVersion} variant="outlined" color="primary" sx={{ ml: 2 }}>
              Salvar Versão Atual e Iniciar Nova
            </Button>
          </Toolbar>
        </AppBar>

        {/* Editor e Preview */}
        <Stack direction="row" spacing={2} sx={{ flexGrow: 1, px: 2 }}>
          <TextField
            multiline
            fullWidth
            minRows={20}
            value={text}
            onChange={handleTextChange}
            variant="outlined"
            sx={{ flex: 1 }}
            placeholder="Type here..."
          />
          <Box sx={{ flex: 1, overflowY: 'auto', p: 2, border: '1px solid #ccc', borderRadius: '4px' }}>
            <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{text}</ReactMarkdown>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

export default MarkdownEditor;
