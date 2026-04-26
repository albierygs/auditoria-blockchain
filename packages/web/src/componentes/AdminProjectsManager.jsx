// src/componentes/AdminProjectsManager.jsx
import { useEffect, useState } from "react";
import { FaArrowLeft, FaBuilding, FaTasks } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/enviroments";

const formatCurrency = (value) => {
  return parseFloat(value).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export default function AdminProjectsManager() {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [projects, setProjects] = useState([]);

  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  // 1. Carregar Lista de Organizações ao montar
  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        // Endpoint: GET /organizations (Lista todas)
        const response = await fetch(`${API_BASE_URL}/organizations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Falha ao listar organizações.");
        const data = await response.json();
        setOrganizations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingOrgs(false);
      }
    };
    fetchOrgs();
  }, [token]);

  // 2. Carregar Projetos quando uma organização é selecionada
  useEffect(() => {
    if (!selectedOrgId) {
      setProjects([]);
      return;
    }

    const fetchProjects = async () => {
      setLoadingProjects(true);
      try {
        // Endpoint: GET /organizations/:id/projects
        const response = await fetch(
          `${API_BASE_URL}/organizations/${selectedOrgId}/projects`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok)
          throw new Error("Falha ao carregar projetos da organização.");
        const data = await response.json();
        setProjects(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        alert("Erro ao buscar projetos.");
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, [selectedOrgId, token]);

  return (
    // LAYOUT ADMIN: Fundo Vermelho
    <div className="w-full min-h-screen bg-gradient-to-br from-red-100 via-pink-50 to-white">
      {/* Cabeçalho Admin */}
      <header className="backdrop-blur-md bg-white/80 shadow-md border-b border-red-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/admin-dashboard")}
            className="text-red-600 hover:text-red-700 transition-colors"
          >
            <FaArrowLeft className="text-2xl" />
          </button>
          <div className="flex items-center gap-3">
            <FaTasks className="text-red-800 text-2xl" />
            <h1 className="text-2xl font-bold text-red-800 tracking-tight">
              Gestão Global de Projetos
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Seletor de Organização */}
        <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-red-100 mb-8">
          <h2 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
            <FaBuilding /> Selecione a Organização para Inspecionar
          </h2>

          {loadingOrgs ? (
            <p className="text-gray-500">Carregando organizações...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <select
              className="w-full p-3 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-400 bg-white"
              value={selectedOrgId}
              onChange={(e) => setSelectedOrgId(e.target.value)}
            >
              <option value="">-- Selecione uma Organização --</option>
              {organizations.map((org) => (
                <option key={org.public_id} value={org.public_id}>
                  {org.name} (CNPJ: {org.cnpj})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Lista de Projetos */}
        {selectedOrgId && (
          <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-red-100">
            <h2 className="text-xl font-semibold text-red-900 mb-6">
              Projetos da Organização
            </h2>

            {loadingProjects ? (
              <p className="text-gray-600">Carregando projetos...</p>
            ) : projects.length === 0 ? (
              <p className="text-gray-600 italic">
                Esta organização não possui projetos cadastrados.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm bg-white rounded-lg overflow-hidden border border-red-100">
                  <thead className="bg-red-50 border-b border-red-100 text-red-800 uppercase">
                    <tr>
                      <th className="py-3 px-4">Título</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Meta</th>
                      <th className="py-3 px-4 text-right">Arrecadado</th>
                      <th className="py-3 px-4 text-center">Início</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-50">
                    {projects.map((p) => (
                      <tr
                        key={p.public_id}
                        className="hover:bg-red-50/50 transition"
                      >
                        <td className="py-3 px-4 font-medium text-gray-800">
                          {p.title}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              p.status === "ACTIVE"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          R$ {formatCurrency(p.goal_amount)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          R$ {formatCurrency(p.collected_amount)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {new Date(p.start_date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
