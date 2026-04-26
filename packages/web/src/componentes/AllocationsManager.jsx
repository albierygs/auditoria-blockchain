// src/componentes/AllocationsManager.jsx
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaChartLine } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/enviroments";

// Funções auxiliares para formatação
const formatCurrency = (value) => {
  if (value === null || value === undefined) return "R$ 0,00";
  return parseFloat(value).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("pt-BR");
};

const AllocationsManager = () => {
  const navigate = useNavigate();
  const [organizationId, setOrganizationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null); // Estado para armazenar o papel do usuário

  const [allocations, setAllocations] = useState([]);
  const [projects, setProjects] = useState([]);
  const [donations, setDonations] = useState([]); // Apenas doações CONFIRMED são listadas

  const [newAllocation, setNewAllocation] = useState({
    donation_id: "",
    project_id: "",
    amount_allocated: "",
  });

  const token = localStorage.getItem("token");

  // --- LÓGICA DE CARREGAMENTO INICIAL: ORG ID + DEPENDÊNCIAS ---
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!token) {
        navigate("/member-login");
        return;
      }

      try {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.publicId;

        // Define a role do usuário para controle de interface
        setUserRole(decodedToken.memberRole);

        // 1. Obter ID da Organização do Membro
        const memberResponse = await fetch(
          `${API_BASE_URL}/members/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!memberResponse.ok)
          throw new Error("Falha ao obter dados do membro.");

        const memberData = await memberResponse.json();
        const orgId = memberData.organization_id;

        if (!orgId) {
          throw new Error("Membro não associado a uma organização ativa.");
        }
        setOrganizationId(orgId);

        // 2. Carregar Projetos (todos da organização)
        await fetchProjects(orgId);

        // 3. Carregar Doações Confirmadas (filtradas por organização)
        await fetchDonations(orgId);

        // 4. Carregar Alocações (filtradas por organização)
        await fetchAllocations(orgId);
      } catch (err) {
        console.error("Erro ao carregar dados iniciais:", err);
        setError(
          err.message || "Erro desconhecido ao carregar dados iniciais."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, token]);

  // Funções de busca (reutilizáveis)
  const fetchProjects = async (orgId) => {
    const projectsResponse = await fetch(
      `${API_BASE_URL}/organizations/${orgId}/projects`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!projectsResponse.ok) console.error("Falha ao carregar projetos.");
    const projectsData = await projectsResponse.json();
    setProjects(Array.isArray(projectsData) ? projectsData : []);
  };

  const fetchDonations = async (orgId) => {
    const donationsResponse = await fetch(
      `${API_BASE_URL}/donations?organizationId=${orgId}&status=CONFIRMED`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!donationsResponse.ok) console.error("Falha ao carregar doações.");
    const donationsData = await donationsResponse.json();
    setDonations(Array.isArray(donationsData) ? donationsData : []);
  };

  const fetchAllocations = async (orgId) => {
    const allocationsResponse = await fetch(
      `${API_BASE_URL}/allocations?organizationId=${orgId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!allocationsResponse.ok) console.error("Falha ao carregar alocações.");
    const allocationsData = await allocationsResponse.json();
    setAllocations(Array.isArray(allocationsData) ? allocationsData : []);
  };

  // --- LÓGICA DE CRIAÇÃO DE ALOCAÇÃO ---
  const handleAllocate = async (e) => {
    e.preventDefault();

    // Bloqueio de segurança extra no frontend
    if (userRole !== "ORG_ADMIN") {
      alert("Apenas administradores podem registrar alocações.");
      return;
    }

    if (!organizationId) {
      alert("ID da organização não está disponível.");
      return;
    }

    // Validação básica do valor
    const amount = Number(newAllocation.amount_allocated);
    if (
      amount <= 0 ||
      !newAllocation.donation_id ||
      !newAllocation.project_id
    ) {
      alert("Por favor, selecione uma doação, um projeto e um valor positivo.");
      return;
    }

    try {
      const payload = {
        donation_id: newAllocation.donation_id,
        project_id: newAllocation.project_id,
        amount_allocated: amount,
        organization_id: organizationId,
      };

      const res = await fetch(`${API_BASE_URL}/allocations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Falha ao registrar alocação.");
      }

      alert("Alocação registrada com sucesso!");

      // Limpa o formulário e recarrega a lista
      setNewAllocation({
        donation_id: "",
        project_id: "",
        amount_allocated: "",
      });

      await fetchAllocations(organizationId);
    } catch (err) {
      console.error("Erro ao alocar:", err);
      alert(`Erro ao registrar alocação: ${err.message}`);
    }
  };

  const handleChange = (e) => {
    setNewAllocation({ ...newAllocation, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-teal-50 to-white">
        <p className="text-teal-800 font-semibold">
          Carregando dados da organização...
        </p>
      </div>
    );
  }

  // Define se é admin para facilitar condicionais
  const isAdmin = userRole === "ORG_ADMIN";

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-green-100 via-teal-50 to-white">
      {/* Cabeçalho fixo */}
      <header className="backdrop-blur-md bg-white/80 shadow-md border-b border-teal-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/member-dashboard")}
            className="text-teal-600 hover:text-teal-700 transition-colors"
          >
            <FaArrowLeft className="text-2xl" />
          </button>
          <div className="flex items-center gap-3">
            <FaChartLine className="text-teal-800 text-2xl" />
            <h1 className="text-2xl font-bold text-teal-800 tracking-tight">
              Gerenciamento de Alocações
            </h1>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Layout Condicional: Se for Admin, mostra 2 colunas (sendo a lista maior). Se não, centraliza a lista. */}
        <div
          className={`grid grid-cols-1 ${
            isAdmin ? "lg:grid-cols-3" : ""
          } gap-8`}
        >
          {/* COLUNA 1: Registrar Alocação (APENAS PARA ORG_ADMIN) */}
          {isAdmin && (
            <div className="lg:col-span-1 bg-white/80 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-teal-100 h-fit">
              <h2 className="text-xl font-semibold text-sky-800 mb-6">
                Registrar Nova Alocação
              </h2>

              <form onSubmit={handleAllocate} className="space-y-4">
                {/* Seletor de Doação */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Doação de Origem
                  </label>
                  <select
                    name="donation_id"
                    className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-teal-400 bg-white/80"
                    value={newAllocation.donation_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecione a Doação</option>
                    {donations.map((d) => (
                      <option key={d.public_id} value={d.public_id}>
                        {d.donor?.person?.name || "Doador Anônimo"} -{" "}
                        {formatCurrency(d.value)} ({formatDate(d.date)})
                      </option>
                    ))}
                  </select>
                  {donations.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">
                      Nenhuma doação CONFIRMED disponível para alocação.
                    </p>
                  )}
                </div>

                {/* Seletor de Projeto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Projeto de Destino
                  </label>
                  <select
                    name="project_id"
                    className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-teal-400 bg-white/80"
                    value={newAllocation.project_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecione o Projeto</option>
                    {projects.map((p) => (
                      <option key={p.public_id} value={p.public_id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                  {projects.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">
                      Nenhum projeto disponível.
                    </p>
                  )}
                </div>

                {/* Valor a Alocar */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor a Alocar (R$)
                  </label>
                  <input
                    type="number"
                    name="amount_allocated"
                    placeholder="Ex: 50.00"
                    className="border p-3 rounded-lg w-full"
                    value={newAllocation.amount_allocated}
                    onChange={handleChange}
                    min="0.01"
                    step="0.01"
                    required
                  />
                </div>

                <button className="w-full bg-gradient-to-r from-teal-500 to-green-600 text-white py-3 rounded-md font-semibold shadow-md hover:from-teal-600 hover:to-green-700 transition-all duration-300">
                  Registrar Alocação
                </button>
              </form>
            </div>
          )}

          {/* COLUNA 2/3: Lista de Alocações (VISÍVEL PARA TODOS) */}
          <div
            className={`${
              isAdmin ? "lg:col-span-2" : "lg:col-span-3"
            } bg-white/80 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-teal-100`}
          >
            <h2 className="text-2xl font-bold text-sky-800 mb-4">
              Histórico de Alocações
            </h2>

            {allocations.length === 0 ? (
              <p className="text-gray-600">
                Nenhuma alocação registrada para esta organização.
              </p>
            ) : (
              <div className="space-y-4">
                {allocations.map((a) => (
                  <div
                    key={a.public_id}
                    className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 transition hover:shadow-md"
                  >
                    <h3 className="font-semibold text-teal-800 mb-1">
                      {a.project?.title || "Projeto Desconhecido"}
                    </h3>

                    <div className="grid grid-cols-2 text-sm gap-y-1">
                      <p>
                        <strong>Valor Alocado:</strong>{" "}
                        <span className="font-medium text-green-600">
                          {formatCurrency(a.amount_allocated)}
                        </span>
                      </p>
                      <p>
                        <strong>Organização:</strong>{" "}
                        {a.organization?.name || "N/A"}
                      </p>
                      <p>
                        <strong>Doação (Total):</strong>{" "}
                        {formatCurrency(a.donation?.value)}
                      </p>
                      <p>
                        <strong>Doador:</strong>{" "}
                        {a.donation?.donor?.person?.name || "Anônimo"}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Data: {formatDate(a.allocation_date)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AllocationsManager;
