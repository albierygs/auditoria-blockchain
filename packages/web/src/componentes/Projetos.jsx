// src/componentes/Projetos.jsx
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaTasks } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/enviroments";

// Funções auxiliares para formatação
const formatCurrency = (value) => {
  return `R$ ${parseFloat(value).toFixed(2).replace(".", ",")}`;
};

export default function Projetos() {
  const [projetos, setProjetos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null); // Estado para armazenar a role
  const navigate = useNavigate();

  useEffect(() => {
    carregarProjetos();
  }, []);

  const carregarProjetos = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Sessão expirada. Redirecionando para o login.");
      navigate("/member-login");
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.publicId;

      // Captura a role do membro para controle de acesso na UI
      setUserRole(decodedToken.memberRole);

      // 1. Obter o ID da Organização do Membro
      const memberResponse = await fetch(`${API_BASE_URL}/members/${userId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!memberResponse.ok) {
        const errorData = await memberResponse.json();
        throw new Error(errorData.message || "Falha ao obter dados do membro.");
      }

      const memberData = await memberResponse.json();
      const organizationId = memberData.organization_id;

      if (!organizationId) {
        throw new Error("Membro não associado a uma organização ativa.");
      }

      // 2. Carregar Projetos da Organização
      const projectsResponse = await fetch(
        `${API_BASE_URL}/organizations/${organizationId}/projects`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!projectsResponse.ok) {
        const errorData = await projectsResponse.json();
        throw new Error(errorData.message || "Falha ao carregar projetos.");
      }

      const data = await projectsResponse.json();
      setProjetos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao carregar projetos:", err);
      setError(err.message || "Erro desconhecido ao carregar projetos.");
      setProjetos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNovoProjeto = () => {
    navigate("/projetos/novo");
  };

  const handleDetalhes = (publicId) => {
    navigate(`/projetos/detalhes/${publicId}`);
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
            <FaTasks className="text-teal-800 text-2xl" />
            <h1 className="text-2xl font-bold text-teal-800 tracking-tight">
              Projetos da Organização
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-teal-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-sky-800">
              Lista de Projetos
            </h2>

            {/* BOTÃO CONDICIONAL: Só aparece para ORG_ADMIN */}
            {userRole === "ORG_ADMIN" && (
              <button
                onClick={handleNovoProjeto}
                className="bg-green-600 text-white px-4 py-2 rounded shadow-md hover:bg-green-700 transition"
              >
                Novo Projeto
              </button>
            )}
          </div>

          {loading ? (
            <p className="text-gray-600">Carregando projetos...</p>
          ) : error ? (
            <p className="text-red-500">Erro: {error}</p>
          ) : projetos.length === 0 ? (
            <p className="text-gray-600">
              Nenhum projeto encontrado para sua organização.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm bg-white rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-100 border-b text-gray-700 uppercase tracking-wider">
                    <th className="py-3 px-4">Título</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Meta</th>
                    <th className="py-3 px-4 text-right">Arrecadado</th>
                    <th className="py-3 px-4 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {projetos.map((p) => (
                    <tr
                      key={p.public_id}
                      className="hover:bg-teal-50 transition duration-150"
                    >
                      <td className="py-3 px-4 font-medium text-gray-800">
                        {p.title}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            p.status === "ACTIVE"
                              ? "bg-green-100 text-green-700"
                              : p.status === "DRAFT"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {formatCurrency(p.goal_amount)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {formatCurrency(p.collected_amount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          className="bg-teal-600 text-white px-4 py-1 rounded text-xs shadow-sm hover:bg-teal-700 transition"
                          onClick={() => handleDetalhes(p.public_id)}
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
