// src/componentes/OrganizationProfile.jsx
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaBuilding,
  FaCheckCircle,
  FaClock,
  FaCreditCard,
  FaEdit,
  FaEnvelope,
  FaGlobe,
  FaIdCard,
  FaLink,
  FaPhone,
  FaSave,
  FaTimesCircle,
  FaTrash,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/enviroments";

export default function OrganizationProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [stripeAccount, setStripeAccount] = useState(null);
  const [stripeLoading, setStripeLoading] = useState(false);

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

        // Fetch Stripe account status
        try {
          const stripeRes = await fetch(`${API_BASE_URL}/stripe/account`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (stripeRes.ok) {
            const stripeData = await stripeRes.json();
            setStripeAccount(stripeData);
          }
        } catch (e) {
          /* org may not have stripe yet */
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate, token]);

  // --- Stripe Onboarding ---
  const handleStripeOnboarding = async () => {
    setStripeLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/stripe/onboarding`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok)
        throw new Error((await response.json()).message || "Erro");
      const data = await response.json();
      
      // Redirect to Stripe onboarding URL
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      alert("Erro: " + err.message);
      setStripeLoading(false);
    }
  };

  // --- Stripe Login Link ---
  const handleStripeLoginLink = async () => {
    setStripeLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/stripe/login-link`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok)
        throw new Error((await response.json()).message || "Erro");
      const data = await response.json();
      
      // Redirect to Stripe Dashboard
      if (data.url) {
        window.open(data.url, "_blank");
      }
    } catch (err) {
      alert("Erro: " + err.message);
    } finally {
      setStripeLoading(false);
    }
  };

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

            {/* ─── Stripe Integration Section ─── */}
            <hr className="my-8 border-teal-100" />

            {/* No Stripe account */}
            {!stripeAccount && (
              <div className="relative rounded-xl border-2 border-dashed border-teal-300 bg-gradient-to-br from-teal-50/60 via-white/40 to-green-50/60 backdrop-blur-md p-8 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-lg">
                    <FaCreditCard className="text-white text-2xl" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-teal-900 mb-2">
                  Integração Stripe
                </h3>
                <p className="text-teal-700 mb-6 max-w-md mx-auto">
                  Conecte sua organização à Stripe para receber doações.

                </p>
                <button
                  onClick={handleStripeOnboarding}
                  disabled={stripeLoading}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 py-3 rounded-lg shadow-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {stripeLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                      Conectando...
                    </>
                  ) : (
                    <>
                      <FaLink /> Conectar à Stripe
                    </>
                  )}
                </button>
              </div>
            )}

            {/* PENDING / SUBMITTED / NOT CHARGES ENABLED */}
            {stripeAccount &&
              !stripeAccount.charges_enabled && (
                <div className="relative rounded-xl bg-gradient-to-br from-amber-50/80 via-yellow-50/60 to-orange-50/40 backdrop-blur-md p-8 border border-amber-200 shadow-md">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg">
                        <FaClock className="text-white text-2xl animate-pulse" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-amber-900">
                          Ação Necessária na Stripe
                        </h3>
                        <p className="text-amber-700 mt-1">
                          Sua conta Stripe foi criada, mas você precisa enviar documentos adicionais para receber pagamentos.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleStripeOnboarding}
                      disabled={stripeLoading}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2.5 rounded-lg shadow hover:from-amber-600 hover:to-orange-600 transition-all duration-300 font-semibold disabled:opacity-60"
                    >
                      {stripeLoading ? "Processando..." : "Completar Onboarding"}
                    </button>
                  </div>
                </div>
              )}

            {/* CHARGES ENABLED */}
            {stripeAccount && stripeAccount.charges_enabled && (
              <div className="relative rounded-xl bg-gradient-to-br from-green-50/80 via-emerald-50/60 to-teal-50/40 backdrop-blur-md p-8 border border-green-200 shadow-md shadow-green-100">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                      <FaCheckCircle className="text-white text-2xl" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-green-900">
                        ✅ Stripe Conectada
                      </h3>
                      {stripeAccount.account_email && (
                        <p className="text-green-700 text-sm mt-1">
                          Conta: {stripeAccount.account_email}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleStripeLoginLink}
                    disabled={stripeLoading}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-2.5 rounded-lg shadow hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 font-semibold disabled:opacity-60"
                  >
                    {stripeLoading ? "Processando..." : "Acessar Dashboard Stripe"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
