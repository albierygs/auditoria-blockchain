import { Route, Routes, useLocation } from "react-router-dom";
import "./index.css";

import AdminLogin from "./componentes/AdminLogin";
import Home from "./componentes/Home";
import Login from "./componentes/Login";
import MemberLogin from "./componentes/MemberLogin";
import OrganizationRegisterForm from "./componentes/OrganizationRegisterForm";
import ProtectedRoute from "./componentes/ProtectedRoute";
import RegisterForm from "./componentes/RegisterForm";
import VerifyOrganization from "./componentes/VerifyOrganization";

import AddAdminForm from "./componentes/AddAdminForm";
import AdminDashboard from "./componentes/AdminDashboard";
import ApproveOrganizations from "./componentes/ApproveOrganizations";
import DashboardDoador from "./componentes/DashboardDoador";
import DetalhesDoacoes from "./componentes/DetalhesDoacoes";
import HistoricoDoacoes from "./componentes/HistoricoDoacoes";
import MemberDashboard from "./componentes/MemberDashboard";
import PerfilDoador from "./componentes/PerfilDoador";

import TrocarSenha from "./componentes/TrocarSenha";

import ForgotPassword from "./componentes/ForgotPassword";
import ResetPassword from "./componentes/ResetPassword";

import Alocacao from "./componentes/Alocacao";
import Blockchain from "./componentes/Blockchain";
import Doacao from "./componentes/Doacao";
import Pagamento from "./componentes/Pagamento";
import PagamentoCancelado from "./componentes/PagamentoCancelado";
import PagamentoSucesso from "./componentes/PagamentoSucesso";

import FinanceiroContas from "./componentes/FinanceiroContas";
import FinanceiroDashboard from "./componentes/FinanceiroDashboard";

import ProjetoForm from "./componentes/ProjetoForm";
import Projetos from "./componentes/Projetos";

import Beneficiarios from "./componentes/Beneficiarios";
import Fornecedores from "./componentes/Fornecedores";

import VoluntariadoDashboard from "./componentes/VoluntariadoDashboard";
import VoluntariadoHoras from "./componentes/VoluntariadoHoras";

import ImpactoSocial from "./componentes/ImpactoSocial";
import PortalTransparencia from "./componentes/PortalTransparencia";

import AuditoriaBlockchain from "./componentes/AuditoriaBlockchain";
import Relatorios from "./componentes/Relatorios";

import Configuracoes from "./componentes/Configuracoes";

// NOVAS ROTAS SIMPLES
import AdminAllocationsManager from "./componentes/AdminAllocationsManager";
import AdminAuditoriaBlockchain from "./componentes/AdminAuditoriaBlockchain";
import AdminExpensesManager from "./componentes/AdminExpensesManager";
import AdminFinanceiroDashboard from "./componentes/AdminFinanceiroDashboard";
import AdminMembersManager from "./componentes/AdminMembersManager";
import AdminOrganizationsList from "./componentes/AdminOrganizationsList";
import AdminProjectsManager from "./componentes/AdminProjectsManager";
import AdminVoluntariadoDashboard from "./componentes/AdminVoluntariadoDashboard";
import AllocationsManager from "./componentes/AllocationsManager";
import ExpensesManager from "./componentes/ExpensesManager";
import MembersManager from "./componentes/MembersManager";
import OrganizationProfile from "./componentes/OrganizationProfile";
import ProjectsManager from "./componentes/ProjectsManager";

import StatusHistory from "./componentes/StatusHistory";

