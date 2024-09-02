import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MarkdownEditor from '../MarkdownEditor';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

// Simula a API backend
const server = setupServer(
  rest.get('/api/documents', (req, res, ctx) => {
    return res(ctx.json([{ id: 1, content: 'Test document', version: 1 }]));
  }),
  rest.put('/api/documents/1', (req, res, ctx) => {
    return res(ctx.json({ id: 1, content: 'Updated document', version: 2 }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('MarkdownEditor Component', () => {
  test('Deve renderizar o documento carregado', async () => {
    render(
      <BrowserRouter>
        <MarkdownEditor />
      </BrowserRouter>
    );

    expect(await screen.findByText('Test document')).toBeInTheDocument();
  });

  test('Deve permitir edição de texto e salvar o documento', async () => {
    render(
      <BrowserRouter>
        <MarkdownEditor />
      </BrowserRouter>
    );

    const textarea = await screen.findByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Updated document' } });

    fireEvent.blur(textarea);  // Simula que o usuário saiu do campo de texto

    expect(await screen.findByText('Updated document')).toBeInTheDocument();
  });
});
