import { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaBuilding,
  FaCheck,
  FaClipboardCheck,
  FaExclamationTriangle,
  FaTimes,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../config/enviroments";

const VerifyOrganization = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orgData, setOrgData] = useState(null);
  const [officialData, setOfficialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const orgResponse = await fetch(`${API_BASE_URL}/organizations/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!orgResponse.ok)
          throw new Error("Erro ao buscar dados da organização.");

        const org = await orgResponse.json();
        setOrgData(org);

        const cleanCnpj = org.cnpj.replace(/\D/g, "");

        const cnpjApiResponse = await fetch(
          `https://publica.cnpj.ws/cnpj/${cleanCnpj}`
        );

        if (!cnpjApiResponse.ok)
          throw new Error(
            "Erro ao consultar a API do CNPJ WS (CNPJ inválido ou indisponível)."
          );

        const cnpjData = await cnpjApiResponse.json();
        setOfficialData(cnpjData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token]);

  const handleApprove = async () => {
    if (!window.confirm("Confirmar a APROVAÇÃO desta organização?")) return;
    try {
      const response = await fetch(
        `${API_BASE_URL}/organizations/${id}/verify`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Falha ao verificar organização.");
      alert("Organização APROVADA com sucesso!");
      navigate("/admin/organizations");
    } catch (error) {
      alert("Erro ao aprovar: " + error.message);
    }
  };

  const handleReject = async () => {
    if (!window.confirm("Confirmar a REPROVAÇÃO desta organização?")) return;

    const reason = window.prompt("Motivo da rejeição (opcional):");

    try {
      const response = await fetch(
        `${API_BASE_URL}/organizations/${id}/reject`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason: reason || null }),
        }
      );
      if (!response.ok) throw new Error("Falha ao reprovar organização.");
      alert("Organização REPROVADA com sucesso.");
      navigate("/admin/organizations");
    } catch (error) {
      alert("Erro ao reprovar: " + error.message);
    }
  };

  const getWarnings = () => {
    const warnings = [];
    if (!officialData || !orgData) return warnings;

    const establishment = officialData.estabelecimento;

    // 1. Status Check
    if (establishment?.situacao_cadastral?.toUpperCase() !== "ATIVA") {
      warnings.push(
        `Situação cadastral irregular: ${establishment?.situacao_cadastral || "Desconhecida"}. Recomenda-se rejeição.`
      );
    }

    // 2. Name Match Check
    const nameInDB = orgData.name?.toLowerCase().trim() || "";
    const razaoSocial = officialData.razao_social?.toLowerCase() || "";
    const nomeFantasia = establishment?.nome_fantasia?.toLowerCase() || "";

    const nameMatches =
      razaoSocial.includes(nameInDB) ||
      nameInDB.includes(razaoSocial) ||
      (nomeFantasia &&
        (nomeFantasia.includes(nameInDB) || nameInDB.includes(nomeFantasia)));

    if (!nameMatches) {
      warnings.push(
        `O nome informado na plataforma diverge da Razão Social e Nome Fantasia oficiais.`
      );
    }

    // 3. Donation Profile Check (CNAE and Nature)
    const cnae =
      establishment?.atividade_principal?.descricao?.toLowerCase() || "";
    const nature =
      officialData.natureza_juridica?.descricao?.toLowerCase() || "";

    const validKeywords = [
      "associação",
      "fundação",
      "ong",
      "religiosa",
      "social",
      "filantropia",
      "educação",
      "saúde",
      "beneficente",
    ];

    const isProfileMatch = validKeywords.some(
      (kw) => cnae.includes(kw) || nature.includes(kw)
    );

    if (!isProfileMatch) {
      warnings.push(
        `O ramo de atividade principal não parece se enquadrar no perfil padrão de organizações que recebem doações.`
      );
    }

    return warnings;
  };

  const warnings = getWarnings();

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-100 via-pink-50 to-white text-red-800 font-semibold text-xl">
        Analisando dados e consultando...
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-100 via-pink-50 to-white text-red-600 font-bold text-xl">
        Erro: {error}
      </div>
    );

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-red-100 via-pink-50 to-white">
      <header className="backdrop-blur-md bg-white/80 shadow-md border-b border-red-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/organizations")}
            className="text-red-600 hover:text-red-700 transition-colors"
          >
            <FaArrowLeft className="text-2xl" />
          </button>
          <div className="flex items-center gap-3">
            <FaClipboardCheck className="text-red-800 text-2xl" />
            <h1 className="text-2xl font-bold text-red-800 tracking-tight">
              Verificação de Organização
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-red-100">
          <h2 className="text-xl font-semibold text-red-900 mb-6 border-b border-red-100 pb-2 flex items-center gap-2">
            <FaBuilding className="text-red-600" /> Detalhes da Solicitação
          </h2>

          {/* Aviso de Aprovação Anterior */}
          {orgData?.verification_status === "APPROVED" && (
            <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-5 mb-8 rounded-r-md shadow-sm">
              <h3 className="font-bold flex items-center gap-2 mb-2 text-lg">
                <FaCheck className="text-blue-600" /> Organização já Aprovada
              </h3>
              <p className="text-sm">
                <strong>Aprovada em:</strong>{" "}
                {new Date(orgData.verified_at).toLocaleDateString("pt-BR")}
              </p>
              <p className="text-sm mt-1">
                Você está reanalisando esta organização. Pode aprovar novamente
                ou mudar para reprovação.
              </p>
            </div>
          )}

          {/* Aviso de Rejeição Anterior */}
          {orgData?.verification_status === "REJECTED" && (
            <div className="bg-orange-50 border-l-4 border-orange-500 text-orange-800 p-5 mb-8 rounded-r-md shadow-sm">
              <h3 className="font-bold flex items-center gap-2 mb-2 text-lg">
                <FaTimes className="text-orange-600" /> Organização já Reprovada
              </h3>
              <p className="text-sm">
                <strong>Reprovada em:</strong>{" "}
                {orgData.rejected_at &&
                  new Date(orgData.rejected_at).toLocaleDateString("pt-BR")}
              </p>
              {orgData.rejection_reason && (
                <p className="text-sm mt-1">
                  <strong>Motivo:</strong> {orgData.rejection_reason}
                </p>
              )}
              <p className="text-sm mt-2">
                Você está reanalisando esta organização. Pode aprovar ou manter
                a reprovação.
              </p>
            </div>
          )}

          {/* Alertas de Verificação Automática */}
          {warnings.length > 0 ? (
            <div
              className="bg-red-50 border-l-4 border-red-500 text-red-800 p-5 mb-8 rounded-r-md shadow-sm"
              role="alert"
            >
              <h3 className="font-bold flex items-center gap-2 mb-3 text-lg">
                <FaExclamationTriangle className="text-red-500" /> Atenção:
                Irregularidades Encontradas
              </h3>
              <ul className="list-disc list-inside space-y-1">
                {warnings.map((warn, index) => (
                  <li key={index}>{warn}</li>
                ))}
              </ul>
              <p className="mt-4 text-sm font-semibold">
                Aconselha-se a REJEIÇÃO desta organização ou uma análise manual
                criteriosa.
              </p>
            </div>
          ) : (
            <div className="bg-green-50 border-l-4 border-green-500 text-green-800 p-5 mb-8 rounded-r-md shadow-sm">
              <p className="font-bold flex items-center gap-2 text-lg">
                <FaCheck className="text-green-600" /> Tudo parece correto!
              </p>
              <p className="mt-2">
                Os dados básicos coincidem com o CNPJ ativo e a organização
                parece ter o perfil adequado.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="border border-red-100 p-6 rounded-lg bg-white shadow-sm">
              <h3 className="font-bold text-lg border-b border-red-100 pb-2 mb-4 text-red-800">
                Dados Informados no App
              </h3>
              <div className="space-y-3 text-gray-700">
                <p>
                  <strong className="text-gray-900">Nome:</strong>{" "}
                  {orgData?.name}
                </p>
                <p>
                  <strong className="text-gray-900">CNPJ:</strong>{" "}
                  {orgData?.cnpj}
                </p>
                <p>
                  <strong className="text-gray-900">Email:</strong>{" "}
                  {orgData?.email}
                </p>
                <p>
                  <strong className="text-gray-900">Telefone:</strong>{" "}
                  {"(" +
                    orgData?.phone.substring(0, 2) +
                    ") " +
                    orgData?.phone.substring(2, 7) +
                    "-" +
                    orgData?.phone.substring(7, 11)}
                </p>
                <p>
                  <strong className="text-gray-900">Descrição:</strong>{" "}
                  {orgData?.description}
                </p>
              </div>
            </div>

            <div className="border border-red-100 p-6 rounded-lg bg-red-50/50 shadow-sm">
              <h3 className="font-bold text-lg border-b border-red-100 pb-2 mb-4 text-red-800">
                Dados Oficiais (Receita Federal)
              </h3>
              <div className="space-y-3 text-gray-700">
                <p>
                  <strong className="text-gray-900">Razão Social:</strong>{" "}
                  {officialData?.razao_social}
                </p>
                <p>
                  <strong className="text-gray-900">Nome Fantasia:</strong>{" "}
                  {officialData?.estabelecimento?.nome_fantasia ||
                    "Não registrado"}
                </p>
                <p>
                  <strong className="text-gray-900">Situação:</strong>{" "}
                  <span
                    className={
                      officialData?.estabelecimento?.situacao_cadastral?.toUpperCase() ===
                      "ATIVA"
                        ? "text-green-600 font-semibold"
                        : "text-red-600 font-semibold"
                    }
                  >
                    {officialData?.estabelecimento?.situacao_cadastral}
                  </span>
                </p>
                <p>
                  <strong className="text-gray-900">
                    Atividade Principal:
                  </strong>{" "}
                  {
                    officialData?.estabelecimento?.atividade_principal
                      ?.descricao
                  }
                </p>
                <p>
                  <strong className="text-gray-900">Natureza Jurídica:</strong>{" "}
                  {officialData?.natureza_juridica?.descricao}
                </p>
                <p>
                  <strong className="text-gray-900">CEP:</strong>{" "}
                  {officialData?.estabelecimento?.cep.substring(0, 5) +
                    "-" +
                    officialData?.estabelecimento?.cep.substring(5)}
                </p>
                <p>
                  <strong className="text-gray-900">Município/UF:</strong>{" "}
                  {officialData?.estabelecimento?.cidade?.nome} /{" "}
                  {officialData?.estabelecimento?.estado?.sigla}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 border-t border-red-100 pt-6 justify-end">
            <button
              onClick={handleReject}
              className="bg-white border-2 border-red-600 text-red-600 px-6 py-2.5 rounded-lg shadow-sm hover:bg-red-50 transition flex items-center justify-center gap-2 font-semibold"
            >
              <FaTimes /> Reprovar Cadastro
            </button>
            <button
              onClick={handleApprove}
              className="bg-red-600 text-white px-6 py-2.5 rounded-lg shadow-md hover:bg-red-700 transition flex items-center justify-center gap-2 font-semibold"
            >
              <FaCheck /> Aprovar e Liberar
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VerifyOrganization;
