# Auditoria Blockchain & Gestão de Doações 🌍🔗

Bem-vindo ao projeto **Auditoria Blockchain**, uma plataforma acadêmica de ponta a ponta desenvolvida para trazer **transparência absoluta** ao terceiro setor. O sistema permite que doadores acompanhem exatamente o destino de suas contribuições, unindo a facilidade de pagamentos modernos com o rastreamento imutável de uma blockchain simulada.

## 🌟 Principais Recursos

### 1. Pagamentos Transparentes e Seguros (Stripe) 💳
- **Stripe Connect:** Organizações (ONGs) cadastradas criam subcontas ("Express") para receberem os valores diretamente. Todo o fluxo de KYC (conheça seu cliente) é delegado à infraestrutura segura da Stripe.
- **Stripe Checkout:** Doadores são redirecionados para a página segura hospedada pela Stripe para realizar o pagamento (Cartão, PIX, etc.). Isso reduz a complexidade do sistema e garante 100% de adequação PCI Compliance.
- **Webhooks Integrados:** Atualização automática de status das doações e contas através de eventos como `checkout.session.completed` e `account.updated`.

### 2. Auditoria e Rastreabilidade (Blockchain Simulada) 🧱
Para demonstrar o poder da Web3 de forma acessível e sem custos de "gas":
- **Transações Imutáveis:** Toda doação confirmada e toda alocação de recursos gera uma transação irreversível simulando a rede `ETHEREUM_TESTNET`.
- **Hashes e Blocos:** Cada registro recebe um Hash Criptográfico (`0x...`) único e um número de bloco, servindo como comprovante permanente da movimentação financeira.
- **Portal de Transparência:** Uma interface dedicada que exibe o histórico de status de cada doação e permite auditorias diretas no "livro-razão" do sistema.

### 3. Gestão Completa de Organizações 🏢
- Dashboard administrativa completa para membros gerenciarem:
  - Projetos Ativos.
  - Alocação e controle de Despesas (onde o dinheiro está sendo gasto).
  - Voluntariado (registro de horas).
  - Controle de Membros.

### 4. Experiência do Doador 💝
- Acompanhamento do Histórico de Doações.
- Visualização de Impacto Social das ONGs apoiadas.
- Status em tempo real via polling do momento do checkout até a confirmação final pela Stripe/Blockchain.

---

## 🛠️ Tecnologias Utilizadas

Este projeto utiliza uma arquitetura **Monorepo** gerenciada pelo `TurboRepo` e `pnpm`.

### Backend (`packages/api`)
- **Node.js + Express:** API RESTful robusta e modular.
- **Prisma ORM:** Gerenciamento elegante do banco de dados relacional.
- **Stripe SDK:** Integração bancária e financeira.
- **MySQL / PostgreSQL:** Banco de dados relacional.

### Frontend (`packages/web`)
- **React.js (Vite):** Interface dinâmica, rápida e responsiva.
- **TailwindCSS:** Estilização utilitária e componentes visuais (incluindo Glassmorphism e micro-animações).
- **React Router Dom:** Gerenciamento de rotas e navegação protegida.
- **React Icons:** Iconografia vetorial.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/en/) (v18+)
- [pnpm](https://pnpm.io/)
- Banco de Dados SQL (ou utilize o Docker embutido no projeto)
- Conta na [Stripe](https://stripe.com)

### Passo a Passo

1. **Clone o repositório e instale as dependências:**
   ```bash
   git clone <url-do-repositorio>
   cd auditoria-blockchain
   pnpm install
   ```

2. **Configure as Variáveis de Ambiente:**
   Configure os arquivos `.env` na raiz e dentro de `packages/api`.
   *Exemplo de `.env` da API:*
   ```env
   DATABASE_URL="mysql://usuario:senha@localhost:3306/auditoria_db"
   JWT_SECRET="sua_chave_secreta"
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   ```

3. **Suba o Banco de Dados:**
   Se preferir usar o Docker:
   ```bash
   docker-compose up -d
   ```

4. **Sincronize o Prisma ORM:**
   ```bash
   cd packages/api
   npx prisma db push
   ```

5. **Inicie a aplicação:**
   Na raiz do projeto, execute:
   ```bash
   pnpm run dev
   ```
   *O TurboRepo irá paralelizar a execução do Backend e do Frontend.*

6. **Webhooks Locais (Opcional):**
   Para testar pagamentos localmente, use o Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:<PORTA_API>/webhooks/stripe
   ```

---

## 🏗️ Estrutura do Projeto

```
auditoria-blockchain/
├── packages/
│   ├── api/                # Backend (Express + Prisma)
│   │   ├── prisma/         # Schema do Banco de Dados
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── services/   # Regras de Negócios (Blockchain, Stripe)
│   │   │   ├── routes/
│   │   │   └── index.js
│   └── web/                # Frontend (React + Vite + Tailwind)
│       ├── src/
│       │   ├── componentes/
│       │   ├── App.jsx
│       │   └── index.css
├── docker-compose.yaml     # Arquitetura infraestrutura local
├── package.json            # Scripts do Monorepo
└── turbo.json              # Configurações do TurboRepo
```

---

*Desenvolvido como um projeto acadêmico focado em impacto social, transparência financeira e integração de tecnologias modernas.* 💙
