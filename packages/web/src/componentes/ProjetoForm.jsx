// src/componentes/ProjetoForm.jsx
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaEdit, FaEye, FaPlus } from "react-icons/fa"; // Adicionado ícone de olho
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../config/enviroments";

// Funções auxiliares
const toISODate = (dateString) => {
  if (!dateString) return "";
  return dateString.split("T")[0];
};
const formatCurrency = (value) => {
  if (value === null || value === undefined) return "R$ 0,00";
  return parseFloat(value).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export default function ProjetoForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    goal_amount: "",
    start_date: toISODate(new Date().toISOString()),
    end_date: "",
    collected_amount: 0,
    status: "DRAFT",
  });

  const [loading, setLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState(null);
  const [isViewOnly, setIsViewOnly] = useState(false); // Estado para controlar modo leitura

  const isNewProject = !id;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/member-login");
      return;
    }

    const fetchData = async () => {
      try {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.publicId;
        const userRole = decodedToken.memberRole;

        // ** SEGURANÇA DE FRONT-END **
        // Se não for ORG_ADMIN, só pode ver (somente leitura).
        // Se tentar criar novo projeto e não for admin, bloqueia.
        if (userRole !== "ORG_ADMIN") {
          if (isNewProject) {
            alert(
              "Acesso negado: Apenas administradores podem criar projetos."
            );
            navigate("/projetos");
            return;
          }
          setIsViewOnly(true);
        }

        // 1. Buscar ID da Organização
        const memberRes = await fetch(`${API_BASE_URL}/members/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (memberRes.ok) {
          const memberData = await memberRes.json();
          setOrganizationId(memberData.organization_id);
        }

        if (id) {
          // 2. Buscar Dados do Projeto Existente
          const projectRes = await fetch(`${API_BASE_URL}/projects/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!projectRes.ok) throw new Error("Falha ao carregar projeto.");

          const data = await projectRes.json();

          setForm({
            title: data.title || "",
            description: data.description || "",
            goal_amount: parseFloat(data.goal_amount) || "",
            start_date: toISODate(data.start_date),
            end_date: toISODate(data.end_date),
            collected_amount: parseFloat(data.collected_amount) || 0,
            status: data.status || "DRAFT",
          });
        } else {
          // Novo Projeto
          setForm((prev) => ({
            ...prev,
            status: "DRAFT",
            start_date: toISODate(new Date().toISOString()),
          }));
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        alert("Erro ao carregar dados do projeto: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate, isNewProject]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const enviar = async (e) => {
    e.preventDefault();
    // Bloqueio extra no submit
    if (isViewOnly) return;

    setLoading(true);
    const token = localStorage.getItem("token");

    const numericGoalAmount = Number(form.goal_amount);

    if (numericGoalAmount <= 0) {
      alert("A meta financeira deve ser um valor positivo.");
      setLoading(false);
      return;
    }

    const payload = {
      title: form.title,
      description: form.description,
      goal_amount: numericGoalAmount,
      start_date: form.start_date,
      end_date: form.end_date || null,
    };

    if (!isNewProject) {
      payload.status = form.status;
    }

    const metodo = isNewProject ? "POST" : "PUT";
    let url;

    if (isNewProject) {
      if (!organizationId) {
        alert("Não foi possível determinar a organização.");
        setLoading(false);
        return;
      }
      url = `${API_BASE_URL}/organizations/${organizationId}/projects`;
    } else {
      url = `${API_BASE_URL}/projects/${id}`;
    }

    try {
      const response = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao salvar projeto.");
      }

      alert(`Projeto ${isNewProject ? "criado" : "atualizado"} com sucesso!`);
      navigate("/projetos");
    } catch (error) {
      console.error("Erro ao salvar projeto:", error);
      alert("Erro ao salvar projeto: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-teal-50 to-white">
        <p className="text-teal-800 font-semibold">Carregando formulário...</p>
      </div>
    );
  }

  // Define o ícone e título baseado no contexto
  let headerIcon = <FaEdit className="text-teal-800" />;
  let headerTitle = "Editar Projeto";

  if (isNewProject) {
    headerIcon = <FaPlus className="text-teal-800" />;
    headerTitle = "Novo Projeto";
  } else if (isViewOnly) {
    headerIcon = <FaEye className="text-teal-800" />;
    headerTitle = "Detalhes do Projeto";
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-green-100 via-teal-50 to-white">
      <header className="backdrop-blur-md bg-white/80 shadow-md border-b border-teal-100">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/projetos")}
            className="text-teal-600 hover:text-teal-700 transition-colors"
          >
            <FaArrowLeft className="text-2xl" />
          </button>
          <div className="flex items-center gap-3">
            {headerIcon}
            <h1 className="text-2xl font-bold text-teal-800 tracking-tight">
              {headerTitle}
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-teal-100">
          <h2 className="text-xl font-semibold text-sky-800 mb-6">
            Informações ({form.status})
          </h2>

          <form onSubmit={enviar} className="space-y-4">
            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título
              </label>
              <input
                name="title"
                className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-teal-400 bg-white/80"
                value={form.title}
                onChange={handleChange}
                required
                // Desabilitado se for ViewOnly OU carregando
                disabled={isViewOnly || loading}
              />
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                name="description"
                className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-teal-400 bg-white/80"
                value={form.description}
                onChange={handleChange}
                required
                disabled={isViewOnly || loading}
              />
            </div>

            {/* Meta e Arrecadado */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Financeira (R$)
                </label>
                <input
                  name="goal_amount"
                  type="number"
                  className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-teal-400 bg-white/80"
                  value={form.goal_amount}
                  onChange={handleChange}
                  required
                  min="0.01"
                  step="0.01"
                  disabled={isViewOnly || loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Arrecadado
                </label>
                <input
                  name="collected_amount"
                  type="text"
                  className="border p-3 rounded-lg w-full bg-gray-100 text-gray-600 cursor-not-allowed"
                  value={formatCurrency(form.collected_amount)}
                  disabled // Sempre desabilitado (calculado)
                />
              </div>
            </div>

            {/* Data Início e Data Término */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Início
                </label>
                <input
                  name="start_date"
                  type="date"
                  // Se for viewOnly ou Edição (não novo), fica disabled
                  className={`border p-3 rounded-lg w-full ${
                    !isNewProject || isViewOnly
                      ? "bg-gray-100 text-gray-600"
                      : "focus:ring-2 focus:ring-teal-400 bg-white/80"
                  }`}
                  value={form.start_date}
                  onChange={handleChange}
                  required
                  disabled={!isNewProject || isViewOnly || loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Término (Opcional)
                </label>
                <input
                  name="end_date"
                  type="date"
                  className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-teal-400 bg-white/80"
                  value={form.end_date}
                  onChange={handleChange}
                  disabled={isViewOnly || loading}
                />
              </div>
            </div>

            {/* Status */}
            {isNewProject || (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-teal-400 bg-white/80"
                  value={form.status}
                  onChange={handleChange}
                  required
                  disabled={isViewOnly || loading}
                >
                  <option value="DRAFT">Rascunho (DRAFT)</option>
                  <option value="ACTIVE">Ativo (ACTIVE)</option>
                  <option value="PAUSED">Pausado (PAUSED)</option>
                  <option value="FINISHED">Finalizado (FINISHED)</option>
                  <option value="CANCELLED">Cancelado (CANCELLED)</option>
                </select>
              </div>
            )}

            {/* Botão Salvar (Oculto se for View Only) */}
            {!isViewOnly && (
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-500 to-green-600 text-white py-3 rounded-md font-semibold shadow-md hover:from-teal-600 hover:to-green-700 transition-all duration-300 disabled:bg-gray-400"
                disabled={loading}
              >
                {loading
                  ? "Salvando..."
                  : isNewProject
                    ? "Criar Projeto"
                    : "Atualizar Projeto"}
              </button>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}
