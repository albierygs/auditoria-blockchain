import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaChartBar, FaExclamationTriangle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/enviroments";

// Formata valores para o padrão brasileiro
const formatCurrency = (value) => {
  return parseFloat(value).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Tradução das categorias vindas do backend
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

  // Estados de carregamento e erro
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dados financeiros calculados localmente
  const [dashboardData, setDashboardData] = useState({
    total_arrecadado: 0,
    total_gasto: 0,
    saldo_disponivel: 0,
    gastos_por_categoria: [],
  });

  // Token salvo após login
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAndAggregateData = async () => {
      // Se não tiver token, manda para login
      if (!token) {
        navigate("/member-login");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Decodifica o token para pegar o publicId do usuário
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.publicId;

        // Busca os dados do membro logado
        const memberResponse = await fetch(
          `${API_BASE_URL}/members/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!memberResponse.ok) {
          throw new Error("Falha ao obter ID da organização.");
        }

        const memberData = await memberResponse.json();
        const organizationId = memberData.organization_id;

        if (!organizationId) {
          throw new Error("Membro não associado a uma organização ativa.");
        }

        // Busca doações e projetos ao mesmo tempo
        const [donationsData, projectsData] = await Promise.all([
          fetch(`${API_BASE_URL}/donations/`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }).then((res) => res.json()),

          fetch(`${API_BASE_URL}/organizations/${organizationId}/projects`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }).then((res) => res.json()),
        ]);

        // Filtra apenas as doações da organização do membro
        const donationsDataFiltred = Array.isArray(donationsData)
          ? donationsData.filter((d) => d.organization_id === organizationId)
          : [];

        // Soma apenas as doações confirmadas
        const totalArrecadado = donationsDataFiltred.reduce((sum, d) => {
          return d.status === "CONFIRMED" ? sum + parseFloat(d.value) : sum;
        }, 0);

        let totalGasto = 0;
        const expenseBreakdown = {};

        // Busca despesas de todos os projetos da organização
        if (Array.isArray(projectsData)) {
          const expensePromises = projectsData.map((project) =>
            fetch(`${API_BASE_URL}/projects/${project.public_id}/expenses`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
              .then((res) => (res.ok ? res.json() : []))
              .catch(() => [])
          );

          const allExpensesArrays = await Promise.all(expensePromises);
          const allExpenses = allExpensesArrays.flat();

          // Soma apenas despesas aprovadas ou pagas
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

        // Saldo final estimado
        const saldoDisponivel = totalArrecadado - totalGasto;

        // Transforma o objeto de categorias em lista ordenada
        const gastosPorCategoria = Object.entries(expenseBreakdown)
          .map(([category, value]) => ({
            nome: CATEGORY_LABELS[category] || category,
            valor: value,
          }))
          .sort((a, b) => b.valor - a.valor);

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
  }, [navigate, token]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-green-100 via-teal-50 to-white">
      {/* Cabeçalho */}
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
            {/* Cards de resumo financeiro */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {/* Total arrecadado */}
              <div className="bg-white shadow rounded-xl p-6 border border-teal-100">
                <h2 className="text-lg font-semibold mb-2 text-gray-700">
                  Total Arrecadado (Confirmado)
                </h2>

                <p className="text-3xl font-bold text-green-600">
                  R$ {formatCurrency(dashboardData.total_arrecadado)}
                </p>
              </div>

              {/* Total gasto */}
              <div className="bg-white shadow rounded-xl p-6 border border-teal-100">
                <h2 className="text-lg font-semibold mb-2 text-gray-700">
                  Total Gasto (Despesas)
                </h2>

                <p className="text-3xl font-bold text-red-600">
                  R$ {formatCurrency(dashboardData.total_gasto)}
                </p>
              </div>

              {/* Saldo disponível com alerta se estiver negativo */}
              <div
                className={`shadow rounded-xl p-6 border ${
                  dashboardData.saldo_disponivel >= 0
                    ? "bg-white border-teal-100"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <h2 className="text-lg font-semibold mb-2 text-gray-700">
                  Saldo Disponível (Est.)
                </h2>

                <div className="flex items-center gap-2">
                  <p
                    className={`text-3xl font-bold ${
                      dashboardData.saldo_disponivel >= 0
                        ? "text-blue-600"
                        : "text-red-600"
                    }`}
                  >
                    R$ {formatCurrency(dashboardData.saldo_disponivel)}
                  </p>

                  {/* Ícone de alerta quando o saldo está negativo */}
                  {dashboardData.saldo_disponivel < 0 && (
                    <FaExclamationTriangle
                      className="text-red-600 text-xl"
                      title="Saldo negativo!"
                    />
                  )}
                </div>

                {/* Mensagem de déficit exibida apenas com saldo negativo */}
                {dashboardData.saldo_disponivel < 0 && (
                  <p className="text-sm text-red-600 font-semibold mt-2">
                    ⚠️ Déficit de R${" "}
                    {formatCurrency(Math.abs(dashboardData.saldo_disponivel))}
                  </p>
                )}
              </div>
            </div>

            {/* Distribuição de gastos por categoria */}
            {dashboardData.gastos_por_categoria.length > 0 && (
              <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-teal-100">
                <h2 className="text-xl font-semibold text-sky-800 mb-6 flex items-center gap-2">
                  <FaChartBar /> Distribuição de Gastos por Categoria
                </h2>

                <ul className="space-y-3">
                  {dashboardData.gastos_por_categoria.map((g, i) => {
                    const percentage =
                      dashboardData.total_gasto > 0
                        ? (g.valor / dashboardData.total_gasto) * 100
                        : 0;

                    return (
                      <li key={i} className="py-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-gray-700">
                            {g.nome}
                          </span>

                          <span className="font-semibold text-teal-700">
                            R$ {formatCurrency(g.valor)}
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
