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
  FaCheckCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/enviroments";

const OrganizationRegisterForm = () => {
  const navigate = useNavigate();

  // Controla o estado de envio do formulário
  const [loading, setLoading] = useState(false);

  // Estado principal com dados da organização, administrador e documentos
  const [formData, setFormData] = useState({
    // Dados da Organização
    name: "",
    description: "",
    website: "",
    email: "",
    phone: "",
    cnpj: "",

    // Dados do Administrador Inicial
    adminName: "",
    adminEmail: "",
    adminPassword: "",
    adminPhone: "",
    adminDocument: "",
    adminCity: "",
    adminState: "",
    adminBirthDate: "",

    // NOVO: documentos obrigatórios para aprovação
    statutes: null,
    registrationCertificate: null,
    governanceDocument: null,
  });

  // NOVO: controla visualmente quais arquivos já foram enviados
  const [uploadedFiles, setUploadedFiles] = useState({
    statutes: false,
    registrationCertificate: false,
    governanceDocument: false,
  });

  // Atualiza campos normais do formulário
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // NOVO: valida e salva os arquivos enviados
  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];

    if (file) {
      // Limite máximo: 5MB
      if (file.size > 5 * 1024 * 1024) {
        alert("Arquivo muito grande! Máximo 5MB.");
        return;
      }

      // Tipos permitidos
      const validTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/jpg",
      ];

      if (!validTypes.includes(file.type)) {
        alert("Apenas PDF, JPG ou PNG são aceitos.");
        return;
      }

      // Salva o arquivo no formData
      setFormData((prev) => ({ ...prev, [fileType]: file }));

      // Marca visualmente como enviado
      setUploadedFiles((prev) => ({ ...prev, [fileType]: true }));
    }
  };

  // Envia o cadastro para o backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // NOVO: valida se todos os documentos foram enviados
      if (
        !uploadedFiles.statutes ||
        !uploadedFiles.registrationCertificate ||
        !uploadedFiles.governanceDocument
      ) {
        alert("Por favor, envie todos os documentos obrigatórios.");
        setLoading(false);
        return;
      }

      // MODIFICADO: agora usa FormData porque precisa enviar arquivos
      const formDataMultipart = new FormData();

      // Dados da organização
      formDataMultipart.append("name", formData.name);
      formDataMultipart.append("description", formData.description);
      formDataMultipart.append("website", formData.website || "");
      formDataMultipart.append("email", formData.email);
      formDataMultipart.append("phone", formData.phone);
      formDataMultipart.append("cnpj", formData.cnpj);

      // Dados do administrador inicial
      formDataMultipart.append("admin[name]", formData.adminName);
      formDataMultipart.append("admin[email]", formData.adminEmail);
      formDataMultipart.append("admin[password]", formData.adminPassword);
      formDataMultipart.append("admin[phone]", formData.adminPhone);
      formDataMultipart.append("admin[document]", formData.adminDocument);
      formDataMultipart.append("admin[city]", formData.adminCity);
      formDataMultipart.append("admin[state]", formData.adminState);
      formDataMultipart.append("admin[birthDate]", formData.adminBirthDate);

      // NOVO: adiciona os documentos no envio
      formDataMultipart.append("documents[statutes]", formData.statutes);
      formDataMultipart.append(
        "documents[registrationCertificate]",
        formData.registrationCertificate
      );
      formDataMultipart.append(
        "documents[governanceDocument]",
        formData.governanceDocument
      );

      // MODIFICADO: sem Content-Type manual, pois FormData define multipart automaticamente
      const response = await fetch(`${API_BASE_URL}/organizations/create`, {
        method: "POST",
        body: formDataMultipart,
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
        "Cadastro enviado com sucesso! Sua documentação será analisada e você receberá uma notificação quando a organização for aprovada."
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/25 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] w-full max-w-2xl overflow-y-auto max-h-[95vh]">
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
          Preencha os dados e envie a documentação necessária para solicitar a
          verificação.
        </p>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Dados da Organização */}
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
                label: "Website",
                icon: <FaGlobe />,
                type: "url",
                optional: true,
              },
            ].map((field) => (
              <div key={field.id} className="space-y-1">
                <label className="text-sm font-medium text-sky-800">
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

            <div>
              <label className="text-sm font-medium text-sky-800">
                Descrição/Missão
              </label>

              <textarea
                id="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="3"
                className="w-full px-4 py-2 border border-sky-300/60 rounded-md bg-white/80 focus:ring-2 focus:ring-teal-400 outline-none"
              />
            </div>
          </fieldset>

          {/* Dados do Administrador */}
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
                <label className="text-sm font-medium text-sky-800">
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
              value={formData.adminBirthDate}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-sky-300/60 rounded-md bg-white/80 focus:ring-2 focus:ring-teal-400 outline-none"
            />
          </fieldset>

          {/* NOVO: Documentação obrigatória */}
          <fieldset className="p-4 border border-red-300/60 rounded-lg space-y-4 bg-red-50/30">
            <legend className="px-2 text-lg font-semibold text-red-700">
              📋 Documentação Obrigatória para Aprovação
            </legend>

            <p className="text-sm text-gray-700 font-medium">
              Envie os documentos em PDF, JPG ou PNG com no máximo 5MB cada.
            </p>

            {[
              {
                id: "statutes",
                label: "Estatuto Social",
                description: "Documento que regulamenta a organização.",
              },
              {
                id: "registrationCertificate",
                label: "Certificado de Registro",
                description: "Comprovante de registro no órgão competente.",
              },
              {
                id: "governanceDocument",
                label: "Documento de Governança",
                description: "Políticas de transparência e gestão.",
              },
            ].map((doc) => (
              <div
                key={doc.id}
                className="p-3 border border-red-200 rounded-lg bg-white/60"
              >
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  {doc.label}
                </label>

                <p className="text-xs text-gray-600 mb-2">{doc.description}</p>

                <input
                  type="file"
                  id={doc.id}
                  onChange={(e) => handleFileChange(e, doc.id)}
                  accept=".pdf,.jpg,.jpeg,.png"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-red-400 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-500 file:text-white hover:file:bg-red-600"
                />

                {/* NOVO: feedback visual do arquivo enviado */}
                {uploadedFiles[doc.id] && (
                  <div className="flex items-center gap-2 mt-2 text-green-600 text-sm">
                    <FaCheckCircle /> Arquivo enviado
                  </div>
                )}
              </div>
            ))}

            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-xs text-yellow-800">
              <strong>⚠️ Importante:</strong> A documentação será verificada
              para garantir a confiabilidade da organização.
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-teal-400 text-white py-3 rounded-md font-semibold shadow-lg hover:from-green-600 hover:to-teal-500 transition-all disabled:opacity-50"
          >
            {loading
              ? "Enviando Solicitação..."
              : "Solicitar Cadastro e Verificação"}
          </button>

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
