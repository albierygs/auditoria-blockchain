// src/componentes/Alocacao.jsx
import { useEffect, useState } from "react";
import { FaArrowLeft, FaSitemap } from "react-icons/fa"; // Ícones
import { useNavigate } from "react-router-dom"; // Navegação
import { API_BASE_URL } from "../config/enviroments";

// Funções auxiliares para formatação
const formatValue = (value) => {
  // Garante que o valor seja um número e formata para R$ com 2 casas decimais
  return `R$ ${parseFloat(value).toFixed(2).replace(".", ",")}`;
};

const formatDate = (dateString) => {
  // Formata a data para padrão brasileiro (com hora)
  return new Date(dateString).toLocaleString("pt-BR");
};

export default function Alocacao() {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    carregarAllocacoes();
  }, []);

  const carregarAllocacoes = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Token de autenticação não encontrado. Faça login novamente.");
      setLoading(false);
      return;
    }

    try {
      // Requisição GET para /api/allocations
      const response = await fetch(`${API_BASE_URL}/allocations`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Falha ao buscar alocações (Status: ${response.status})`
        );
      }

      const data = await response.json();

      const lista = Array.isArray(data) ? data : [];
      setAllocations(lista);
    } catch (error) {
      console.error("Erro ao carregar alocações:", error);
      setError(error.message || "Erro ao conectar ao servidor.");
      setAllocations([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    // NOVO LAYOUT: Fundo gradiente
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-white">
      {/* NOVO LAYOUT: Cabeçalho fixo com botão de voltar */}
      <header className="backdrop-blur-md bg-white/70 shadow-md border-b border-cyan-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")} // Botão Voltar para a Dashboard
            className="text-cyan-600 hover:text-cyan-700 transition-colors"
          >
            <FaArrowLeft className="text-2xl" />
          </button>
          <div className="flex items-center gap-3">
            <FaSitemap className="text-sky-800 text-2xl" />
            <h1 className="text-2xl font-bold text-sky-800 tracking-tight">
              Histórico de Alocações
            </h1>
          </div>
        </div>
      </header>

      {/* NOVO LAYOUT: Conteúdo principal centralizado com max-width */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <p className="text-gray-700 mb-6">
          Acompanhe a destinação dos recursos das doações para os projetos.
        </p>

        {/* BOX: Alocações Registradas */}
        <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-cyan-100">
          <h2 className="text-xl font-semibold text-sky-800 mb-6">
            Alocações Registradas
          </h2>

          {loading ? (
            <p className="text-gray-600">Carregando alocações...</p>
          ) : error ? (
            <p className="text-red-500">Erro: {error}</p>
          ) : allocations.length === 0 ? (
            <p className="text-gray-600">Nenhuma alocação encontrada.</p>
          ) : (
            <div className="space-y-4">
              {allocations.map((a, index) => {
                // Extraindo dados aninhados
                const organizationName = a.organization?.name || "N/A";
                const projectName = a.project?.title || "Projeto Desconhecido";
                const donationValue = a.donation?.value || 0;
                const donorName =
                  a.donation?.donor?.person?.name || "Doador Anônimo";

                return (
                  <div
                    key={a.public_id ?? a.id ?? index}
                    className="border border-cyan-100 p-4 rounded-lg shadow-sm bg-white hover:shadow-md transition"
                  >
                    <p className="text-lg font-semibold text-sky-800 mb-1">
                      Alocado para: {projectName}
                    </p>

                    <div className="grid grid-cols-2 text-sm gap-y-1">
                      <p>
                        <strong>Valor Alocado:</strong>{" "}
                        <span className="font-medium text-green-600">
                          {formatValue(a.amount_allocated)}
                        </span>
                      </p>
                      <p>
                        <strong>Organização:</strong> {organizationName}
                      </p>
                      <p>
                        <strong>Doação (Valor Total):</strong>{" "}
                        {formatValue(donationValue)}
                      </p>
                      <p>
                        <strong>Doador:</strong> {donorName}
                      </p>
                      <p className="col-span-2 text-xs text-gray-500 mt-2">
                        Data de Alocação:{" "}
                        {a.allocation_date
                          ? formatDate(a.allocation_date)
                          : "—"}
                      </p>
                    </div>
                    {a.blockchain_transaction && (
                      <p className="text-xs text-cyan-600 font-mono mt-2">
                        Hash: {a.blockchain_transaction.hash.substring(0, 10)}
                        ...
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
