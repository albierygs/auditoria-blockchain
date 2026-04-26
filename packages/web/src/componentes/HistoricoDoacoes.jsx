// src/componentes/HistoricoDoacoes.jsx
import { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa"; // Novo import para o ícone
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/enviroments";

// Funções auxiliares para formatação
const formatValue = (value) => {
  // Garantir que o valor seja um número e formatar
  return `R$ ${parseFloat(value).toFixed(2).replace(".", ",")}`;
};

const formatDate = (dateString) => {
  // Formatar data para padrão brasileiro
  return new Date(dateString).toLocaleDateString("pt-BR");
};

export default function HistoricoDoacoes() {
  const [doacoes, setDoacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const navigate = useNavigate();

  const carregarDoacoes = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error(
          "Token de autenticação não encontrado. Faça login novamente."
        );
      }

      // Endpoint para listar doações do doador logado
      const response = await fetch(`${API_BASE_URL}/donations/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Falha ao carregar as doações (Status: ${response.status})`
        );
      }

      const data = await response.json();
      setDoacoes(data);
    } catch (err) {
      console.error("Erro ao buscar doações:", err);
      setErro(err.message || "Erro ao carregar o histórico de doações.");
      setDoacoes([]);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDoacoes();
  }, []);

  return (
    // 1. Fundo Gradiente e Layout de Tela Cheia
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-white">
      {/* 2. Cabeçalho Fixo com Botão de Voltar para a Dashboard */}
      <header className="backdrop-blur-md bg-white/70 shadow-md border-b border-cyan-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")} // Botão Voltar para a Dashboard
            className="text-cyan-600 hover:text-cyan-700 transition-colors"
          >
            <FaArrowLeft className="text-2xl" />
          </button>
          <h1 className="text-2xl font-bold text-sky-800 tracking-tight">
            Seu Histórico de Doações
          </h1>
        </div>
      </header>

      {/* 3. Conteúdo Principal Centralizado com Box Estilizado */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-cyan-100">
          <h2 className="text-xl font-semibold text-sky-800 mb-6">
            Todas as suas contribuições registradas 📊
          </h2>

          {/* Área de Status e Tabela */}
          {carregando ? (
            <p className="text-gray-600">Carregando histórico...</p>
          ) : erro ? (
            <div className="text-center p-4">
              <p className="text-red-500">Erro: {erro}</p>
              <button
                onClick={carregarDoacoes}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                Tentar Novamente
              </button>
            </div>
          ) : doacoes.length === 0 ? (
            <p className="text-gray-600">
              Nenhuma doação encontrada para sua conta.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm bg-white rounded-lg overflow-hidden border border-gray-200">
                <thead>
                  <tr className="bg-gray-100 border-b text-gray-700 uppercase tracking-wider">
                    <th className="py-3 px-4 font-semibold">ID (início)</th>
                    <th className="py-3 px-4 font-semibold">Organização</th>
                    <th className="py-3 px-4 font-semibold text-right">
                      Valor
                    </th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Data</th>
                    <th className="py-3 px-4 font-semibold text-center">
                      Ação
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {doacoes.map((d) => (
                    <tr
                      key={d.public_id}
                      className="hover:bg-cyan-50 transition duration-150 ease-in-out"
                    >
                      <td className="py-3 px-4 text-gray-800 font-mono text-xs">
                        {d.public_id.substring(0, 8)}...
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {d.organization?.name ?? "—"}
                      </td>
                      <td className="py-3 px-4 text-gray-800 font-medium text-right">
                        {formatValue(d.value)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            d.status === "CONFIRMED"
                              ? "bg-green-100 text-green-700"
                              : d.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {d.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {formatDate(d.date)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          // Mantém a funcionalidade de ir para DetalhesDoacoes
                          onClick={() =>
                            navigate(`/detalhes-doacoes/${d.public_id}`)
                          }
                          className="px-4 py-1 bg-cyan-600 text-white rounded-md text-xs font-medium shadow-sm hover:bg-cyan-700 transition-colors"
                        >
                          Detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
