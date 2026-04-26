// src/componentes/AdminOrganizationsList.jsx
import { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaBuilding,
  FaCheckCircle,
  FaSearch,
  FaTimesCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/enviroments";

const formatCNPJ = (cnpj) => {
  return cnpj.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5"
  );
};

const formatPhone = (phone) => {
  return phone.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
};

export default function AdminOrganizationsList() {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        // Endpoint: GET /api/organizations (Lista todas para ADMIN)
        const response = await fetch(`${API_BASE_URL}/organizations`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Falha ao listar organizações.");
        }

        const data = await response.json();
        console.log(data);
        setOrganizations(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrgs();
  }, [token]);

  return (
    // LAYOUT ADMIN: Fundo Vermelho
    <div className="w-full min-h-screen bg-gradient-to-br from-red-100 via-pink-50 to-white">
      {/* Cabeçalho */}
      <header className="backdrop-blur-md bg-white/80 shadow-md border-b border-red-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/admin-dashboard")}
            className="text-red-600 hover:text-red-700 transition-colors"
          >
            <FaArrowLeft className="text-2xl" />
          </button>
          <div className="flex items-center gap-3">
            <FaBuilding className="text-red-800 text-2xl" />
            <h1 className="text-2xl font-bold text-red-800 tracking-tight">
              Todas as Organizações
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-red-100">
          <h2 className="text-xl font-semibold text-red-900 mb-6 flex items-center gap-2">
            <FaSearch /> Listagem Geral
          </h2>

          {loading ? (
            <p className="text-gray-600">Carregando...</p>
          ) : error ? (
            <p className="text-red-500 font-medium">Erro: {error}</p>
          ) : organizations.length === 0 ? (
            <p className="text-gray-600 italic">
              Nenhuma organização cadastrada no sistema.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm bg-white rounded-lg overflow-hidden border border-red-100">
                <thead className="bg-red-50 border-b border-red-100 text-red-800 uppercase">
                  <tr>
                    <th className="py-3 px-4">Nome</th>
                    <th className="py-3 px-4">CNPJ</th>
                    <th className="py-3 px-4">Email / Contato</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Verificada</th>
                    <th className="py-3 px-4">Criada em</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-red-50">
                  {organizations.map((org) => (
                    <tr
                      key={org.public_id}
                      className="hover:bg-red-50/30 transition"
                    >
                      <td className="py-3 px-4 font-medium text-gray-800">
                        {org.name}
                        {org.description && (
                          <p className="text-xs text-gray-500 truncate max-w-xs">
                            {org.description}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-600 font-mono">
                        {formatCNPJ(org.cnpj)}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        <div>{org.email}</div>
                        <div className="text-xs text-gray-400">
                          {formatPhone(org.phone)}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold ${
                            org.status === "ACTIVE"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {org.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {org.verified ? (
                          <div
                            className="flex justify-center items-center text-blue-600"
                            title="Verificada"
                          >
                            <FaCheckCircle size={18} />
                          </div>
                        ) : (
                          <div
                            className="flex justify-center items-center text-gray-300"
                            title="Não Verificada"
                          >
                            <FaTimesCircle size={18} />
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-xs">
                        {new Date(org.created_at).toLocaleDateString()}
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
