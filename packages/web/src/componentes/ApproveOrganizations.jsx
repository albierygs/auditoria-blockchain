// src/componentes/ApproveOrganizations.jsx
import { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaBuilding,
  FaCheckCircle,
  FaClipboardCheck,
  FaSearch
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/enviroments";

const ApproveOrganizations = () => {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  const fetchOrganizations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/organizations/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao listar organizações.");
      }

      const data = await response.json();
      setOrganizations(data.filter((org) => !org.verified));
    } catch (err) {
      setError(err.message || "Erro ao buscar lista de organizações.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    if (!window.confirm("Confirmar a verificação desta organização?")) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/organizations/${id}/verify`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao verificar organização.");
      }

      alert("Organização verificada com sucesso!");
      fetchOrganizations();
    } catch (error) {
      alert("Erro ao verificar: " + error.message);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  return (
    // LAYOUT ADMIN: Gradiente Vermelho
    <div className="w-full min-h-screen bg-gradient-to-br from-red-100 via-pink-50 to-white">
      {/* Cabeçalho Vermelho */}
      <header className="backdrop-blur-md bg-white/80 shadow-md border-b border-red-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/admin-dashboard")}
            className="text-red-600 hover:text-red-700 transition-colors"
          >
            <FaArrowLeft className="text-2xl" />
          </button>
          <div className="flex items-center gap-3">
            <FaClipboardCheck className="text-red-800 text-2xl" />
            <h1 className="text-2xl font-bold text-red-800 tracking-tight">
              Aprovação de Organizações
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-red-100">
          <h2 className="text-xl font-semibold text-red-900 mb-6 border-b border-red-100 pb-2">
            Solicitações Pendentes ({organizations.length})
          </h2>

          {loading ? (
            <p className="text-gray-600">Carregando...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : organizations.length === 0 ? (
            <p className="text-gray-500 italic">
              Nenhuma organização pendente de verificação no momento.
            </p>
          ) : (
            <div className="space-y-4">
              {organizations.map((org) => (
                <div
                  key={org.public_id}
                  className="p-5 border border-red-100 rounded-lg shadow-sm bg-white hover:shadow-md transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-red-50 p-3 rounded-full hidden md:block">
                      <FaBuilding className="text-red-400 text-xl" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-red-900">
                        {org.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        <strong>CNPJ:</strong> {org.cnpj}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Email:</strong> {org.email}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Descrição:</strong>{" "}
                        {org.description.substring(0, 80)}...
                      </p>
                    </div>
                  </div>

                  {/* Botão de Verificação Modificado */}
                  <button
                    onClick={() => navigate(`/admin/organizations/verify/${org.public_id}`)}
                    className="bg-blue-600 text-white px-5 py-2 rounded-md shadow hover:bg-blue-700 transition flex items-center gap-2 font-semibold whitespace-nowrap"
                  >
                    <FaSearch /> Verificar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ApproveOrganizations;
