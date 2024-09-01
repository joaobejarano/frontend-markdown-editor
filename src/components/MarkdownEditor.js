// src/components/MarkdownEditor.js
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import io from 'socket.io-client';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Importa jwt-decode
import { useNavigate } from 'react-router-dom';

const socket = io('http://localhost:4000', {
  auth: {
    token: localStorage.getItem('token'),
  },
});

const MarkdownEditor = () => {
  const [text, setText] = useState('');
  const [documentId, setDocumentId] = useState(null);
  const [users, setUsers] = useState([]);
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

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

    return () => {
      socket.off('updateText');
      socket.off('userConnected');
      socket.off('userDisconnected');
    };
  }, [navigate]);

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    socket.emit('textChange', { text: newText });

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

  return (
    <div>
      <button onClick={handleLogout}>Logout</button>
      <textarea
        value={text}
        onChange={handleTextChange}
        style={{ width: '100%', height: '300px', fontSize: '16px' }}
      />
      <div>
        <ReactMarkdown>{text}</ReactMarkdown>
      </div>
      <div>
        <h4>Usuários conectados:</h4>
        <ul>
          {users.map((user, index) => (
            <li key={index}>{user.username}</li>
          ))}
        </ul>
      </div>
      <div>
        <h4>Histórico de versões:</h4>
        <ul>
          {history.map((version, index) => (
            <li key={version.id}>
              <button onClick={() => restoreVersion(version.id)}>
                Versão {version.version} (Salvo em: {new Date(version.createdAt).toLocaleString()})
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MarkdownEditor;
