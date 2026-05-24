// src/componentes/Doacao.jsx
import { useEffect, useState } from "react";
import { FaArrowLeft, FaArrowRight, FaDonate } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/enviroments";

// Funções auxiliares para formatação
const formatValue = (value) => {
  return `R$ ${parseFloat(value).toFixed(2).replace(".", ",")}`;
};

export default function Doacao() {
  const [doacoes, setDoacoes] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loadingOrg, setLoadingOrg] = useState(true);
  const [loadingDonations, setLoadingDonations] = useState(true);
  const [errorOrg, setErrorOrg] = useState(null);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    organization_id: "",
    value: "",
  });

  const TOKEN_KEY = "token";

  useEffect(() => {
    carregarDoacoes();
    carregarOrganizacoes();
  }, []);

  const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
  };

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
      // Endpoint para listar organizações verificadas
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

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

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

    try {
      const payload = {
        organization_id: form.organization_id,
        value: Number(form.value),
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

      const data = await response.json();
      navigate(`/pagamento/${data.public_id}`);
    } catch (error) {
      console.log("Erro ao registrar doação:", error);
      alert(`Erro ao registrar doação: ${error.message}`);
    }
  };

  return (
    // NOVO LAYOUT: Fundo gradiente
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-white">
      {/* NOVO LAYOUT: Cabeçalho fixo com botão de voltar */}
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

      {/* NOVO LAYOUT: Conteúdo principal centralizado com max-width */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* BOX 1: Formulário de Doação */}
        <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-cyan-100 mb-8">
          <h2 className="text-xl font-semibold text-sky-800 mb-6">
            Preencha os dados da sua nova contribuição 🤝
          </h2>

          <form onSubmit={enviarDoacao} className="space-y-4">
            {/* Seletor de Organização */}
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
                {/* Mapeamento das organizações carregadas de /api/organizations/verified */}
                {organizations.map((org) => (
                  <option key={org.public_id} value={org.public_id}>
                    {org.name}
                  </option>
                ))}
              </select>
              {errorOrg && <p className="text-red-500 text-sm">{errorOrg}</p>}
            </div>

            {/* Valor */}
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



            {/* Botão de Envio */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-md font-semibold shadow-md hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={
                !form.organization_id ||
                !form.value ||
                Number(form.value) <= 0 ||
                loadingOrg
              }
            >
              Prosseguir para Pagamento <FaArrowRight />
            </button>
          </form>
        </div>

        {/* BOX 2: Lista de Doações Realizadas */}
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
                    {d.status === "PENDING" && (
                      <button
                        onClick={() => navigate(`/pagamento/${d.public_id}`)}
                        className="px-4 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-sm hover:bg-amber-600 transition-colors flex-shrink-0"
                      >
                        Continuar Pagamento
                      </button>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-xs mt-2">
                    <p className="text-gray-500">
                      Status:{" "}
                      <span
                        className={`font-semibold px-2 py-0.5 rounded-full ${
                          d.status === "CONFIRMED"
                            ? "bg-green-100 text-green-700"
                            : d.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {d.status}
                      </span>
                    </p>
                    {d.blockchain_transaction?.hash && (
                      <p className="text-cyan-600 font-mono text-xs">
                        Hash: {d.blockchain_transaction.hash.substring(0, 10)}
                        ...
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
