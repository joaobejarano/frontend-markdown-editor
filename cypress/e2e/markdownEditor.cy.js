// cypress/e2e/markdownEditor.cy.js

describe('MarkdownEditor Component', () => {
    beforeEach(() => {
      // Simulando a resposta da API para GET /api/documents
      cy.intercept('GET', '/api/documents', {
        statusCode: 200,
        body: [{ id: 1, content: 'Test document', version: 1 }],
      }).as('getDocuments');
  
      // Simulando a resposta da API para PUT /api/documents/1
      cy.intercept('PUT', '/api/documents/1', {
        statusCode: 200,
        body: { id: 1, content: 'Updated document', version: 2 },
      }).as('updateDocument');
  
      // Visitando a página do Markdown Editor
      cy.visit('/editor'); // Supondo que /editor é a rota onde o MarkdownEditor está
    });
  
    it('Deve renderizar o documento carregado', () => {
      // Aguarda a resposta do GET
      cy.wait('@getDocuments');
  
      // Verifica se o texto "Test document" está presente na página
      cy.contains('Test document').should('be.visible');
    });
  
    it('Deve permitir edição de texto e salvar o documento', () => {
      // Aguarda a resposta do GET
      cy.wait('@getDocuments');
  
      // Verifica se o campo de texto está presente
      cy.get('textarea').should('have.value', 'Test document');
  
      // Simula a mudança no conteúdo do textarea
      cy.get('textarea').clear().type('Updated document');
  
      // Simula a saída do campo de texto
      cy.get('textarea').blur();
  
      // Aguarda a resposta do PUT
      cy.wait('@updateDocument');
  
      // Verifica se o novo texto está presente na página
      cy.contains('Updated document').should('be.visible');
    });
  });
  