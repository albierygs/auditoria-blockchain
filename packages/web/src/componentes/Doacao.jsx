import { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaDonate,
  FaCalendarAlt,
  FaCheckCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/enviroments";

// Formata o valor para o padrão brasileiro: R$ 100,00
const formatValue = (value) => {
  return `R$ ${parseFloat(value).toFixed(2).replace(".", ",")}`;
};

export default function Doacao() {
  // Lista de doações já registradas
  const [doacoes, setDoacoes] = useState([]);

  // Lista de organizações verificadas
  const [organizations, setOrganizations] = useState([]);

  // Estados de carregamento e erro
  const [loadingOrg, setLoadingOrg] = useState(true);
  const [loadingDonations, setLoadingDonations] = useState(true);
  const [errorOrg, setErrorOrg] = useState(null);

  const navigate = useNavigate();

  // Estado principal do formulário
  const [form, setForm] = useState({
    organization_id: "",
    value: "",
    payment_method: "PIX",

    // Campos usados para doação recorrente
    is_recurring: false,
    recurring_frequency: "MONTHLY",
    recurring_end_date: "",
  });

  const TOKEN_KEY = "token";

  // Ao abrir a tela, carrega doações e organizações
  useEffect(() => {
    carregarDoacoes();
    carregarOrganizacoes();
  }, []);

  // Busca o token salvo no navegador
  const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
  };

  // Carrega a lista de doações do usuário
  const carregarDoacoes = async () => {
    setLoadingDonations(true);

    const token = getToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const response = await fetch(`${API_BASE_URL}/donations/`, {
        headers,
      });

      const data = await response.json();

      const lista = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : [];

      setDoacoes(lista);
    } catch (error) {
      console.log("Erro ao carregar doações:", error);
      setDoacoes([]);
    } finally {
      setLoadingDonations(false);
    }
  };

  // Carrega organizações verificadas para aparecerem no select
  const carregarOrganizacoes = async () => {
    setLoadingOrg(true);
    setErrorOrg(null);

    const token = getToken();

    if (!token) {
      setErrorOrg("Token de autorização não encontrado. Faça login novamente.");
      setLoadingOrg(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/organizations/verified`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
      }

      const data = await response.json();

      const lista = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : [];

      setOrganizations(lista);
    } catch (error) {
      console.error("Erro ao carregar organizações:", error);
      setOrganizations([]);
      setErrorOrg(`Falha ao carregar organizações: ${error.message}.`);
    } finally {
      setLoadingOrg(false);
    }
  };

  // Atualiza o formulário.
  // Se for checkbox, salva true/false.
  // Se for input/select normal, salva o value.
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Envia a doação para o backend
  const enviarDoacao = async (e) => {
    e.preventDefault();

    const token = getToken();

    if (!token) {
      alert("Você precisa estar logado para fazer uma doação.");
      return;
    }

    if (!form.organization_id || !form.value || Number(form.value) <= 0) {
      alert("Por favor, preencha a organização e o valor da doação.");
      return;
    }

    // Se for doação recorrente, a data final se torna obrigatória
    if (form.is_recurring && !form.recurring_end_date) {
      alert("Por favor, defina a data de término para doações recorrentes.");
      return;
    }

    try {
      // Monta os dados que serão enviados para a API
      const payload = {
        organization_id: form.organization_id,
        value: Number(form.value),
        payment_method: form.payment_method,

        // Campos de recorrência
        is_recurring: form.is_recurring,
        recurring_frequency: form.is_recurring
          ? form.recurring_frequency
          : null,
        recurring_end_date: form.is_recurring ? form.recurring_end_date : null,
      };

      const response = await fetch(`${API_BASE_URL}/donations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Falha no envio (Status: ${response.status})`
        );
      }

      // Atualiza a lista após registrar
      await carregarDoacoes();

      // Limpa o formulário
      setForm({
        organization_id: "",
        value: "",
        payment_method: "PIX",
        is_recurring: false,
        recurring_frequency: "MONTHLY",
        recurring_end_date: "",
      });

      const tipoDoacao = form.is_recurring
        ? `Doação recorrente (${form.recurring_frequency.toLowerCase()}) registrada com sucesso!`
        : "Doação registrada com sucesso!";

      alert(tipoDoacao);
    } catch (error) {
      console.log("Erro ao registrar doação:", error);
      alert(`Erro ao registrar doação: ${error.message}`);
    }
  };

  // Define a data mínima como hoje + 1 mês
  const getMinRecurringDate = () => {
    const today = new Date();
    const minDate = new Date(today.setMonth(today.getMonth() + 1));

    return minDate.toISOString().split("T")[0];
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-white">
      <header className="backdrop-blur-md bg-white/70 shadow-md border-b border-cyan-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-cyan-600 hover:text-cyan-700 transition-colors"
          >
            <FaArrowLeft className="text-2xl" />
          </button>

          <div className="flex items-center gap-3">
            <FaDonate className="text-sky-800 text-2xl" />
            <h1 className="text-2xl font-bold text-sky-800 tracking-tight">
              Fazer uma Doação
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-cyan-100 mb-8">
          <h2 className="text-xl font-semibold text-sky-800 mb-6">
            Preencha os dados da sua nova contribuição 🤝
          </h2>

          <form onSubmit={enviarDoacao} className="space-y-4">
            {/* Organização que receberá a doação */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Organização
              </label>

              <select
                name="organization_id"
                className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 bg-white/80"
                value={form.organization_id}
                onChange={handleChange}
                disabled={loadingOrg || errorOrg}
              >
                <option value="">
                  {loadingOrg
                    ? "Carregando organizações..."
                    : errorOrg
                      ? "Erro ao carregar organizações"
                      : "Selecione uma organização"}
                </option>

                {organizations.map((org) => (
                  <option key={org.public_id} value={org.public_id}>
                    {org.name}
                  </option>
                ))}
              </select>

              {errorOrg && <p className="text-red-500 text-sm">{errorOrg}</p>}
            </div>

            {/* Valor da doação */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Valor (R$)
              </label>

              <input
                name="value"
                type="number"
                placeholder="Ex: 100.00"
                className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 bg-white/80"
                value={form.value}
                onChange={handleChange}
                min="0.01"
                step="0.01"
              />
            </div>

            {/* Método escolhido para pagamento */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Método de Pagamento
              </label>

              <select
                name="payment_method"
                className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 bg-white/80"
                value={form.payment_method}
                onChange={handleChange}
              >
                <option value="PIX">PIX</option>
                <option value="CREDIT">Cartão de Crédito</option>
                <option value="DEBIT">Débito</option>
                <option value="TRANSFER">Transferência</option>
                <option value="BANK_SLIP">Boleto</option>
              </select>
            </div>

            {/* Área responsável por ativar ou desativar doação recorrente */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  id="is_recurring"
                  name="is_recurring"
                  checked={form.is_recurring}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />

                <label
                  htmlFor="is_recurring"
                  className="text-sm font-semibold text-gray-800 flex items-center gap-2 cursor-pointer"
                >
                  <FaCalendarAlt /> Fazer uma doação mensal recorrente
                </label>
              </div>

              {/* Campos que só aparecem quando a recorrência está ativa */}
              {form.is_recurring && (
                <div className="space-y-3 mt-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Frequência de Recorrência
                    </label>

                    <select
                      name="recurring_frequency"
                      className="border p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-sm"
                      value={form.recurring_frequency}
                      onChange={handleChange}
                    >
                      <option value="MONTHLY">Mensal</option>
                      <option value="QUARTERLY">Trimestral</option>
                      <option value="YEARLY">Anual</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Data de Término (Obrigatório)
                    </label>

                    <input
                      type="date"
                      name="recurring_end_date"
                      className="border p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-sm"
                      value={form.recurring_end_date}
                      onChange={handleChange}
                      min={getMinRecurringDate()}
                    />

                    <p className="text-xs text-gray-600 mt-1">
                      A doação será renovada automaticamente até a data
                      definida.
                    </p>
                  </div>

                  {/* Resumo visual da recorrência escolhida */}
                  <div className="bg-white p-3 rounded border border-blue-100 text-sm">
                    <p className="text-gray-700">
                      <FaCheckCircle className="inline text-green-500 mr-2" />
                      <strong>Resumo:</strong> R$ {form.value || "0,00"}{" "}
                      {form.recurring_frequency === "MONTHLY"
                        ? "por mês"
                        : form.recurring_frequency === "QUARTERLY"
                          ? "a cada 3 meses"
                          : "por ano"}{" "}
                      até {form.recurring_end_date || "data não definida"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-md font-semibold shadow-md hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={
                !form.organization_id ||
                !form.value ||
                Number(form.value) <= 0 ||
                loadingOrg ||
                (form.is_recurring && !form.recurring_end_date)
              }
            >
              {form.is_recurring
                ? "Registrar Doação Recorrente"
                : "Registrar Doação"}
            </button>
          </form>
        </div>

        {/* Lista das últimas doações */}
        <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-cyan-100">
          <h2 className="text-xl font-semibold text-sky-800 mb-6">
            Doações Recentes
          </h2>

          {loadingDonations ? (
            <p className="text-gray-600">Carregando doações...</p>
          ) : !Array.isArray(doacoes) || doacoes.length === 0 ? (
            <p className="text-gray-600">Nenhuma doação registrada ainda.</p>
          ) : (
            <div className="space-y-4">
              {doacoes.slice(0, 5).map((d, index) => (
                <div
                  key={d.public_id ?? d.id ?? index}
                  className="border border-cyan-100 p-4 rounded-lg shadow-sm bg-white hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-lg text-sky-800">
                        {formatValue(d.value)}
                      </p>

                      <p className="text-sm text-gray-600">
                        Organização:{" "}
                        <span className="font-medium text-gray-800">
                          {d.organization?.name || "—"}
                        </span>
                      </p>
                    </div>

                    {/* Selo exibido apenas para doações recorrentes */}
                    {d.is_recurring && (
                      <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                        <FaCalendarAlt /> Recorrente
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-xs mt-2">
                    <p className="text-gray-500">
                      Status: <span className="font-medium">{d.status}</span>
                    </p>

                    {d.blockchain_transaction?.hash && (
                      <p className="text-cyan-600 font-mono text-xs">
                        Hash: {d.blockchain_transaction.hash.substring(0, 10)}
                        ...
                      </p>
                    )}
                  </div>

                  {/* Mostra a próxima cobrança somente se a doação for recorrente */}
                  {d.is_recurring && (
                    <p className="text-xs text-blue-600 mt-2">
                      Próxima cobrança:{" "}
                      {new Date(d.next_charge_date).toLocaleDateString("pt-BR")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
