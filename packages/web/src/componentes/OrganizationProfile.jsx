// src/componentes/OrganizationProfile.jsx
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaBuilding,
  FaEdit,
  FaEnvelope,
  FaGlobe,
  FaIdCard,
  FaPhone,
  FaSave,
  FaTrash,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/enviroments";

export default function OrganizationProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);

  // Estado do formulário
  const [formData, setFormData] = useState({
    public_id: "",
    name: "",
    description: "",
    website: "",
    email: "",
    phone: "",
    cnpj: "",
    verified: false,
  });

  const token = localStorage.getItem("token");

  // --- 1. Carregar Dados ---
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        navigate("/member-login");
        return;
      }

      try {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.publicId;

        // 1. Obter ID da Organização via dados do Membro
        // Endpoint: GET /members/:id
        const memberResponse = await fetch(
          `${API_BASE_URL}/members/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!memberResponse.ok)
          throw new Error("Falha ao obter vínculo com organização.");
        const memberData = await memberResponse.json();
        const orgId = memberData.organization_id;

        if (!orgId)
          throw new Error("Você não está vinculado a uma organização ativa.");

        // 2. Buscar Detalhes da Organização
        // Endpoint: GET /organizations/:id
        const orgResponse = await fetch(
          `${API_BASE_URL}/organizations/${orgId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!orgResponse.ok)
          throw new Error("Falha ao carregar dados da organização.");
        const orgData = await orgResponse.json();

        setFormData({
          public_id: orgData.public_id,
          name: orgData.name || "",
          description: orgData.description || "",
          website: orgData.website || "",
          email: orgData.email || "",
          phone: orgData.phone || "",
          cnpj: orgData.cnpj || "",
          verified: orgData.verified,
        });
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate, token]);

  // --- 2. Manipulação do Formulário ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- 3. Atualizar Organização (PUT) ---
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      // Payload conforme updateOrganizationSchema
      const payload = {
        name: formData.name,
        description: formData.description,
        website: formData.website,
        email: formData.email,
        phone: formData.phone,
        cnpj: formData.cnpj,
      };

      const response = await fetch(
        `${API_BASE_URL}/organizations/${formData.public_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Erro ao atualizar.");
      }

      alert("Dados da organização atualizados com sucesso!");
      setIsEditing(false);
    } catch (err) {
      alert("Erro: " + err.message);
    }
  };

  // --- 4. Excluir Organização (DELETE) ---
  const handleDelete = async () => {
    const confirmText = prompt(
      "Tem certeza? Isso inativará a organização e todos os membros perderão acesso. Digite o nome da organização para confirmar:"
    );

    if (confirmText !== formData.name) {
      alert("Nome incorreto. Ação cancelada.");
      return;
    }

    try {
      // Endpoint: DELETE /organizations/:id
      const response = await fetch(
        `${API_BASE_URL}/organizations/${formData.public_id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Erro ao excluir organização.");

      alert("Organização inativada com sucesso. Você será deslogado.");
      localStorage.removeItem("token");
      navigate("/login");
    } catch (err) {
      alert("Erro: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-teal-50 to-white">
        <p className="text-teal-800 font-semibold">
          Carregando perfil da organização...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-green-100 via-teal-50 to-white">
      {/* Cabeçalho */}
      <header className="backdrop-blur-md bg-white/80 shadow-md border-b border-teal-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/member-dashboard")}
            className="text-teal-600 hover:text-teal-700 transition-colors"
          >
            <FaArrowLeft className="text-2xl" />
          </button>
          <div className="flex items-center gap-3">
            <FaBuilding className="text-teal-800 text-2xl" />
            <h1 className="text-2xl font-bold text-teal-800 tracking-tight">
              Perfil da Organização
            </h1>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
            {error}
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-teal-100">
            {/* Topo do Card: Título e Status */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-teal-100 pb-6">
              <div>
                <h2 className="text-3xl font-bold text-teal-900">
                  {formData.name}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      formData.verified
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {formData.verified ? "VERIFICADA" : "NÃO VERIFICADA"}
                  </span>
                  <span className="text-gray-400 text-sm">
                    ID: {formData.public_id}
                  </span>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-3 mt-4 md:mt-0">
                {!isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded shadow hover:bg-teal-700 transition"
                    >
                      <FaEdit /> Editar
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-2 bg-red-100 text-red-600 px-4 py-2 rounded shadow hover:bg-red-200 transition"
                    >
                      <FaTrash /> Excluir
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      window.location.reload();
                    }} // Reload simples para cancelar
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded shadow hover:bg-gray-400 transition"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>

            {/* Formulário */}
            <form onSubmit={handleUpdate} className="space-y-6">
              {/* Descrição */}
              <div>
                <label className="block text-sm font-bold text-teal-800 mb-1">
                  Descrição / Missão
                </label>
                <textarea
                  name="description"
                  rows="3"
                  className="w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-teal-400 outline-none disabled:bg-gray-50 disabled:text-gray-600"
                  value={formData.description}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nome */}
                <div>
                  <label className="block text-sm font-bold text-teal-800 mb-1 flex items-center gap-2">
                    <FaBuilding /> Nome da Organização
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="w-full p-3 border rounded-lg bg-white disabled:bg-gray-50 disabled:text-gray-600"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                  />
                </div>

                {/* CNPJ */}
                <div>
                  <label className="block text-sm font-bold text-teal-800 mb-1 flex items-center gap-2">
                    <FaIdCard /> CNPJ
                  </label>
                  <input
                    type="text"
                    name="cnpj"
                    className="w-full p-3 border rounded-lg bg-white disabled:bg-gray-50 disabled:text-gray-600"
                    value={formData.cnpj}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-bold text-teal-800 mb-1 flex items-center gap-2">
                    <FaEnvelope /> Email de Contato
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="w-full p-3 border rounded-lg bg-white disabled:bg-gray-50 disabled:text-gray-600"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                  />
                </div>

                {/* Telefone */}
                <div>
                  <label className="block text-sm font-bold text-teal-800 mb-1 flex items-center gap-2">
                    <FaPhone /> Telefone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className="w-full p-3 border rounded-lg bg-white disabled:bg-gray-50 disabled:text-gray-600"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                  />
                </div>

                {/* Website */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-teal-800 mb-1 flex items-center gap-2">
                    <FaGlobe /> Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    className="w-full p-3 border rounded-lg bg-white disabled:bg-gray-50 disabled:text-gray-600"
                    value={formData.website}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {isEditing && (
                <div className="pt-4 border-t border-teal-100 flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-green-700 transition font-bold"
                  >
                    <FaSave /> Salvar Alterações
                  </button>
                </div>
              )}
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
