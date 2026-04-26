// src/componentes/VoluntariadoDashboard.jsx
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaCheck,
  FaClock,
  FaHandHoldingHeart,
  FaTimes,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/enviroments";

// Funções auxiliares
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("pt-BR");
};

export default function VoluntariadoDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);
  const [organizationId, setOrganizationId] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const token = localStorage.getItem("token");

  // --- 1. Carregamento Inicial ---
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!token) {
        navigate("/member-login");
        return;
      }

      try {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.publicId;
        setUserRole(decodedToken.memberRole);

        const memberResponse = await fetch(
          `${API_BASE_URL}/members/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!memberResponse.ok)
          throw new Error("Falha ao obter dados do membro.");

        const memberData = await memberResponse.json();
        const orgId = memberData.organization_id;

        if (!orgId)
          throw new Error("Membro não associado a uma organização ativa.");

        setOrganizationId(orgId);

        await fetchLogs(orgId);
      } catch (err) {
        console.error("Erro inicial:", err);
        setError(err.message || "Erro ao carregar dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, token]);

  const fetchLogs = async (orgId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/organizations/${orgId}/volunteer-logs`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Falha ao carregar logs de voluntariado."
        );
      }

      const data = await response.json();
      setLogs(Array.isArray(data.logs) ? data.logs : []);
    } catch (err) {
      console.error("Erro ao buscar logs:", err);
      setError(err.message);
    }
  };

  const handleApprove = async (memberId, logId) => {
    if (!window.confirm("Confirmar aprovação das horas?")) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/members/${memberId}/volunteer-logs/${logId}/approve`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Erro ao aprovar horas.");

      alert("Horas aprovadas com sucesso!");
      fetchLogs(organizationId);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReject = async (memberId, logId) => {
    const reason = prompt("Motivo da rejeição:");
    if (!reason) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/members/${memberId}/volunteer-logs/${logId}/reject`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason }),
        }
      );

      if (!response.ok) throw new Error("Erro ao rejeitar horas.");

      alert("Horas rejeitadas.");
      fetchLogs(organizationId);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-teal-50 to-white">
        <p className="text-teal-800 font-semibold">
          Carregando voluntariado...
        </p>
      </div>
    );
  }

  // Define se deve mostrar a coluna de ações (Apenas ORG_ADMIN vê)
  const showActionsColumn = userRole === "ORG_ADMIN";

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-green-100 via-teal-50 to-white">
      <header className="backdrop-blur-md bg-white/80 shadow-md border-b border-teal-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/member-dashboard")}
            className="text-teal-600 hover:text-teal-700 transition-colors"
          >
            <FaArrowLeft className="text-2xl" />
          </button>
          <div className="flex items-center gap-3">
            <FaHandHoldingHeart className="text-teal-800 text-2xl" />
            <h1 className="text-2xl font-bold text-teal-800 tracking-tight">
              Gestão de Voluntariado
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-teal-100">
            <h3 className="text-gray-500 text-sm font-medium">
              Logs Pendentes
            </h3>
            <p className="text-2xl font-bold text-yellow-600">
              {logs.filter((l) => l.status === "PENDING").length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-teal-100">
            <h3 className="text-gray-500 text-sm font-medium">
              Horas Aprovadas (Total)
            </h3>
            <p className="text-2xl font-bold text-green-600">
              {logs
                .filter((l) => l.status === "APPROVED")
                .reduce((acc, curr) => acc + parseFloat(curr.hours_worked), 0)
                .toFixed(1)}{" "}
              h
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-teal-100">
            <h3 className="text-gray-500 text-sm font-medium">
              Total de Registros
            </h3>
            <p className="text-2xl font-bold text-teal-800">{logs.length}</p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-teal-100">
          <h2 className="text-xl font-semibold text-sky-800 mb-6 flex items-center gap-2">
            <FaClock /> Registro de Horas
          </h2>

          {error ? (
            <p className="text-red-500">{error}</p>
          ) : logs.length === 0 ? (
            <p className="text-gray-600 italic">
              Nenhum registro de horas encontrado.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm bg-white rounded-lg overflow-hidden border border-teal-100">
                <thead className="bg-teal-50 border-b border-teal-100 text-teal-800 uppercase">
                  <tr>
                    <th className="py-3 px-4">Voluntário</th>
                    <th className="py-3 px-4">Projeto</th>
                    <th className="py-3 px-4">Data</th>
                    <th className="py-3 px-4 text-center">Horas</th>
                    <th className="py-3 px-4">Descrição</th>
                    <th className="py-3 px-4">Status</th>
                    {/* Renderização Condicional do Cabeçalho da Coluna */}
                    {showActionsColumn && (
                      <th className="py-3 px-4 text-center">Ações</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((log) => (
                    <tr
                      key={log.public_id}
                      className="hover:bg-teal-50/30 transition"
                    >
                      <td className="py-3 px-4 font-medium text-gray-800">
                        {log.volunteer?.person?.name || "Desconhecido"}
                        <div className="text-xs text-gray-500">
                          {log.volunteer?.person?.email}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {log.project?.title || "Geral / Não atribuído"}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {formatDate(log.date)}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-teal-700">
                        {log.hours_worked}h
                      </td>
                      <td
                        className="py-3 px-4 text-gray-600 truncate max-w-xs"
                        title={log.description}
                      >
                        {log.description || "—"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-semibold ${
                            log.status === "APPROVED"
                              ? "bg-green-100 text-green-700"
                              : log.status === "REJECTED"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {log.status === "PENDING"
                            ? "PENDENTE"
                            : log.status === "APPROVED"
                              ? "APROVADO"
                              : "REJEITADO"}
                        </span>
                      </td>

                      {/* Renderização Condicional da Célula de Ações */}
                      {showActionsColumn && (
                        <td className="py-3 px-4 text-center">
                          {log.status === "PENDING" && (
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() =>
                                  handleApprove(
                                    log.volunteer.public_id,
                                    log.public_id
                                  )
                                }
                                className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition"
                                title="Aprovar"
                              >
                                <FaCheck size={14} />
                              </button>
                              <button
                                onClick={() =>
                                  handleReject(
                                    log.volunteer.public_id,
                                    log.public_id
                                  )
                                }
                                className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition"
                                title="Rejeitar"
                              >
                                <FaTimes size={14} />
                              </button>
                            </div>
                          )}
                          {log.status !== "PENDING" && (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                      )}
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
