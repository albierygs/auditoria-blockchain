// src/componentes/StatusHistory.jsx
import { useEffect, useState } from "react";
import { FaArrowLeft, FaFilter, FaHistory, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/enviroments";

// Formatação de data
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString("pt-BR");
};

// Tipos de entidades para filtro
const ENTITY_TYPES = [
  { value: "DONATION", label: "Doação" },
  { value: "PROJECT", label: "Projeto" },
  { value: "EXPENSE", label: "Despesa" },
  { value: "ALLOCATION", label: "Alocação" },
  { value: "VOLUNTEER_LOG", label: "Log de Voluntário" },
  { value: "MEMBERSHIP", label: "Membresia" },
  { value: "PERSON", label: "Pessoa/Usuário" },
];

export default function StatusHistory() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros
  const [filters, setFilters] = useState({
    entityType: "",
    entityId: "",
    startDate: "",
    endDate: "",
  });

  const token = localStorage.getItem("token");

  // --- BUSCA DE DADOS ---
  const fetchHistory = async () => {
    setLoading(true);
    setError(null);

    if (!token) {
      navigate("/member-login");
      return;
    }

    try {
      // Construção da Query String
      const params = new URLSearchParams();
      if (filters.entityType) params.append("entityType", filters.entityType);
      if (filters.entityId) params.append("entityId", filters.entityId);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      // Endpoint: GET /api/status-history
      const response = await fetch(
        `${API_BASE_URL}/status-history?${params.toString()}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao carregar histórico.");
      }

      const data = await response.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao buscar histórico:", err);
      setError(err.message);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  // Carrega ao montar e ao aplicar filtros manualmente
  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchHistory();
  };

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
            <FaHistory className="text-teal-800 text-2xl" />
            <h1 className="text-2xl font-bold text-teal-800 tracking-tight">
              Histórico de Alterações de Status
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Painel de Filtros */}
        <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-xl p-6 border border-teal-100 mb-8">
          <h2 className="text-lg font-semibold text-sky-800 mb-4 flex items-center gap-2">
            <FaFilter /> Filtros de Busca
          </h2>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end"
          >
            {/* Tipo de Entidade */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Tipo
              </label>
              <select
                name="entityType"
                className="w-full p-2 border rounded bg-white"
                value={filters.entityType}
                onChange={handleFilterChange}
              >
                <option value="">Todos</option>
                {ENTITY_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* ID da Entidade */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                ID (Opcional)
              </label>
              <input
                type="text"
                name="entityId"
                placeholder="UUID da entidade"
                className="w-full p-2 border rounded"
                value={filters.entityId}
                onChange={handleFilterChange}
              />
            </div>

            {/* Data Início */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                De
              </label>
              <input
                type="date"
                name="startDate"
                className="w-full p-2 border rounded"
                value={filters.startDate}
                onChange={handleFilterChange}
              />
            </div>

            {/* Data Fim */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Até
              </label>
              <input
                type="date"
                name="endDate"
                className="w-full p-2 border rounded"
                value={filters.endDate}
                onChange={handleFilterChange}
              />
            </div>

            {/* Botão Buscar */}
            <button
              type="submit"
              className="bg-teal-600 text-white px-4 py-2 rounded shadow hover:bg-teal-700 transition flex items-center justify-center gap-2 h-[42px]"
            >
              <FaSearch /> Buscar
            </button>
          </form>
        </div>

        {/* Tabela de Resultados */}
        <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-teal-100">
          {loading ? (
            <p className="text-gray-600 text-center py-4">
              Carregando histórico...
            </p>
          ) : error ? (
            <p className="text-red-500 text-center py-4">{error}</p>
          ) : history.length === 0 ? (
            <p className="text-gray-600 text-center py-4 italic">
              Nenhum registro encontrado com os filtros selecionados.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm bg-white rounded-lg overflow-hidden border border-teal-100">
                <thead className="bg-teal-50 border-b border-teal-100 text-teal-800 uppercase">
                  <tr>
                    <th className="py-3 px-4">Entidade</th>
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4 text-center">Status Anterior</th>
                    <th className="py-3 px-4 text-center">Novo Status</th>
                    <th className="py-3 px-4">Motivo / Detalhes</th>
                    <th className="py-3 px-4">Alterado Por</th>
                    <th className="py-3 px-4">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.map((h) => (
                    <tr
                      key={h.public_id}
                      className="hover:bg-teal-50/30 transition"
                    >
                      <td className="py-3 px-4 font-bold text-gray-700">
                        {h.entity_type}
                      </td>
                      <td
                        className="py-3 px-4 font-mono text-xs text-gray-500"
                        title={h.entity_id}
                      >
                        {h.entity_id.substring(0, 8)}...
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          {h.old_status || "—"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                          {h.new_status}
                        </span>
                      </td>
                      <td
                        className="py-3 px-4 text-gray-600 max-w-xs truncate"
                        title={h.reason}
                      >
                        {h.reason || "—"}
                      </td>
                      <td className="py-3 px-4 text-gray-700 text-xs">
                        {h.chaged_by?.name || "Sistema"}
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-xs whitespace-nowrap">
                        {formatDate(h.changed_at)}
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
