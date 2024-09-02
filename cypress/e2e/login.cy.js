describe('Login Component', () => {
    it('Deve renderizar o formulário de login', () => {
      cy.visit('/login'); // Supondo que a rota de login seja /login
  
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
    });
  
    it('Deve mostrar erro ao enviar formulário vazio', () => {
      cy.visit('/login');
  
      cy.get('button[type="submit"]').click();
  
      cy.contains('Email inválido').should('be.visible');
    });
  });
  