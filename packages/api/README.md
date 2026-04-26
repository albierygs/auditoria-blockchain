# Blockchain Audit API

API desenvolvida para promover a transparência e auditoria em organizações sociais através de uma simulação de tecnologia blockchain. O sistema permite o rastreamento completo de doações, desde a entrada de recursos até a sua alocação em projetos e despesas específicas, gerando um histórico imutável e auditável.

## 🔗 Links do Projeto

- **API (Backend):** [https://blockchain-audit-nine.vercel.app/](https://blockchain-audit-nine.vercel.app/)
- **Aplicação Web (Frontend):** [https://auditoria-nine.vercel.app/](https://auditoria-nine.vercel.app/)

## 📝 Sobre o Projeto

Este projeto é uma solução de backend focada em **transparência filantrópica**. Ele gerencia o fluxo de recursos dentro de organizações (ONGs), conectando doadores, membros e beneficiários.

A principal característica é o **Ledger de Blockchain Simulado**. Para fins acadêmicos e de demonstração, o sistema gera hashes criptográficos (SHA-256) para cada transação (doação ou alocação), simulando a imutabilidade e a estrutura de blocos de uma rede blockchain real (como Ethereum ou Polygon), sem a complexidade ou custos de gás de uma rede principal.

## 🚀 Tecnologias Utilizadas

- **Linguagem:** Node.js (JavaScript)
- **Framework:** Express.js
- **ORM:** Prisma
- **Banco de Dados:** MySQL
- **Validação:** Zod
- **Autenticação:** JWT (JSON Web Tokens) & BcryptJS
- **Simulação Blockchain:** Crypto (Módulo nativo do Node.js)

## ✨ Funcionalidades Principais

Com base na estrutura do banco de dados:

- **Gestão de Organizações:** Cadastro de ONGs, verificação de status e gestão de membros com diferentes níveis de acesso (Admin, Auditor, Voluntário).
- **Rastreabilidade de Doações:** Registro de doações com suporte a múltiplos métodos de pagamento (PIX, Transferência, etc.) e emissão de Certificados Digitais/NFTs para doadores.
- **Gestão de Projetos e Despesas:** Criação de projetos, alocação de fundos recebidos e registro detalhado de despesas (comprovantes, categorias).
- **Blockchain Ledger:** Registro automático de transações financeiras em uma estrutura de blockchain simulada para auditoria, incluindo hash, número do bloco e timestamp.
- **Registro de Voluntariado:** Controle de horas trabalhadas e logs de atividades de voluntários.
- **Auditoria Completa:** Logs de sistema (`audit_log`) e histórico de alteração de status (`status_history`) para todas as entidades críticas.

## 🛠️ Como Rodar Localmente

### Pré-requisitos

- Node.js (v18+)
- MySQL (Local ou via Docker)
- NPM ou Yarn

### Passo a passo

1.  **Clone o repositório**

    ```bash
    git clone [https://github.com/seu-usuario/blockchain-audit.git](https://github.com/seu-usuario/blockchain-audit.git)
    cd blockchain-audit
    ```

2.  **Instale as dependências**

    ```bash
    npm install
    ```

3.  **Configure as Variáveis de Ambiente**
    Crie um arquivo `.env` na raiz do projeto com base nas configurações necessárias (exemplo):

    ```env
    DATABASE_URL="mysql://usuario:senha@localhost:3306/blockchain_audit"
    JWT_SECRET="sua_chave_secreta_aqui"
    PORT=3000
    NODE_ENV="development"
    ```

4.  **Execute as Migrations do Prisma**
    Isso criará as tabelas no seu banco de dados MySQL.

    ```bash
    npx prisma migrate dev --name init
    ```

5.  **Inicie o Servidor**

    ```bash
    # Para desenvolvimento (com nodemon)
    npm run dev

    # Para produção
    npm start
    ```

A API estará rodando em `http://localhost:3000/api`.

## 📚 Estrutura da API

A aplicação segue a arquitetura MVC/Service Layer:

- `src/controllers`: Lógica de entrada e saída das requisições.
- `src/services`: Regras de negócio e comunicação com o banco de dados.
- `src/routes`: Definição dos endpoints da API.
- `src/schemas`: Validação de dados de entrada com Zod.
- `src/middlewares`: Tratamento de erros, autenticação e validação.

## 📄 Licença

Este projeto está sob a licença MIT.
