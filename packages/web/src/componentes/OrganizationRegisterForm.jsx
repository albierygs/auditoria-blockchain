// src/componentes/OrganizationRegisterForm.jsx
import { useState } from "react";
import {
  FaArrowLeft,
  FaBuilding,
  FaEnvelope,
  FaGlobe,
  FaIdCard,
  FaLock,
  FaPhone,
  FaUser,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/enviroments";

const OrganizationRegisterForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Estado que combina dados da Organização e do Administrador Inicial
  const [formData, setFormData] = useState({
    // Dados da Organização (Organization)
    name: "",
    description: "",
    website: "",
    email: "",
    phone: "",
    cnpj: "",

    // Dados do Administrador Inicial (Person + Member)
    adminName: "",
    adminEmail: "",
    adminPassword: "",
    adminPhone: "",
    adminDocument: "",
    adminCity: "",
    adminState: "",
    adminBirthDate: "",
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Nota: Estamos assumindo que o back-end foi modificado para aceitar o Admin aninhado
      const payload = {
        name: formData.name,
        description: formData.description,
        website: formData.website || undefined,
        email: formData.email,
        phone: formData.phone,
        cnpj: formData.cnpj,

        // Dados do Admin Inicial (Admin Person/Member data)
        admin: {
          name: formData.adminName,
          email: formData.adminEmail,
          password: formData.adminPassword,
          phone: formData.adminPhone,
          document: formData.adminDocument,
          city: formData.adminCity,
          state: formData.adminState,
          birthDate: formData.adminBirthDate,
        },
      };

      // Endpoint: POST /api/organizations/create
      const response = await fetch(`${API_BASE_URL}/organizations/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let errorMessage = "";
      try {
        const data = await response.json();
        errorMessage = data.message || JSON.stringify(data);
      } catch {
        errorMessage = await response.text();
      }

      if (!response.ok) {
        alert("Erro ao cadastrar organização: " + errorMessage);
        return;
      }

      alert(
        "Cadastro enviado com sucesso! Aguarde a aprovação do Administrador do Sistema."
      );
      navigate("/");
    } catch (error) {
      console.error("Erro no cadastro:", error);
      alert("Erro ao conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Padrão de Layout Centralizado
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/25 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] w-full max-w-xl overflow-y-auto max-h-[95vh]">
        {/* Cabeçalho */}
        <div className="flex justify-center items-center mb-4">
          <div className="bg-gradient-to-r from-green-500 to-teal-400 p-3 rounded-full shadow-lg">
            <FaBuilding className="text-white text-3xl" />
          </div>
        </div>

        <h2 className="text-center text-2xl font-extrabold mb-1 text-sky-800">
          Registro de Organização
        </h2>
        <p className="text-center text-sm text-gray-700 mb-6">
          Preencha os dados para solicitar a verificação e acesso à plataforma.
        </p>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* == Seção 1: Dados da Organização (Entidade Principal) == */}
          <fieldset className="p-4 border border-teal-300/60 rounded-lg space-y-4">
            <legend className="px-2 text-lg font-semibold text-teal-700">
              Dados Legais da Organização
            </legend>

            {[
              {
                id: "name",
                label: "Nome da Organização",
                icon: <FaBuilding />,
                type: "text",
              },
              { id: "cnpj", label: "CNPJ", icon: <FaIdCard />, type: "text" },
              {
                id: "email",
                label: "E-mail de Contato",
                icon: <FaEnvelope />,
                type: "email",
              },
              {
                id: "phone",
                label: "Telefone",
                icon: <FaPhone />,
                type: "tel",
              },
              {
                id: "website",
                label: "Website (Opcional)",
                icon: <FaGlobe />,
                type: "url",
                optional: true,
              },
            ].map((field) => (
              <div key={field.id} className="space-y-1">
                <label
                  htmlFor={field.id}
                  className="text-sm font-medium text-sky-800"
                >
                  {field.label} {field.optional && "(Opcional)"}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-500">
                    {field.icon}
                  </span>
                  <input
                    type={field.type}
                    id={field.id}
                    value={formData[field.id]}
                    onChange={handleChange}
                    required={!field.optional}
                    className="w-full pl-10 pr-4 py-2 border border-sky-300/60 rounded-md bg-white/80 focus:ring-2 focus:ring-teal-400 outline-none"
                  />
                </div>
              </div>
            ))}

            {/* Descrição */}
            <div>
              <label
                htmlFor="description"
                className="text-sm font-medium text-sky-800"
              >
                Descrição/Missão
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="3"
                className="w-full px-4 py-2 border border-sky-300/60 rounded-md bg-white/80 focus:ring-2 focus:ring-teal-400 outline-none"
              ></textarea>
            </div>
          </fieldset>

          {/* == Seção 2: Dados do Administrador Inicial (ORG_ADMIN) == */}
          <fieldset className="p-4 border border-teal-300/60 rounded-lg space-y-4">
            <legend className="px-2 text-lg font-semibold text-teal-700">
              Dados do Administrador Inicial
            </legend>

            <p className="text-sm text-gray-600">
              Este será o primeiro membro com permissão ORG_ADMIN.
            </p>

            {[
              {
                id: "adminName",
                label: "Nome Completo",
                icon: <FaUser />,
                type: "text",
              },
              {
                id: "adminDocument",
                label: "CPF",
                icon: <FaIdCard />,
                type: "text",
              },
              {
                id: "adminEmail",
                label: "E-mail Pessoal",
                icon: <FaEnvelope />,
                type: "email",
              },
              {
                id: "adminPassword",
                label: "Senha de acesso",
                icon: <FaLock />,
                type: "password",
              },
              {
                id: "adminPhone",
                label: "Telefone",
                icon: <FaPhone />,
                type: "tel",
              },
            ].map((field) => (
              <div key={field.id} className="space-y-1">
                <label
                  htmlFor={field.id}
                  className="text-sm font-medium text-sky-800"
                >
                  {field.label}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-500">
                    {field.icon}
                  </span>
                  <input
                    type={field.type}
                    id={field.id}
                    value={formData[field.id]}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2 border border-sky-300/60 rounded-md bg-white/80 focus:ring-2 focus:ring-teal-400 outline-none"
                  />
                </div>
              </div>
            ))}

            {/* Localização e Data de Nascimento */}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                id="adminCity"
                placeholder="Cidade"
                value={formData.adminCity}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-sky-300/60 rounded-md bg-white/80 focus:ring-2 focus:ring-teal-400 outline-none"
              />
              <input
                type="text"
                id="adminState"
                placeholder="Estado (UF)"
                value={formData.adminState}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-sky-300/60 rounded-md bg-white/80 focus:ring-2 focus:ring-teal-400 outline-none"
              />
            </div>
            <input
              type="date"
              id="adminBirthDate"
              placeholder="Data de Nascimento"
              value={formData.adminBirthDate}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-sky-300/60 rounded-md bg-white/80 focus:ring-2 focus:ring-teal-400 outline-none"
            />
          </fieldset>

          {/* Botão de Envio */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-teal-400 text-white py-3 rounded-md font-semibold shadow-lg hover:from-green-600 hover:to-teal-500 transition-all"
          >
            {loading
              ? "Enviando Solicitação..."
              : "Solicitar Cadastro e Verificação"}
          </button>

          {/* Voltar */}
          <div className="text-center text-sm">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-cyan-600 hover:text-blue-600 hover:underline font-medium"
            >
              <FaArrowLeft className="inline mr-1" /> Voltar para o Início
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrganizationRegisterForm;
