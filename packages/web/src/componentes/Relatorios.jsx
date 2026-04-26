// src/componentes/Relatorios.jsx
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaDownload, FaFileExport } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/enviroments";

export default function Relatorios() {
  const navigate = useNavigate();
  const [organizationId, setOrganizationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    tipo: "DOACOES",
  });

  const token = localStorage.getItem("token");

  // --- LÓGICA PARA OBTER O ID DA ORGANIZAÇÃO ---
  useEffect(() => {
    const fetchOrganizationId = async () => {
      if (!token) {
        navigate("/member-login");
        return;
      }

      try {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.publicId;

        // Busca o ID da Organização do Membro
        const memberResponse = await fetch(
          `${API_BASE_URL}/members/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!memberResponse.ok)
          throw new Error("Falha ao obter dados do membro.");

        const memberData = await memberResponse.json();
        const orgId = memberData.organization_id;

        if (!orgId) {
          throw new Error("Membro não associado a uma organização ativa.");
        }
        setOrganizationId(orgId);
      } catch (err) {
        console.error("Erro ao obter ID da organização:", err);
        setError(err.message || "Erro desconhecido ao carregar dados.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrganizationId();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, token]);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // --- LÓGICA DE EXPORTAÇÃO ---
  const exportar = async (e) => {
    e.preventDefault();

    if (!organizationId) {
      alert(
        "Não foi possível identificar a organização para exportar os dados."
      );
      return;
    }

    if (!form.tipo) {
      alert("Selecione um tipo de relatório para exportar.");
      return;
    }

    try {
      const params = new URLSearchParams();
      // Inclui o tipo de relatório e o ID da organização como filtro
      params.append("tipo", form.tipo);
      params.append("organizationId", organizationId);

      // Endpoint de exportação (URL assumida)
      const response = await fetch(
        `${API_BASE_URL}/relatorios/export?${params.toString()}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Falha na exportação do relatório."
        );
      }

      // Processa a resposta como blob (arquivo)
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `relatorio_${form.tipo.toLowerCase()}_${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      alert(`Relatório de ${form.tipo} exportado com sucesso!`);
    } catch (exportError) {
      console.error("Erro ao exportar relatório:", exportError);
      alert(`Erro ao exportar relatório: ${exportError.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-teal-50 to-white">
        <p className="text-teal-800 font-semibold">
          Preparando painel de relatórios...
        </p>
      </div>
    );
  }

  return (
    // NOVO LAYOUT: Padrão de Membro
    <div className="w-full min-h-screen bg-gradient-to-br from-green-100 via-teal-50 to-white">
      {/* NOVO LAYOUT: Cabeçalho fixo */}
      <header className="backdrop-blur-md bg-white/80 shadow-md border-b border-teal-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/member-dashboard")}
            className="text-teal-600 hover:text-teal-700 transition-colors"
          >
            <FaArrowLeft className="text-2xl" />
          </button>
          <div className="flex items-center gap-3">
            <FaFileExport className="text-teal-800 text-2xl" />
            <h1 className="text-2xl font-bold text-teal-800 tracking-tight">
              Exportação de Relatórios
            </h1>
          </div>
        </div>
      </header>

      {/* NOVO LAYOUT: Conteúdo principal centralizado */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-teal-100">
          <h2 className="text-xl font-semibold text-sky-800 mb-6">
            Gerar Relatório da Organização
          </h2>

          {error ? (
            <p className="text-red-500 mb-4 font-medium">
              Erro de Acesso: {error}
            </p>
          ) : (
            <form
              onSubmit={exportar}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {/* Filtro de Tipo (Tipo Único) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Relatório
                </label>
                <select
                  name="tipo"
                  className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-teal-400 bg-white/80"
                  value={form.tipo}
                  onChange={handle}
                >
                  <option value="DOACOES">Doações</option>
                  <option value="ALOCACOES">Alocações</option>
                  <option value="PROJETOS">Projetos</option>
                  <option value="FINANCEIRO">Financeiro</option>
                </select>
              </div>

              {/* Espaço para o botão */}
              <div className="md:col-span-1 flex items-end pt-2">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-teal-500 to-green-600 text-white py-3 rounded-md font-semibold shadow-md hover:from-teal-600 hover:to-green-700 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <FaDownload /> Exportar (.CSV)
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Aviso de remoção da listagem */}
        <p className="mt-8 text-sm text-gray-500 text-center">
          * A funcionalidade de visualização em tabela (listagem) foi removida
          para focar exclusivamente na exportação de documentos.
        </p>
      </main>
    </div>
  );
}
