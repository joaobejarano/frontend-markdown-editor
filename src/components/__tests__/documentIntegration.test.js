const request = require('supertest');
const app = require('../../index'); // Supondo que o app é exportado de 'index.js'
const { User, Document } = require('../../models');

describe('Múltiplos usuários editando o mesmo documento', () => {
  let token1, token2;
  let documentId;

  beforeAll(async () => {
    await User.sync({ force: true });
    await Document.sync({ force: true });

    // Criar e logar usuário 1
    await request(app).post('/api/auth/register').send({
      username: 'user1',
      email: 'user1@example.com',
      password: 'password123'
    });

    token1 = (await request(app).post('/api/auth/login').send({
      email: 'user1@example.com',
      password: 'password123'
    })).body.token;

    // Criar e logar usuário 2
    await request(app).post('/api/auth/register').send({
      username: 'user2',
      email: 'user2@example.com',
      password: 'password123'
    });

    token2 = (await request(app).post('/api/auth/login').send({
      email: 'user2@example.com',
      password: 'password123'
    })).body.token;

    // Usuário 1 cria um documento
    documentId = (await request(app).post('/api/documents')
      .set('Authorization', `Bearer ${token1}`)
      .send({ content: 'Document content', version: 1, createdBy: 'user1' })
    ).body.id;
  });

  test('Usuário 1 e Usuário 2 editam o mesmo documento', async () => {
    const update1 = request(app).put(`/api/documents/${documentId}`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ content: 'Editado por user1', version: 2 });

    const update2 = request(app).put(`/api/documents/${documentId}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ content: 'Editado por user2', version: 2 });

    const [response1, response2] = await Promise.all([update1, update2]);

    expect(response1.status).toBe(200);
    expect(response2.status).toBe(200);

    expect(response1.body.content).toBe('Editado por user1');
    expect(response2.body.content).toBe('Editado por user2');
  });
});
