import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import io from 'socket.io-client';

const socket = io('http://localhost:4000');

const MarkdownEditor = () => {
  const [text, setText] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    socket.on('updateText', (newText) => {
      setText(newText);
    });

    socket.on('userList', (userList) => {
      setUsers(userList);
    });

    return () => {
      socket.off('updateText');
      socket.off('userList');
    };
  }, []);

  const handleTextChange = (e) => {
    setText(e.target.value);
    socket.emit('textChange', e.target.value);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <textarea
        value={text}
        onChange={handleTextChange}
        style={{ flex: 1, padding: '10px', fontSize: '16px' }}
      />
      <div style={{ flex: 1, padding: '10px', backgroundColor: '#f4f4f4' }}>
        <ReactMarkdown>{text}</ReactMarkdown>
      </div>
      <div style={{ padding: '10px', backgroundColor: '#ddd' }}>
        <strong>Online Users:</strong> {users.join(', ')}
      </div>
    </div>
  );
};

export default MarkdownEditor;
