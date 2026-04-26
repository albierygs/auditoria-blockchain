// src/componentes/ExpensesManager.jsx
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaDollarSign, FaFileInvoiceDollar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/enviroments";

// Mapeamento das categorias de despesa
const EXPENSE_CATEGORIES = [
  { value: "INFRASTRUCTURE", label: "Infraestrutura" },
  { value: "SUPPLIES", label: "Suprimentos" },
  { value: "SERVICES", label: "Serviços" },
  { value: "PERSONNEL", label: "Pessoal" },
  { value: "MARKETING", label: "Marketing" },
  { value: "ADMINISTRATIVE", label: "Administrativo" },
  { value: "OTHER", label: "Outros" },
];

const formatCurrency = (value) => {
  if (value === null || value === undefined) return "R$ 0,00";
  return parseFloat(value).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const ExpensesManager = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null); // Estado para guardar a role

  const [newExpense, setNewExpense] = useState({
    name: "",
    description: "",
    value: 0,
    category: "SUPPLIES",
    payment_date: "",
  });

  const token = localStorage.getItem("token");

  // --- LÓGICA DE CARREGAMENTO INICIAL ---
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
        const organizationId = memberData.organization_id;

        if (!organizationId) {
          throw new Error("Membro não associado a uma organização ativa.");
        }

        // 2. Carregar Projetos da Organização
        const projectsResponse = await fetch(
          `${API_BASE_URL}/organizations/${organizationId}/projects`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!projectsResponse.ok)
          throw new Error("Falha ao carregar projetos.");

        const projectsData = await projectsResponse.json();
        setProjects(Array.isArray(projectsData) ? projectsData : []);

        // Define o primeiro projeto como selecionado
        if (projectsData.length > 0) {
          const initialProjectId = projectsData[0].public_id;
          setSelectedProjectId(initialProjectId);
          // A carga das despesas será disparada pelo useEffect do selectedProjectId
        }
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
  }, [navigate, token]);

  // --- LÓGICA DE CARREGAMENTO DE DESPESAS ---
  const loadExpenses = async (projectId) => {
    if (!projectId) {
      setExpenses([]);
      return;
    }
    setLoadingExpenses(true);
    setExpenses([]);

    try {
      const res = await fetch(
        `${API_BASE_URL}/projects/${projectId}/expenses`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Falha ao carregar despesas.");
      }

      const data = await res.json();
      setExpenses(data);
    } catch (err) {
      console.error("Erro ao carregar despesas:", err);
      alert(err.message);
    } finally {
      setLoadingExpenses(false);
    }
  };

  useEffect(() => {
    if (selectedProjectId) {
      loadExpenses(selectedProjectId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectId]);

  // --- AÇÕES DE DESPESA ---
  const createExpense = async (e) => {
    e.preventDefault();
    // Bloqueio de segurança extra no frontend
    if (userRole !== "ORG_ADMIN") {
      alert("Apenas administradores podem criar despesas.");
      return;
    }

    if (!selectedProjectId) {
      alert("Selecione um projeto antes de criar uma despesa.");
      return;
    }

    try {
      const payload = {
        ...newExpense,
        value: Number(newExpense.value),
        payment_date: newExpense.payment_date || null,
      };

      const res = await fetch(
        `${API_BASE_URL}/projects/${selectedProjectId}/expenses`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Falha ao criar despesa.");
      }

      alert("Despesa criada com sucesso!");
      setNewExpense({
        name: "",
        description: "",
        value: 0,
        category: "SUPPLIES",
        payment_date: "",
      });
      loadExpenses(selectedProjectId);
    } catch (err) {
      console.error("Erro ao criar despesa:", err);
      alert(`Erro ao criar despesa: ${err.message}`);
    }
  };

  const approveExpense = async (publicId) => {
    if (userRole !== "ORG_ADMIN") return;

    try {
      const res = await fetch(`${API_BASE_URL}/expenses/${publicId}/approve`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Falha ao aprovar despesa.");
      }

      alert("Despesa aprovada!");
      loadExpenses(selectedProjectId);
    } catch (err) {
      console.error("Erro ao aprovar despesa:", err);
      alert(`Erro ao aprovar despesa: ${err.message}`);
    }
  };

  const handleExpenseChange = (e) =>
    setNewExpense({ ...newExpense, [e.target.name]: e.target.value });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-teal-50 to-white">
        <p className="text-teal-800 font-semibold">Carregando dados...</p>
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
            <FaFileInvoiceDollar className="text-teal-800 text-2xl" />
            <h1 className="text-2xl font-bold text-teal-800 tracking-tight">
              Gerenciamento de Despesas
            </h1>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Box de Controle (Seletor) */}
        <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-teal-100 mb-8">
          <h2 className="text-xl font-semibold text-sky-800 mb-4">
            Filtrar por Projeto
          </h2>

          {error ? (
            <p className="text-red-500 mb-4">{error}</p>
          ) : projects.length === 0 ? (
            <p className="text-gray-600 mb-4">
              Nenhum projeto ativo encontrado.
            </p>
          ) : (
            <select
              className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-teal-400 bg-white/80"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              {projects.map((p) => (
                <option key={p.public_id} value={p.public_id}>
                  {p.title}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Layout Condicional: Se for Admin, mostra 2 colunas. Se não, centraliza a lista. */}
        <div
          className={`grid grid-cols-1 ${
            isAdmin ? "lg:grid-cols-2" : ""
          } gap-8`}
        >
          {/* COLUNA 1: Criar Despesa (APENAS PARA ORG_ADMIN) */}
          {isAdmin && (
            <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-teal-100 h-fit">
              <h2 className="text-xl font-semibold text-sky-800 mb-6">
                Criar Nova Despesa
              </h2>

              <form onSubmit={createExpense} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Nome da Despesa"
                    className="border p-3 rounded-lg w-full"
                    value={newExpense.name}
                    onChange={handleExpenseChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    name="description"
                    placeholder="Descrição detalhada"
                    className="border p-3 rounded-lg w-full"
                    value={newExpense.description}
                    onChange={handleExpenseChange}
                    required
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valor (R$)
                    </label>
                    <div className="relative">
                      <FaDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        name="value"
                        placeholder="0.00"
                        className="border p-3 rounded-lg w-full pl-10"
                        value={newExpense.value}
                        onChange={handleExpenseChange}
                        required
                        min="0.01"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data Pgto (Opcional)
                    </label>
                    <input
                      type="date"
                      name="payment_date"
                      className="border p-3 rounded-lg w-full"
                      value={newExpense.payment_date}
                      onChange={handleExpenseChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria
                  </label>
                  <select
                    name="category"
                    className="border p-3 rounded-lg w-full"
                    value={newExpense.category}
                    onChange={handleExpenseChange}
                    required
                  >
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-teal-500 to-green-600 text-white py-3 rounded-md font-semibold shadow-md hover:from-teal-600 hover:to-green-700 transition-all disabled:bg-gray-400"
                  disabled={!selectedProjectId}
                >
                  Criar Despesa
                </button>
              </form>
            </div>
          )}

          {/* COLUNA 2: Lista de Despesas (VISÍVEL PARA TODOS) */}
          <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-teal-100">
            <h2 className="text-2xl font-bold text-sky-800 mb-4">
              Despesas do Projeto
            </h2>

            {loadingExpenses ? (
              <p className="text-gray-600">Carregando despesas...</p>
            ) : expenses.length === 0 ? (
              <p className="text-gray-600">
                Nenhuma despesa encontrada para este projeto.
              </p>
            ) : (
              <div className="space-y-4">
                {expenses.map((exp) => (
                  <div
                    key={exp.public_id}
                    className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center transition hover:shadow-md"
                  >
                    <div>
                      <h3 className="font-semibold text-teal-800">
                        {exp.name}
                      </h3>
                      <p className="text-xs text-gray-600">
                        Valor: {formatCurrency(exp.value)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Categoria: {exp.category}
                      </p>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-sm font-semibold ${
                          exp.status === "PENDING"
                            ? "text-yellow-600"
                            : exp.status === "APPROVED"
                              ? "text-blue-600"
                              : exp.status === "PAID"
                                ? "text-green-600"
                                : "text-red-600"
                        }`}
                      >
                        {exp.status}
                      </p>

                      {/* Botão APROVAR visível apenas para ORG_ADMIN */}
                      {isAdmin && exp.status === "PENDING" && (
                        <button
                          className="mt-2 px-3 py-1 bg-green-600 text-white text-xs rounded shadow hover:bg-green-700 transition"
                          onClick={() => approveExpense(exp.public_id)}
                        >
                          Aprovar
                        </button>
                      )}
                    </div>
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

export default ExpensesManager;