function App() {
  const location = useLocation();

  const bgPages = [
    "/",
    "/login",
    "/forgot-password",
    "/reset-password",
    "member-login",
    "/admin-login",
  ];
  const isBgPage = bgPages.includes(location.pathname);

  return (
    <div className="min-h-screen w-full overflow-y-auto">
      {isBgPage && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-[#0A2540] via-[#1976D2] to-[#64B5F6] animate-gradient-slow z-0" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(255,255,255,0.15),transparent_70%)] z-0" />
        </>
      )}

      <div className="relative z-10 p-4">
        <Routes>
          {/* ROTAS DE ACESSO (NÃO PROTEGIDAS) */}
          <Route path="/" element={<Home />} />
          <Route path="/register-donor" element={<RegisterForm />} />
          <Route
            path="/organization-register"
            element={<OrganizationRegisterForm />}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/member-login" element={<MemberLogin />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/transparencia" element={<PortalTransparencia />} />
          <Route path="/transparencia/impacto" element={<ImpactoSocial />} />

          {/* ROTAS PROTEGIDAS (DOADOR E MEMBRO) */}

          {/* Dashboard ADM */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Ações de Admin */}
          <Route
            path="/admin/organizations"
            element={
              <ProtectedRoute>
                <ApproveOrganizations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/organizations/verify/:id"
            element={
              <ProtectedRoute>
                <VerifyOrganization />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/add-admin"
            element={
              <ProtectedRoute>
                <AddAdminForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/projects"
            element={
              <ProtectedRoute>
                <AdminProjectsManager />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/members"
            element={
              <ProtectedRoute>
                <AdminMembersManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/volunteer-logs"
            element={
              <ProtectedRoute>
                <AdminVoluntariadoDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/allocations"
            element={
              <ProtectedRoute>
                <AdminAllocationsManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/expenses"
            element={
              <ProtectedRoute>
                <AdminExpensesManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/finance"
            element={
              <ProtectedRoute>
                <AdminFinanceiroDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/blockchain"
            element={
              <ProtectedRoute>
                <AdminAuditoriaBlockchain />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/all-organizations"
            element={
              <ProtectedRoute>
                <AdminOrganizationsList />
              </ProtectedRoute>
            }
          />

          {/* Doador */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardDoador />
              </ProtectedRoute>
            }
          />
          <Route
            path="/historico-doacoes"
            element={
              <ProtectedRoute>
                <HistoricoDoacoes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/detalhes-doacoes/:id"
            element={
              <ProtectedRoute>
                <DetalhesDoacoes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <PerfilDoador />
              </ProtectedRoute>
            }
          />
          <Route
            path="/perfil/change-password"
            element={
              <ProtectedRoute>
                <TrocarSenha />
              </ProtectedRoute>
            }
          />

          {/* Doações/Blockchain/Alocação (Interfaces Doador) */}
          <Route
            path="/doacao"
            element={
              <ProtectedRoute>
                <Doacao />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pagamento/:donationId"
            element={
              <ProtectedRoute>
                <Pagamento />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pagamento/sucesso/:donationId"
            element={
              <ProtectedRoute>
                <PagamentoSucesso />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pagamento/cancelado/:donationId"
            element={
              <ProtectedRoute>
                <PagamentoCancelado />
              </ProtectedRoute>
            }
          />
          <Route
            path="/blockchain"
            element={
              <ProtectedRoute>
                <Blockchain />
              </ProtectedRoute>
            }
          />
          <Route
            path="/alocacao"
            element={
              <ProtectedRoute>
                <Alocacao />
              </ProtectedRoute>
            }
          />

          {/* Membro da Organização */}
          <Route
            path="/member-dashboard"
            element={
              <ProtectedRoute>
                <MemberDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/organization/profile"
            element={
              <ProtectedRoute>
                <OrganizationProfile />
              </ProtectedRoute>
            }
          />

          {/* Financeiro */}
          <Route
            path="/financeiro"
            element={
              <ProtectedRoute>
                <FinanceiroDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/financeiro/contas"
            element={
              <ProtectedRoute>
                <FinanceiroContas />
              </ProtectedRoute>
            }
          />

          {/* Projetos */}
          <Route
            path="/projetos"
            element={
              <ProtectedRoute>
                <Projetos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projetos/novo"
            element={
              <ProtectedRoute>
                <ProjetoForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projetos/detalhes/:id"
            element={
              <ProtectedRoute>
                <ProjetoForm />
              </ProtectedRoute>
            }
          />

          {/* Cadastros */}
          <Route
            path="/fornecedores"
            element={
              <ProtectedRoute>
                <Fornecedores />
              </ProtectedRoute>
            }
          />
          <Route
            path="/beneficiarios"
            element={
              <ProtectedRoute>
                <Beneficiarios />
              </ProtectedRoute>
            }
          />

          {/* Voluntariado */}
          <Route
            path="/voluntariado"
            element={
              <ProtectedRoute>
                <VoluntariadoDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/voluntariado/horas"
            element={
              <ProtectedRoute>
                <VoluntariadoHoras />
              </ProtectedRoute>
            }
          />

          {/* Relatórios e Auditoria */}
          <Route
            path="/relatorios"
            element={
              <ProtectedRoute>
                <Relatorios />
              </ProtectedRoute>
            }
          />
          <Route
            path="/auditoria/blockchain"
            element={
              <ProtectedRoute>
                <AuditoriaBlockchain />
              </ProtectedRoute>
            }
          />

          {/* Configurações */}
          <Route
            path="/configuracoes"
            element={
              <ProtectedRoute>
                <Configuracoes />
              </ProtectedRoute>
            }
          />

          {/* Histórico de Status (Auditoria) */}
          <Route
            path="/status-history"
            element={
              <ProtectedRoute>
                <StatusHistory />
              </ProtectedRoute>
            }
          />

          {/* ROTAS SIMPLES DE ADMIN/MEMBRO */}
          <Route
            path="/membros"
            element={
              <ProtectedRoute>
                <MembersManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/despesas"
            element={
              <ProtectedRoute>
                <ExpensesManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/alocacoes"
            element={
              <ProtectedRoute>
                <AllocationsManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gerenciar-projetos"
            element={
              <ProtectedRoute>
                <ProjectsManager />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
