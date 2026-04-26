// src/componentes/MembersManager.jsx
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaEnvelope,
  FaIdCard,
  FaUserPlus,
  FaUsers,
  FaUserSlash,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/enviroments";

export default function MembersManager() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [organizationId, setOrganizationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado do formulário de contratação
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    phone: "",
    document: "",
    role: "VOLUNTEER", // Valor padrão
    city: "",
    state: "",
    birthDate: "",
  });

  const token = localStorage.getItem("token");

  // --- 1. Carregamento Inicial (Org ID + Membros) ---
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!token) {
        navigate("/member-login");
        return;
      }

      try {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.publicId;

        // Obter ID da Organização do usuário logado
        const memberResponse = await fetch(
          `${API_BASE_URL}/members/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!memberResponse.ok)
          throw new Error("Falha ao obter dados do usuário.");

        const memberData = await memberResponse.json();
        const orgId = memberData.organization_id;

        if (!orgId) {
          throw new Error("Usuário não está vinculado a uma organização.");
        }
        setOrganizationId(orgId);

        // Buscar lista de membros da organização
        await fetchMembers(orgId);
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

  // Função para buscar membros
  const fetchMembers = async (orgId) => {
    try {
      // Endpoint solicitado: GET /api/organizations/:id/members
      const response = await fetch(
        `${API_BASE_URL}/organizations/${orgId}/members`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) {
        // Se o endpoint não existir ou der erro, logamos e limpamos a lista
        console.warn(
          "Falha ao buscar membros. Verifique se a rota '/members' existe no backend."
        );
        // Tenta usar o retorno padrão caso seja um array, senão array vazio
        const data = await response.json().catch(() => []);
        setMembers(Array.isArray(data) ? data : []);
        return;
      }

      const data = await response.json();
      setMembers(Array.isArray(data.members) ? data.members : []);
      console.log(members);
    } catch (err) {
      console.error("Erro ao carregar lista de membros:", err);
    }
  };

  // --- 2. Contratar Membro ---
  const handleHire = async (e) => {
    e.preventDefault();
    if (!organizationId) return;

    try {
      const payload = {
        ...newMember,
        organizationId: organizationId, // Inclui o ID da organização no corpo
      };

      // Endpoint: POST /api/members/hire
      const response = await fetch(`${API_BASE_URL}/members/hire`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao contratar membro.");
      }

      alert("Membro contratado com sucesso!");

      // Limpar formulário
      setNewMember({
        name: "",
        email: "",
        phone: "",
        document: "",
        role: "VOLUNTEER",
        city: "",
        state: "",
        birthDate: "",
      });

      // Recarregar lista
      fetchMembers(organizationId);
    } catch (err) {
      alert("Erro ao contratar: " + err.message);
    }
  };

  // --- 3. Demitir Membro ---
  const handleDismiss = async (memberId) => {
    const reason = prompt("Por favor, informe o motivo do desligamento:");
    if (!reason) return; // Cancela se não houver motivo

    try {
      // Endpoint: PUT /api/members/:id/dismiss
      const response = await fetch(
        `${API_BASE_URL}/members/${memberId}/dismiss`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason }), // Envia a razão no body
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao desligar membro.");
      }

      alert("Membro desligado com sucesso.");
      fetchMembers(organizationId);
    } catch (err) {
      alert("Erro ao desligar: " + err.message);
    }
  };

  const handleChange = (e) =>
    setNewMember({ ...newMember, [e.target.name]: e.target.value });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-teal-50 to-white">
        <p className="text-teal-800 font-semibold">
          Carregando gestão de membros...
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
            <FaUsers className="text-teal-800 text-2xl" />
            <h1 className="text-2xl font-bold text-teal-800 tracking-tight">
              Gerenciamento de Membros
            </h1>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {error && <p className="text-red-500 mb-6 font-medium">{error}</p>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* COLUNA 1: Formulário de Contratação */}
          <div className="lg:col-span-1 bg-white/80 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-teal-100 h-fit">
            <h2 className="text-xl font-semibold text-sky-800 mb-6 flex items-center gap-2">
              <FaUserPlus /> Contratar Membro
            </h2>

            <form onSubmit={handleHire} className="space-y-4">
              {/* Nome */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Nome Completo
                </label>
                <input
                  name="name"
                  value={newMember.name}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded"
                  placeholder="Ex: João Silva"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Email
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-2 top-3 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={newMember.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-8 p-2 border rounded"
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>

              {/* Telefone e CPF */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Telefone
                  </label>
                  <input
                    name="phone"
                    value={newMember.phone}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border rounded"
                    placeholder="11999999999"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    CPF
                  </label>
                  <input
                    name="document"
                    value={newMember.document}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border rounded"
                    placeholder="Apenas números"
                  />
                </div>
              </div>

              {/* Cidade e Estado */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Cidade
                  </label>
                  <input
                    name="city"
                    value={newMember.city}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    UF
                  </label>
                  <input
                    name="state"
                    value={newMember.state}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border rounded"
                    maxLength="2"
                    placeholder="EX"
                  />
                </div>
              </div>

              {/* Data Nascimento e Cargo */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Nascimento
                  </label>
                  <input
                    type="date"
                    name="birthDate"
                    value={newMember.birthDate}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Cargo
                  </label>
                  <select
                    name="role"
                    value={newMember.role}
                    onChange={handleChange}
                    className="w-full p-2 border rounded bg-white"
                  >
                    <option value="VOLUNTEER">Voluntário</option>
                    <option value="AUDITOR">Auditor</option>
                    <option value="ORG_ADMIN">Administrador</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-500 to-green-600 text-white py-2 rounded-md font-semibold shadow hover:from-teal-600 hover:to-green-700 transition"
              >
                Contratar
              </button>
            </form>
          </div>

          {/* COLUNA 2: Lista de Membros */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-teal-100">
            <h2 className="text-xl font-semibold text-sky-800 mb-6">
              Equipe Atual
            </h2>

            {members.length === 0 ? (
              <p className="text-gray-600 italic">Nenhum membro encontrado.</p>
            ) : (
              <div className="space-y-4">
                {members.map((m) => (
                  <div
                    key={m.public_id}
                    className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100"
                  >
                    <div className="flex items-center gap-4 mb-2 md:mb-0">
                      <div className="bg-teal-50 p-3 rounded-full">
                        <FaIdCard className="text-teal-500 text-xl" />
                      </div>
                      <div>
                        <h3 className="font-bold text-teal-900">
                          {m.person.name}
                        </h3>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          {m.role}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <FaEnvelope className="text-xs" /> {m.person.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-semibold ${
                          m.person.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {m.person.status}
                      </span>

                      {/* Botão de Desligar (Apenas se estiver ativo) */}
                      {m.person.status === "ACTIVE" && (
                        <button
                          onClick={() => handleDismiss(m.public_id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition"
                          title="Desligar Membro"
                        >
                          <FaUserSlash />
                        </button>
                      )}
                    </div>
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
