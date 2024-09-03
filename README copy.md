# Markdown Editor - Documentação

## Índice
- [Visão Geral](#visão-geral)
- [Instruções de Configuração](#instruções-de-configuração)
  - [Configuração do Backend](#configuração-do-backend)
  - [Configuração do Frontend](#configuração-do-frontend)
- [Endpoints da API](#endpoints-da-api)
- [Decisões de Design e Desafios Enfrentados](#decisões-de-design-e-desafios-enfrentados)
- [Instruções sobre Como Testar a Aplicação](#instruções-sobre-como-testar-a-aplicação)

## Visão Geral
Este projeto é um editor colaborativo de Markdown em tempo real que permite que vários usuários editem o mesmo documento simultaneamente. O sistema é composto por um backend que fornece a API e gerencia a persistência dos dados, e um frontend que oferece a interface para os usuários interagirem com o editor.

## Instruções de Configuração

### Configuração do Backend

1. **Clone o Repositório:**

   ```bash
   git clone https://github.com/joaobejarano/backend-markdown-editor.git
   cd backend-markdown-editor

2. Instale as Dependências:

    ```bash
    npm install 

3. Configuração do Banco de Dados:

    - Renomeie o arquivo `.env.example` para `.env` e configure as variáveis de ambiente.
    - No ambiente de produção, configure o `JWT_SECRET` diretamente no seu serviço de hospedagem.
    - Altere o `DB_HOST` para o endereço do seu banco de dados de produção.

4. Rodar as Migrações:

    ```bash
    npx sequelize-cli db:migrate --env development

5. Iniciar o Servidor:

    - Ambiente de desenvolvimento:

    ```bash
    npm run dev

    - Ambiente de produção:

    ```bash
    npm start


### Configuração do Frontend

1. **Clone o Repositório:**

    ```bash
    git clone https://github.com/joaobejarano/frontend-markdown-editor.git
    cd frontend-markdown-editor


2. Instale as Dependências:

    ```bash
    npm install 

3. Configuração do Ambiente:

    - Renomeie o arquivo .env.example para .env e configure a URL do backend.

4. Rodar a Aplicação:

    ```bash
    npm start

5. Build para Produção:

    ```bash
    npm run build


## Endpoints da API

### Autenticação

- POST /api/auth/register

    - Descrição: Registra um novo usuário.
    - Payload:
        ```json
        {
        "username": "string",
        "email": "string",
        "password": "string"
        }
- POST /api/auth/login

    - Descrição: Faz login de um usuário e retorna um token JWT.
    - Payload:
        ```json
        {
        "email": "string",
        "password": "string"
        }

### Documentos

- GET /api/documents

    - Descrição: Retorna uma lista de documentos do usuário autenticado.
- POST /api/documents

    - Descrição: Cria um novo documento.
    - Payload:
        ```json
        {
        "content": "string",
        "version": 1,
        "createdBy": "username"
        }
- GET /api/documents/

    - Descrição: Retorna o conteúdo de um documento específico.

- PUT /api/documents/

    - Descrição: Atualiza o conteúdo de um documento.
    - Payload: 
        ```json 
        {
        "content": "string",
        "version": 2
        }
- POST /api/documents/saveVersion

    - Descrição: Salva uma nova versão do documento.


## Decisões de Design e Desafios Enfrentados

### Decisões de Design

1. Arquitetura MVC:

    - A aplicação backend foi projetada seguindo o padrão MVC para separar a lógica da aplicação, a interface do usuário e o controle dos dados. Isso facilita a manutenção e a escalabilidade do código.

2. Socket.IO para Colaboração em Tempo Real:

    - Foi escolhido o Socket.IO para gerenciar a colaboração em tempo real no editor de Markdown, permitindo que múltiplos usuários editem simultaneamente um documento.

3. JWT para Autenticação:

    - A autenticação dos usuários foi implementada utilizando JSON Web Tokens (JWT), o que garante que apenas usuários autenticados possam acessar e modificar os documentos.

### Desafios Enfrentados

1. Sincronização de Edições:

    - Um dos principais desafios foi garantir a sincronização correta das edições feitas por diferentes usuários em tempo real, minimizando conflitos e assegurando que o conteúdo do documento fosse atualizado corretamente.

2. Persistência e Versionamento:

    - Implementar o versionamento dos documentos foi outro desafio, garantindo que os usuários pudessem salvar e restaurar versões anteriores de um documento.

3. Segurança:

    - Garantir a segurança das comunicações e proteger as operações sensíveis, como autenticação e armazenamento de tokens, foi uma prioridade, especialmente em produção.


## Instruções sobre Como Testar a Aplicação

### Backend

1. Testes Unitários com Jest:

    - O backend inclui testes unitários utilizando o Jest. Para rodar os testes:
        ```bash
        npm test

2. Testes de Integração com Supertest:

    - Os testes de integração para as rotas da API utilizam o Supertest para garantir que os endpoints estão funcionando corretamente.

### Frontend

1. Testes de Componentes com Cypress:

    - O frontend utiliza Cypress para testes de integração e end-to-end. Para rodar os testes:
        ```bash
        npx cypress open

2. Testes Automatizados:

    - Testes automatizados foram configurados para garantir que as funcionalidades críticas, como edição de documentos e autenticação, estão funcionando conforme o esperado.