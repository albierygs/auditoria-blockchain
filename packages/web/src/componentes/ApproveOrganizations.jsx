// src/componentes/ApproveOrganizations.jsx
import { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaBuilding,
  FaClipboardCheck,
  FaSearch,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/enviroments";

const ApproveOrganizations = () => {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("PENDING"); // PENDING, APPROVED, REJECTED
  const token = localStorage.getItem("token");

  const fetchOrganizations = async (status) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}/organizations/?verification_status=${status}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao listar organizações.");
      }

      const data = await response.json();
      setOrganizations(data);
    } catch (err) {
      setError(err.message || "Erro ao buscar lista de organizações.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations(activeTab);
  }, [activeTab]);

  const getTabLabel = (status) => {
    const labels = {
      PENDING: "Pendentes de Análise",
      APPROVED: "Aprovadas",
      REJECTED: "Reprovadas",
    };
    return labels[status] || status;
  };

  const getTabColor = (status) => {
    const colors = {
      PENDING: "border-yellow-500 text-yellow-600",
      APPROVED: "border-green-500 text-green-600",
      REJECTED: "border-red-500 text-red-600",
    };
    return colors[status] || "border-gray-500 text-gray-600";
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-800",
      APPROVED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

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
        {/* Tabs de Filtro */}
        <div className="mb-8 flex gap-2 border-b border-red-100">
          {["PENDING", "APPROVED", "REJECTED"].map((status) => (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={`px-6 py-3 font-semibold transition-all border-b-2 ${
                activeTab === status
                  ? `${getTabColor(status)} border-opacity-100 bg-red-50/30`
                  : "border-transparent text-gray-600 hover:text-gray-800"
              }`}
            >
              {getTabLabel(status)}
            </button>
          ))}
        </div>

        <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-red-100">
          <h2 className="text-xl font-semibold text-red-900 mb-6 border-b border-red-100 pb-2">
            {getTabLabel(activeTab)} ({organizations.length})
          </h2>

          {loading ? (
            <p className="text-gray-600">Carregando...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : organizations.length === 0 ? (
            <p className="text-gray-500 italic">
              Nenhuma organização nesta categoria no momento.
            </p>
          ) : (
            <div className="space-y-4">
              {organizations.map((org) => (
                <div
                  key={org.public_id}
                  className="p-5 border border-red-100 rounded-lg shadow-sm bg-white hover:shadow-md transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="bg-red-50 p-3 rounded-full hidden md:block">
                      <FaBuilding className="text-red-400 text-xl" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-lg text-red-900">
                          {org.name}
                        </h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-semibold ${getStatusBadgeColor(
                            org.verification_status
                          )}`}
                        >
                          {getTabLabel(org.verification_status)}
                        </span>
                      </div>
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
                      {org.rejection_reason && (
                        <p className="text-sm text-red-600 mt-2">
                          <strong>Motivo da Rejeição:</strong>{" "}
                          {org.rejection_reason}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Botão de Ação */}
                  <button
                    onClick={() =>
                      navigate(`/admin/organizations/verify/${org.public_id}`)
                    }
                    className={`px-5 py-2 rounded-md shadow hover:shadow-md transition flex items-center gap-2 font-semibold whitespace-nowrap ${
                      activeTab === "PENDING"
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-amber-600 text-white hover:bg-amber-700"
                    }`}
                  >
                    <FaSearch />{" "}
                    {activeTab === "PENDING" ? "Verificar" : "Reanalisar"}
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
