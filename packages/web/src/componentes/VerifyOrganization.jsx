import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCheck, FaTimes, FaBuilding, FaExclamationTriangle } from "react-icons/fa";
import { API_BASE_URL } from "../config/enviroments";

const VerifyOrganization = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orgData, setOrgData] = useState(null);
  const [brasilApiData, setBrasilApiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRejected, setAutoRejected] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Busca os dados da organização no seu Backend
        const orgResponse = await fetch(`${API_BASE_URL}/organizations/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!orgResponse.ok) throw new Error("Erro ao buscar dados da organização.");
        const org = await orgResponse.json();
        setOrgData(org);

        // Limpa a formatação do CNPJ para a Brasil API (remove . - /)
        const cleanCnpj = org.cnpj.replace(/\D/g, "");

        // 2. Busca dados na Brasil API
        const brasilApiResponse = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
        if (!brasilApiResponse.ok) throw new Error("Erro ao consultar a Brasil API (CNPJ inválido ou indisponível).");
        
        const cnpjData = await brasilApiResponse.json();
        setBrasilApiData(cnpjData);

        // 3. Validação Automática: Se não estiver ATIVA, reprova automaticamente
        if (cnpjData.descricao_situacao_cadastral !== "ATIVA") {
          await autoRejectOrg();
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token]);

  const autoRejectOrg = async () => {
    try {
      await fetch(`${API_BASE_URL}/organizations/${id}/reject`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      setAutoRejected(true);
    } catch (err) {
      console.error("Falha ao auto-reprovar", err);
    }
  };

  const handleApprove = async () => {
    if (!window.confirm("Confirmar a APROVAÇÃO desta organização?")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/organizations/${id}/verify`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Falha ao verificar organização.");
      alert("Organização APROVADA com sucesso!");
      navigate("/admin/organizations");
    } catch (error) {
      alert("Erro ao aprovar: " + error.message);
    }
  };

  const handleReject = async () => {
    if (!window.confirm("Confirmar a REPROVAÇÃO desta organização?")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/organizations/${id}/reject`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Falha ao reprovar organização.");
      alert("Organização REPROVADA com sucesso.");
      navigate("/admin/organizations");
    } catch (error) {
      alert("Erro ao reprovar: " + error.message);
    }
  };

  if (loading) return <div className="p-10 text-center">Analisando dados e consultando Brasil API...</div>;
  if (error) return <div className="p-10 text-center text-red-600">Erro: {error}</div>;

  return (
    <div className="w-full min-h-screen bg-gray-50 p-8">
      <button onClick={() => navigate("/admin/organizations")} className="flex items-center gap-2 text-blue-600 mb-6">
        <FaArrowLeft /> Voltar
      </button>

      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <FaBuilding /> Verificação de Organização
        </h1>

        {autoRejected ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p className="font-bold flex items-center gap-2"><FaExclamationTriangle/> Reprovada Automaticamente</p>
            <p>O CNPJ consultado na Receita Federal consta com situação: <strong>{brasilApiData?.descricao_situacao_cadastral}</strong>.</p>
          </div>
        ) : (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-6">
            <p className="font-bold flex items-center gap-2"><FaCheck/> CNPJ Ativo</p>
            <p>Os dados parecem consistentes. Por favor, faça a revisão manual abaixo.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Coluna 1: Dados informados no cadastro */}
          <div className="border p-4 rounded bg-gray-50">
            <h2 className="font-bold text-lg border-b pb-2 mb-4">Dados Informados (Plataforma)</h2>
            <p><strong>Nome:</strong> {orgData?.name}</p>
            <p><strong>CNPJ:</strong> {orgData?.cnpj}</p>
            <p><strong>Email:</strong> {orgData?.email}</p>
            <p><strong>Telefone:</strong> {orgData?.phone}</p>
            <p><strong>Descrição:</strong> {orgData?.description}</p>
          </div>

          {/* Coluna 2: Dados vindos da Brasil API */}
          <div className="border p-4 rounded bg-blue-50">
            <h2 className="font-bold text-lg border-b border-blue-200 pb-2 mb-4">Dados Oficiais (Brasil API)</h2>
            <p><strong>Razão Social:</strong> {brasilApiData?.razao_social}</p>
            <p><strong>Nome Fantasia:</strong> {brasilApiData?.nome_fantasia || "N/A"}</p>
            <p><strong>Situação:</strong> {brasilApiData?.descricao_situacao_cadastral}</p>
            <p><strong>CNAE Principal:</strong> {brasilApiData?.cnae_fiscal_descricao}</p>
            <p><strong>CEP:</strong> {brasilApiData?.cep}</p>
            <p><strong>Município/UF:</strong> {brasilApiData?.municipio} / {brasilApiData?.uf}</p>
          </div>
        </div>

        {/* Botões de Ação (Só exibe se não foi reprovado automaticamente) */}
        {!autoRejected && (
          <div className="flex gap-4 border-t pt-6 justify-end">
            <button
              onClick={handleReject}
              className="bg-red-600 text-white px-6 py-2 rounded shadow hover:bg-red-700 flex items-center gap-2"
            >
              <FaTimes /> Reprovar Manualmente
            </button>
            <button
              onClick={handleApprove}
              className="bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700 flex items-center gap-2"
            >
              <FaCheck /> Aprovar e Verificar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyOrganization;