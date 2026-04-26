// src/componentes/VoluntariadoHoras.jsx
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaClock, FaHistory, FaPlusCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/enviroments";

// Função auxiliar para formatar data
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function VoluntariadoHoras() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [projects, setProjects] = useState([]);
  const [logs, setLogs] = useState([]);
  const [memberId, setMemberId] = useState(null);

  const [form, setForm] = useState({
    project_id: "",
    hours_worked: "",
    description: "",
  });

  const token = localStorage.getItem("token");

  // --- 1. Carregamento Inicial de Dados ---
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!token) {
        navigate("/member-login");
        return;
      }

      try {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.publicId;
        setMemberId(userId);

        // 1. Obter ID da Organização do Membro (para buscar projetos)
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

        // 2. Carregar Projetos da Organização
        const projectsResponse = await fetch(
          `${API_BASE_URL}/organizations/${orgId}/projects`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!projectsResponse.ok) console.warn("Falha ao carregar projetos.");
        const projectsData = await projectsResponse.json();
        setProjects(
          Array.isArray(projectsData)
            ? projectsData.filter((p) => p.status === "ACTIVE")
            : []
        );

        // 3. Carregar Histórico de Horas do Membro
        await fetchLogs(userId);
      } catch (err) {
        console.error("Erro inicial:", err);
        setError(err.message || "Erro ao carregar dados.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, token]);

  // Função para buscar logs do membro
  const fetchLogs = async (id) => {
    try {
      // Endpoint: GET /api/members/:memberId/volunteer-logs/
      const response = await fetch(
        `${API_BASE_URL}/members/${id}/volunteer-logs`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error("Falha ao carregar histórico.");

      const data = await response.json();
      console.log(data);
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao buscar logs:", err);
    }
  };

  // --- 2. Envio do Formulário ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!memberId) return;

    const hours = Number(form.hours_worked);
    if (hours <= 0) {
      alert("Por favor, insira uma quantidade de horas válida.");
      return;
    }

    try {
      const payload = {
        project_id: form.project_id || null, // Pode ser null se for atividade geral
        hours_worked: hours,
        description: form.description,
      };

      // Endpoint: POST /api/members/:memberId/volunteer-logs/
      const response = await fetch(
        `${API_BASE_URL}/members/${memberId}/volunteer-logs`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao registrar horas.");
      }

      alert("Horas registradas com sucesso! Aguardando aprovação.");

      // Limpa form e recarrega lista
      setForm({ project_id: "", hours_worked: "", description: "" });
      fetchLogs(memberId);
    } catch (err) {
      alert("Erro: " + err.message);
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-teal-50 to-white">
        <p className="text-teal-800 font-semibold">
          Carregando painel do voluntário...
        </p>
      </div>
    );
  }

  return (
    // LAYOUT DE MEMBRO: Fundo Verde/Teal
    <div className="w-full min-h-screen bg-gradient-to-br from-green-100 via-teal-50 to-white">
      {/* Cabeçalho Fixo */}
      <header className="backdrop-blur-md bg-white/80 shadow-md border-b border-teal-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/member-dashboard")}
            className="text-teal-600 hover:text-teal-700 transition-colors"
          >
            <FaArrowLeft className="text-2xl" />
          </button>
          <div className="flex items-center gap-3">
            <FaClock className="text-teal-800 text-2xl" />
            <h1 className="text-2xl font-bold text-teal-800 tracking-tight">
              Minhas Horas de Voluntariado
            </h1>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {error && <p className="text-red-500 mb-6 font-medium">{error}</p>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* COLUNA 1: Formulário de Registro */}
          <div className="lg:col-span-1 bg-white/80 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-teal-100 h-fit">
            <h2 className="text-xl font-semibold text-sky-800 mb-6 flex items-center gap-2">
              <FaPlusCircle /> Registrar Atividade
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Seletor de Projeto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Projeto
                </label>
                <select
                  name="project_id"
                  className="w-full p-3 border border-teal-200 rounded-lg bg-white focus:ring-2 focus:ring-teal-400 focus:outline-none"
                  value={form.project_id}
                  onChange={handleChange}
                >
                  <option value="">-- Atividade Geral / Sem Projeto --</option>
                  {projects.map((p) => (
                    <option key={p.public_id} value={p.public_id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Horas Trabalhadas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Horas Trabalhadas
                </label>
                <input
                  type="number"
                  name="hours_worked"
                  placeholder="Ex: 4.5"
                  step="0.5"
                  min="0.5"
                  className="w-full p-3 border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-400 focus:outline-none"
                  value={form.hours_worked}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição das Atividades
                </label>
                <textarea
                  name="description"
                  placeholder="Descreva o que foi realizado..."
                  rows="4"
                  className="w-full p-3 border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-400 focus:outline-none"
                  value={form.description}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-500 to-green-600 text-white py-3 rounded-md font-semibold shadow-md hover:from-teal-600 hover:to-green-700 transition-all duration-300"
              >
                Registrar Horas
              </button>
            </form>
          </div>

          {/* COLUNA 2: Histórico de Logs */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-teal-100">
            <h2 className="text-xl font-semibold text-sky-800 mb-6 flex items-center gap-2">
              <FaHistory /> Histórico de Registros
            </h2>

            {logs.length === 0 ? (
              <p className="text-gray-600 italic">
                Você ainda não registrou nenhuma hora.
              </p>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => (
                  <div
                    key={log.public_id}
                    className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 transition hover:shadow-md"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-teal-900">
                          {log.project ? log.project.title : "Atividade Geral"}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {log.description || "Sem descrição."}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          Registrado em: {formatDate(log.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="block text-2xl font-bold text-teal-600">
                          {log.hours_worked}h
                        </span>
                        <span
                          className={`inline-block mt-1 px-2 py-1 text-xs rounded-full font-semibold ${
                            log.status === "APPROVED"
                              ? "bg-green-100 text-green-700"
                              : log.status === "REJECTED"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {log.status === "APPROVED"
                            ? "Aprovado"
                            : log.status === "REJECTED"
                              ? "Rejeitado"
                              : "Pendente"}
                        </span>
                      </div>
                    </div>

                    {log.status === "APPROVED" && log.approved_by && (
                      <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                        Aprovado por:{" "}
                        <strong>{log.approved_by.person.name}</strong>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
