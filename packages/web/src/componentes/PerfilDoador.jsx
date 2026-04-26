// src/componentes/PerfilDoador.jsx
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaBuilding,
  FaEdit,
  FaEnvelope,
  FaIdCard,
  FaMapMarkerAlt,
  FaPhone,
  FaSave,
  FaUser,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/enviroments";

// Função auxiliar para formatar data
const toISODate = (dateString) => {
  if (!dateString) return "";
  return dateString.split("T")[0];
};

// Função auxiliar para formatar moeda
const formatCurrency = (value) => {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const PerfilUsuario = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null); // Estado para armazenar o papel do usuário

  // Estado para estatísticas (Apenas Doador)
  const [stats, setStats] = useState({
    totalDonated: 0,
    totalDonations: 0,
    memberSince: "",
  });

  // Estado para dados extras de Membro
  const [memberInfo, setMemberInfo] = useState({
    organizationName: "",
    role: "",
    code: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    document: "",
    birth_date: "",
    public_id: "",
  });

  const fetchUserData = async (userId, role, token) => {
    setLoading(true);
    try {
      let profileUrl = "";

      // 1. Definir endpoint baseado na Role
      if (role === "DONOR") {
        profileUrl = `${API_BASE_URL}/donors/${userId}`;
      } else if (role === "ORG_MEMBER") {
        // Inclui ORG_ADMIN, AUDITOR, VOLUNTEER
        profileUrl = `${API_BASE_URL}/members/${userId}`;
      } else if (role === "ADMIN") {
        // Admin do sistema não possui endpoint de perfil público no backend atual.
        // Tratamento especial: Mostra dados limitados ou estáticos se não houver endpoint.
        throw new Error(
          "Perfil de Administrador do Sistema não possui visualização de detalhes neste momento."
        );
      }

      // 2. Buscar Dados do Perfil
      const res = await fetch(profileUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Falha ao buscar dados do perfil.");

      const data = await res.json();

      setFormData({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        city: data.city || "",
        state: data.state || "",
        document: data.document || "",
        birth_date: toISODate(data.birth_date),
        public_id: data.public_id || "",
      });

      // 3. Lógica Específica por Role
      if (role === "DONOR") {
        // Buscar histórico de doações para calcular estatísticas
        const donationsRes = await fetch(`${API_BASE_URL}/donations`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (donationsRes.ok) {
          const allDonations = await donationsRes.json();
          const myDonations = Array.isArray(allDonations)
            ? allDonations.filter(
                (d) =>
                  d.donor?.person?.public_id === userId &&
                  d.status === "CONFIRMED"
              )
            : [];

          setStats({
            totalDonated: myDonations.reduce(
              (sum, d) => sum + parseFloat(d.value),
              0
            ),
            totalDonations: myDonations.length,
            memberSince: new Date(data.created_at).getFullYear(),
          });
        }
      } else if (role === "ORG_MEMBER") {
        // Preencher dados específicos de membro
        setMemberInfo({
          organizationName: data.organization_name || "Organização",
          role: data.role || "Membro",
          code: data.member_code || "N/A",
        });
        setStats({ memberSince: new Date(data.created_at).getFullYear() });
      }
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
      if (role !== "ADMIN") alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      // O backend retorna 'role' (DONOR, ORG_MEMBER, ADMIN)
      // Para membros, o login retorna role: 'ORG_MEMBER' e memberRole: 'ORG_ADMIN'/'AUDITOR' etc.
      const role = decoded.role;
      setUserRole(role);
      fetchUserData(decoded.publicId, role, token);
    } catch (e) {
      localStorage.removeItem("token");
      navigate("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // Função de Salvar (Apenas para DOADORES)
  const handleSave = async () => {
    const token = localStorage.getItem("token");

    // Payload compatível com updateDonorSchema
    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      document: formData.document,
      city: formData.city,
      state: formData.state,
      birthDate: formData.birth_date,
    };

    try {
      const response = await fetch(
        `${API_BASE_URL}/donors/${formData.public_id}`,
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
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao salvar.");
      }

      setIsEditing(false);
      alert("Perfil atualizado com sucesso!");
    } catch (error) {
      alert("Erro ao salvar perfil: " + error.message);
    }
  };

  // Determinar navegação de voltar baseada na role
  const handleBack = () => {
    if (userRole === "ADMIN") navigate("/admin-dashboard");
    else if (userRole === "ORG_MEMBER") navigate("/member-dashboard");
    else navigate("/dashboard");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-white flex justify-center items-center">
        <p className="text-gray-600 font-semibold">Carregando perfil...</p>
      </div>
    );
  }

  // Define cores baseadas no tipo de usuário para manter identidade visual
  const themeColor =
    userRole === "ADMIN" ? "red" : userRole === "ORG_MEMBER" ? "teal" : "cyan";
  const bgColor =
    userRole === "ADMIN"
      ? "from-red-100 via-pink-50"
      : userRole === "ORG_MEMBER"
        ? "from-green-100 via-teal-50"
        : "from-blue-100 via-cyan-50";

  return (
    <div
      className={`w-full min-h-screen bg-gradient-to-br ${bgColor} to-white`}
    >
      {/* Cabeçalho */}
      <header
        className={`backdrop-blur-md bg-white/80 border-b border-${themeColor}-100 shadow-md`}
      >
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={handleBack}
            className={`text-${themeColor}-600 hover:text-${themeColor}-800 transition`}
          >
            <FaArrowLeft className="text-2xl" />
          </button>
          <h1 className={`text-2xl font-bold text-${themeColor}-900`}>
            Meu Perfil
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Card Principal */}
        <div
          className={`bg-white/80 backdrop-blur-lg border border-${themeColor}-100 rounded-xl shadow-xl p-8 mb-8`}
        >
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-6">
              <div
                className={`w-24 h-24 rounded-full bg-gradient-to-r from-${themeColor}-500 to-${themeColor}-300 flex items-center justify-center shadow-md`}
              >
                <FaUser className="text-white text-5xl" />
              </div>

              <div>
                <h2 className={`text-3xl font-bold text-${themeColor}-900`}>
                  {formData.name || "Usuário"}
                </h2>
                <p className="text-gray-600">
                  {userRole === "DONOR"
                    ? "Doador"
                    : userRole === "ADMIN"
                      ? "Admin do Sistema"
                      : memberInfo.role}
                </p>
                {/* Exibe código se for membro */}
                {userRole === "ORG_MEMBER" && (
                  <p className="text-sm text-gray-500 mt-1 font-mono">
                    Código: {memberInfo.code}
                  </p>
                )}
                {userRole === "DONOR" && (
                  <p className="text-sm text-gray-500 mt-1">
                    Membro desde {stats.memberSince}
                  </p>
                )}
              </div>
            </div>

            {/* Ações (Editar apenas para DOADOR) */}
            <div className="flex flex-col items-end gap-3 w-full md:w-auto">
              {userRole === "DONOR" && (
                <button
                  onClick={() =>
                    isEditing ? handleSave() : setIsEditing(true)
                  }
                  className={`flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-white font-medium transition-all w-full md:w-auto ${
                    isEditing
                      ? "bg-green-500 hover:bg-green-600"
                      : `bg-green-500 hover:bg-green-600`
                  }`}
                >
                  {isEditing ? (
                    <>
                      <FaSave /> Salvar
                    </>
                  ) : (
                    <>
                      <FaEdit /> Editar
                    </>
                  )}
                </button>
              )}

              <button
                onClick={() => navigate("/perfil/change-password")}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500
                text-white font-medium shadow hover:from-amber-600 hover:to-orange-600 transition-all w-full md:w-auto"
              >
                Alterar Senha
              </button>
            </div>
          </div>

          {/* Estatísticas (Apenas DOADOR) */}
          {userRole === "DONOR" && (
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200">
              <div className="text-center">
                <p className="text-2xl font-bold text-cyan-600">
                  R$ {formatCurrency(stats.totalDonated)}
                </p>
                <p className="text-gray-600 text-sm">Total Doado</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-sky-600">
                  {stats.totalDonations}
                </p>
                <p className="text-gray-600 text-sm">Doações Confirmadas</p>
              </div>
            </div>
          )}

          {/* Informações da Organização (Apenas MEMBRO) */}
          {userRole === "ORG_MEMBER" && (
            <div className="pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-teal-800 mb-2 flex items-center gap-2">
                <FaBuilding /> Vínculo Organizacional
              </h3>
              <p className="text-gray-700">
                Organização: <strong>{memberInfo.organizationName}</strong>
              </p>
            </div>
          )}
        </div>

        {/* Formulário de Dados */}
        <div
          className={`bg-white/80 backdrop-blur-lg border border-${themeColor}-100 rounded-xl shadow-xl p-8 mb-8`}
        >
          <h3 className={`text-xl font-bold text-${themeColor}-900 mb-6`}>
            Dados Pessoais
          </h3>

          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: "name", label: "Nome Completo", icon: <FaUser /> },
                { name: "email", label: "E-mail", icon: <FaEnvelope /> },
                { name: "phone", label: "Telefone", icon: <FaPhone /> },
                {
                  name: "document",
                  label: "CPF/Documento",
                  icon: <FaIdCard />,
                },
                { name: "city", label: "Cidade", icon: <FaMapMarkerAlt /> },
                { name: "state", label: "Estado" },
              ].map((field, i) => (
                <div key={i}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label}
                  </label>
                  <div className="relative">
                    {field.icon && (
                      <span
                        className={`absolute left-3 top-1/2 -translate-y-1/2 text-${themeColor}-500`}
                      >
                        {field.icon}
                      </span>
                    )}
                    <input
                      type="text"
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      // Habilita edição APENAS se estiver em modo edição E o usuário for DOADOR
                      disabled={!isEditing || userRole !== "DONOR"}
                      className={`w-full ${
                        field.icon ? "pl-10" : "pl-4"
                      } pr-4 py-2 border border-gray-300 rounded-lg 
                      focus:ring-2 focus:ring-${themeColor}-400 disabled:bg-gray-100 disabled:text-gray-500`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Nascimento
              </label>
              <input
                type="date"
                name="birth_date"
                value={formData.birth_date}
                onChange={handleChange}
                disabled={!isEditing || userRole !== "DONOR"}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg
                focus:ring-2 focus:ring-${themeColor}-400 disabled:bg-gray-100 disabled:text-gray-500`}
              />
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default PerfilUsuario;
