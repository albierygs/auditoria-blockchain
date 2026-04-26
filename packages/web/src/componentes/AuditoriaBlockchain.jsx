// src/componentes/AuditoriaBlockchain.jsx
import { useEffect, useState } from "react";
import { FaArrowLeft, FaShieldAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/enviroments";

// Funções auxiliares para formatação e manipulação de datas

const formatValue = (value) => {
  if (value === null || value === undefined) return "R$ —";
  // Formata o valor como moeda BRL
  return `R$ ${parseFloat(value).toFixed(2).replace(".", ",")}`;
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) return "—";
  // Formata a data e hora para padrão brasileiro
  return new Date(timestamp).toLocaleString("pt-BR");
};

// Converte a data para um timestamp para comparação
const dateToTimestamp = (dateString) => {
  if (!dateString) return null;
  return new Date(dateString).getTime();
};

const AuditoriaBlockchain = () => {
  const navigate = useNavigate();
  // allTransactions guarda a lista completa de transações recebida da API
  const [allTransactions, setAllTransactions] = useState([]);
  // transactions é a lista filtrada que será exibida
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filtros, setFiltros] = useState({
    type: "",
    status: "",
    startDate: "",
    endDate: "",
    network: "",
  });

  const token = localStorage.getItem("token");

  // --- FUNÇÃO PARA APLICAR FILTROS LOCALMENTE ---
  const aplicarFiltrosLocalmente = (data, filters) => {
    let filtered = data;

    if (filters.type) {
      filtered = filtered.filter((t) => t.type === filters.type);
    }
    if (filters.status) {
      filtered = filtered.filter((t) => t.status === filters.status);
    }
    if (filters.network) {
      // Filtragem parcial por rede, insensível a maiúsculas/minúsculas
      filtered = filtered.filter((t) =>
        t.network.toLowerCase().includes(filters.network.toLowerCase())
      );
    }

    // Filtragem por datas
    const startTime = dateToTimestamp(filters.startDate);
    // Adiciona 23:59:59.999 ao endDate para incluir o dia inteiro no filtro
    const endTime = filters.endDate
      ? dateToTimestamp(filters.endDate) + 86399999
      : null;

    if (startTime || endTime) {
      filtered = filtered.filter((t) => {
        if (!t.timestamp) return false;
        const tTime = new Date(t.timestamp).getTime();

        const isAfterStart = startTime ? tTime >= startTime : true;
        const isBeforeEnd = endTime ? tTime <= endTime : true;

        return isAfterStart && isBeforeEnd;
      });
    }

    setTransactions(filtered);
  };

  // --- FUNÇÃO PARA CARREGAR DADOS INICIAIS DA API ---
  const carregarDadosIniciais = async () => {
    if (!token) {
      navigate("/member-login");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Endpoint: GET /blockchain (Sem filtros na URL para carregar todos os dados)
      const response = await fetch(`${API_BASE_URL}/blockchain`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao carregar transações.");
      }

      const data = await response.json();
      const transactionsArray = Array.isArray(data) ? data : [];

      setAllTransactions(transactionsArray);

      // Aplica os filtros iniciais (vazios) na lista completa para exibi-la
      aplicarFiltrosLocalmente(transactionsArray, filtros);
    } catch (err) {
      console.error("Erro ao carregar transações blockchain:", err);
      setError(err.message || "Erro desconhecido ao carregar transações.");
      setAllTransactions([]);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDadosIniciais();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handler para mudança nos campos do formulário
  const handle = (e) =>
    setFiltros({ ...filtros, [e.target.name]: e.target.value });

  // Handler para aplicar filtros (agora localmente)
  const aplicar = (e) => {
    e.preventDefault();
    aplicarFiltrosLocalmente(allTransactions, filtros);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-700";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      case "FAILED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

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
            <FaShieldAlt className="text-teal-800 text-2xl" />
            <h1 className="text-2xl font-bold text-teal-800 tracking-tight">
              Auditoria Blockchain e Transparência
            </h1>
          </div>
        </div>
      </header>

      {/* NOVO LAYOUT: Conteúdo principal centralizado */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Formulário de Filtros */}
        <form
          onSubmit={aplicar}
          className="bg-white/80 backdrop-blur-lg shadow-xl rounded-xl p-6 border border-teal-100 mb-8 grid grid-cols-1 md:grid-cols-5 gap-4"
        >
          <select
            name="type"
            className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-teal-400 bg-white/80"
            value={filtros.type}
            onChange={handle}
          >
            <option value="">Tipo (Todos)</option>
            <option value="DONATION">Doação</option>
            <option value="ALLOCATION">Alocação</option>
          </select>

          <select
            name="status"
            className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-teal-400 bg-white/80"
            value={filtros.status}
            onChange={handle}
          >
            <option value="">Status (Todos)</option>
            <option value="PENDING">Pendente</option>
            <option value="CONFIRMED">Confirmada</option>
            <option value="FAILED">Falha</option>
          </select>

          <input
            name="network"
            placeholder="Rede (ex: ETHEREUM_TESTNET)"
            className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-teal-400 bg-white/80"
            value={filtros.network}
            onChange={handle}
          />

          <input
            type="date"
            name="startDate"
            className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-teal-400 bg-white/80"
            value={filtros.startDate}
            onChange={handle}
            placeholder="Data Inicial"
          />

          <input
            type="date"
            name="endDate"
            className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-teal-400 bg-white/80"
            value={filtros.endDate}
            onChange={handle}
            placeholder="Data Final"
          />

          <div className="md:col-span-5 flex justify-end">
            <button className="bg-teal-600 text-white px-6 py-2 rounded-md font-semibold shadow-md hover:bg-teal-700 transition">
              Aplicar filtros
            </button>
          </div>
        </form>

        {/* Tabela de Resultados */}
        <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-teal-100">
          {loading ? (
            <p className="text-gray-600">Carregando transações...</p>
          ) : error ? (
            <p className="text-red-500 font-semibold">Erro: {error}</p>
          ) : transactions.length === 0 ? (
            <p className="text-gray-600">
              Nenhuma transação encontrada com os filtros aplicados.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm bg-white rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-100 border-b text-gray-700 uppercase tracking-wider">
                    <th className="py-3 px-3">Hash (início)</th>
                    <th className="py-3 px-3">Tipo</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Rede</th>
                    <th className="py-3 px-3 text-right">Valor</th>
                    <th className="py-3 px-3">Data</th>
                    <th className="py-3 px-3">Referência</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.map((t, i) => (
                    <tr
                      key={t.public_id ?? t.id ?? i}
                      className="hover:bg-teal-50 transition duration-150"
                    >
                      <td className="py-2 px-3 break-all text-xs font-mono">
                        {t.hash.substring(0, 15)}...
                      </td>
                      <td className="py-2 px-3 font-medium text-gray-800">
                        {t.type}
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(
                            t.status
                          )}`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-gray-600">{t.network}</td>
                      <td className="py-2 px-3 text-right font-medium">
                        {formatValue(t.value)}
                      </td>
                      <td className="py-2 px-3 text-gray-600">
                        {formatTimestamp(t.timestamp)}
                      </td>
                      <td className="py-2 px-3 text-xs text-gray-500">
                        {t.donation_id
                          ? `DOAÇÃO: ${t.donation_id.substring(0, 8)}...`
                          : t.allocation_id
                            ? `ALOC: ${t.allocation_id.substring(0, 8)}...`
                            : "—"}
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
};

export default AuditoriaBlockchain;
