// src/componentes/AdminMembersManager.jsx
import { useEffect, useState } from "react";
import { FaArrowLeft, FaBuilding, FaUsers, FaUserTag } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/enviroments";

export default function AdminMembersManager() {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [members, setMembers] = useState([]);

  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  // Carregar Organizações
  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/organizations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) setOrganizations(await response.json());
      } finally {
        setLoading(false);
      }
    };
    fetchOrgs();
  }, [token]);

  // Carregar Membros da Org Selecionada
  useEffect(() => {
    if (!selectedOrgId) {
      setMembers([]);
      return;
    }

    const fetchMembers = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/organizations/${selectedOrgId}/members`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.ok) {
          const data = await response.json();
          // O controller original retorna counts, não a lista.
          // Se não houver lista, exibiremos um aviso.
          setMembers(data.members || []);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchMembers();
  }, [selectedOrgId, token]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-red-100 via-pink-50 to-white">
      <header className="backdrop-blur-md bg-white/80 shadow-md border-b border-red-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/admin-dashboard")}
            className="text-red-600 hover:text-red-700 transition-colors"
          >
            <FaArrowLeft className="text-2xl" />
          </button>
          <div className="flex items-center gap-3">
            <FaUsers className="text-red-800 text-2xl" />
            <h1 className="text-2xl font-bold text-red-800 tracking-tight">
              Gestão de Membros (Global)
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-red-100 mb-8">
          <h2 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
            <FaBuilding /> Selecione a Organização
          </h2>
          <select
            className="w-full p-3 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-400 bg-white"
            value={selectedOrgId}
            onChange={(e) => setSelectedOrgId(e.target.value)}
          >
            <option value="">-- Selecione --</option>
            {organizations.map((org) => (
              <option key={org.public_id} value={org.public_id}>
                {org.name}
              </option>
            ))}
          </select>
        </div>

        {selectedOrgId && (
          <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-red-100">
            <h2 className="text-xl font-semibold text-red-900 mb-6">
              Equipe da Organização
            </h2>
            {members.length === 0 ? (
              <p className="text-gray-600 italic">
                Não foi possível carregar a lista detalhada de membros com o
                endpoint atual ou a lista está vazia.
              </p>
            ) : (
              <div className="space-y-3">
                {members.map((m) => (
                  <div
                    key={m.public_id}
                    className="flex justify-between items-center p-3 bg-white border border-red-100 rounded shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <FaUserTag className="text-red-400" />
                      <div>
                        <p className="font-semibold text-gray-800">
                          {m.person?.name || "Membro"}
                        </p>
                        <p className="text-xs text-gray-500">{m.role}</p>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        m.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
