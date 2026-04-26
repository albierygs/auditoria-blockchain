// src/componentes/FinanceiroDashboard.jsx
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaChartBar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/enviroments";

// Funções auxiliares para formatação
const formatCurrency = (value) => {
  return parseFloat(value).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Mapeamento das categorias para exibição amigável
const CATEGORY_LABELS = {
  INFRASTRUCTURE: "Infraestrutura",
  SUPPLIES: "Suprimentos",
  SERVICES: "Serviços",
  PERSONNEL: "Pessoal",
  MARKETING: "Marketing",
  ADMINISTRATIVE: "Administrativo",
  OTHER: "Outros",
};

export default function FinanceiroDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estrutura de dados calculada localmente
  const [dashboardData, setDashboardData] = useState({
    total_arrecadado: 0,
    total_gasto: 0, // Despesas Aprovadas/Pagas
    saldo_disponivel: 0,
    gastos_por_categoria: [],
  });

  const token = localStorage.getItem("token");

  // --- LÓGICA DE BUSCA E AGREGAÇÃO ---
  useEffect(() => {
    const fetchAndAggregateData = async () => {
      if (!token) {
        navigate("/member-login");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.publicId;

        // 1. Obter ID da Organização do Membro
        const memberResponse = await fetch(
          `${API_BASE_URL}/members/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!memberResponse.ok)
          throw new Error("Falha ao obter ID da organização.");

        const memberData = await memberResponse.json();
        const organizationId = memberData.organization_id;

        if (!organizationId) {
          throw new Error("Membro não associado a uma organização ativa.");
        }

        // --- BUSCAS CONCORRENTES ---
        const [donationsData, projectsData] = await Promise.all([
          // Busca Doações da Organização
          fetch(`${API_BASE_URL}/donations/`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((res) => res.json()),
          // Busca Projetos da Organização
          fetch(`${API_BASE_URL}/organizations/${organizationId}/projects`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((res) => res.json()),
        ]);

        const donationsDataFiltred = donationsData.filter(
          (d) => d.organization_id === organizationId
        );

        // 2. Cálculo de Receita (Total Arrecadado)
        let totalArrecadado = 0;
        if (Array.isArray(donationsDataFiltred)) {
          totalArrecadado = donationsDataFiltred.reduce(
            (sum, d) =>
              d.status === "CONFIRMED" ? sum + parseFloat(d.value) : sum,
            0
          );
        }

        // 3. Agregação de Despesas por Projeto
        let totalGasto = 0;
        const expenseBreakdown = {};

        if (Array.isArray(projectsData)) {
          // Busca despesas de todos os projetos em paralelo
          const expensePromises = projectsData.map((project) =>
            fetch(`${API_BASE_URL}/projects/${project.public_id}/expenses`, {
              headers: { Authorization: `Bearer ${token}` },
            })
              .then((res) => (res.ok ? res.json() : []))
              .catch(() => [])
          );

          const allExpensesArrays = await Promise.all(expensePromises);
          const allExpenses = allExpensesArrays.flat(); // Achatando a lista de despesas

          // Agregação de Gastos (Apenas APPROVED ou PAID)
          console.log(allExpenses);
          allExpenses.forEach((exp) => {
            if (exp.status === "APPROVED" || exp.status === "PAID") {
              const expenseValue = parseFloat(exp.value);
              totalGasto += expenseValue;

              const category = exp.category || "OTHER";
              expenseBreakdown[category] =
                (expenseBreakdown[category] || 0) + expenseValue;
            }
          });
        }

        // 4. Finalizar Cálculos e Estruturar Dados
        const saldoDisponivel = totalArrecadado - totalGasto;

        const gastosPorCategoria = Object.entries(expenseBreakdown)
          .map(([category, value]) => ({
            nome: CATEGORY_LABELS[category] || category,
            valor: value,
          }))
          .sort((a, b) => b.valor - a.valor); // Ordena por valor decrescente

        setDashboardData({
          total_arrecadado: totalArrecadado,
          total_gasto: totalGasto,
          saldo_disponivel: saldoDisponivel,
          gastos_por_categoria: gastosPorCategoria,
        });
      } catch (error) {
        console.error("Erro ao carregar dashboard financeiro:", error);
        setError(error.message || "Erro ao carregar dados financeiros.");
      } finally {
        setLoading(false);
      }
    };

    fetchAndAggregateData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, token]);

  return (
    // NOVO LAYOUT: Padrão de Membro
    <div className="w-full min-h-screen bg-gradient-to-br from-green-100 via-teal-50 to-white">
      {/* NOVO LAYOUT: Cabeçalho fixo */}
      <header className="backdrop-blur-md bg-white/80 shadow-md border-b border-teal-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/member-dashboard")}
            className="text-teal-600 hover:text-teal-700 transition-colors"
          >
            <FaArrowLeft className="text-2xl" />
          </button>
          <div className="flex items-center gap-3">
            <FaChartBar className="text-teal-800 text-2xl" />
            <h1 className="text-2xl font-bold text-teal-800 tracking-tight">
              Dashboard Financeiro
            </h1>
          </div>
        </div>
      </header>

      {/* NOVO LAYOUT: Conteúdo principal centralizado */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <p className="text-gray-600">Carregando dados financeiros...</p>
        ) : error ? (
          <div className="bg-white/80 rounded-xl shadow-xl p-8 border border-red-100">
            <p className="text-red-500 font-semibold">
              Erro ao carregar: {error}
            </p>
          </div>
        ) : (
          <>
            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {/* Total Arrecadado */}
              <div className="bg-white shadow rounded-xl p-6 border border-teal-100">
                <h2 className="text-lg font-semibold mb-2 text-gray-700">
                  Total Arrecadado (Confirmado)
                </h2>
                <p className="text-3xl font-bold text-green-600">
                  R$ {formatCurrency(dashboardData.total_arrecadado)}
                </p>
              </div>

              {/* Total Gasto (Despesas Aprovadas/Pagas) */}
              <div className="bg-white shadow rounded-xl p-6 border border-teal-100">
                <h2 className="text-lg font-semibold mb-2 text-gray-700">
                  Total Gasto (Despesas)
                </h2>
                <p className="text-3xl font-bold text-red-600">
                  R$ {formatCurrency(dashboardData.total_gasto)}
                </p>
              </div>

              {/* Saldo Disponível (Arrecadado - Gasto) */}
              <div className="bg-white shadow rounded-xl p-6 border border-teal-100">
                <h2 className="text-lg font-semibold mb-2 text-gray-700">
                  Saldo Disponível (Est.)
                </h2>
                <p
                  className={`text-3xl font-bold ${
                    dashboardData.saldo_disponivel >= 0
                      ? "text-blue-600"
                      : "text-red-600"
                  }`}
                >
                  R$ {formatCurrency(dashboardData.saldo_disponivel)}
                </p>
              </div>
            </div>

            {/* Distribuição de Gastos por Categoria */}
            {dashboardData.gastos_por_categoria.length > 0 && (
              <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-teal-100">
                <h2 className="text-xl font-semibold text-sky-800 mb-6 flex items-center gap-2">
                  <FaChartBar /> Distribuição de Gastos por Categoria
                </h2>

                <ul className="space-y-3">
                  {dashboardData.gastos_por_categoria.map((g, i) => {
                    const percentage =
                      (g.valor / dashboardData.total_gasto) * 100;

                    return (
                      <li key={i} className="py-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-gray-700">
                            {g.nome}
                          </span>
                          <span className="font-semibold text-teal-700">
                            {formatCurrency(g.valor)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 relative">
                          <div
                            className="bg-teal-600 h-2.5 rounded-full"
                            style={{ width: `${percentage.toFixed(2)}%` }}
                          ></div>
                          <span className="absolute right-0 top-1/2 transform -translate-y-1/2 text-xs text-gray-800 pr-1">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
