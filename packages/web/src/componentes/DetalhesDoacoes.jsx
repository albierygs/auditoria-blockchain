import { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../config/enviroments";

const DetalhesDoacoes = () => {
  const navigate = useNavigate();
  // 1. Obter o ID da doação da URL
  const { id: donationId } = useParams();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!donationId) {
      setError("ID da doação não fornecido.");
      setLoading(false);
      return;
    }

    const fetchDonationDetails = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Token de autenticação não encontrado. Faça login novamente.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          // 2. Chamar o endpoint correto com o ID
          `${API_BASE_URL}/donations/${donationId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message ||
              `Falha ao buscar doação (Status: ${response.status})`
          );
        }

        const data = await response.json();
        setDonation(data);
        setError(null);
      } catch (err) {
        console.error("Erro ao buscar detalhes da doação:", err);
        setError(err.message || "Erro ao carregar os dados.");
      } finally {
        setLoading(false);
      }
    };

    fetchDonationDetails();
  }, [donationId]);

  if (loading) {
    return (
      <div className="text-center p-12">
        <p className="text-gray-600">Carregando detalhes da doação...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-12">
        <p className="text-red-500">Erro: {error}</p>
        <button
          onClick={() => navigate("/historico-doacoes")}
          className="mt-4 text-cyan-600 hover:text-blue-600 hover:underline"
        >
          Voltar ao histórico
        </button>
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="text-center p-12">
        <p className="text-gray-600">Doação não encontrada.</p>
      </div>
    );
  }

  // Funções auxiliares para formatação
  const formatValue = (value) => {
    return `R$ ${parseFloat(value).toFixed(2).replace(".", ",")}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  // Extrair dados aninhados
  const donorName = donation.donor?.person?.name ?? "Doador Anônimo";
  const organizationName =
    donation.organization?.name ?? "Organização Não Encontrada";
  const transactionHash =
    donation.blockchain_transaction?.hash ?? "Não Registrado";

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-white">
      {/* Cabeçalho */}
      <header className="backdrop-blur-md bg-white/70 shadow-md border-b border-cyan-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/historico-doacoes")}
            className="text-cyan-600 hover:text-cyan-700 transition-colors"
          >
            <FaArrowLeft className="text-2xl" />
          </button>
          <h1 className="text-2xl font-bold text-sky-800 tracking-tight">
            Detalhes da Doação: {donation.public_id.substring(0, 8)}...
          </h1>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-cyan-100">
          <h2 className="text-xl font-semibold text-sky-800 mb-6">
            Informações da sua contribuição 💙
          </h2>

          <div className="space-y-4 text-gray-700">
            {/* Dados Principais da Doação */}
            <div className="grid grid-cols-2 gap-4 border-b pb-4">
              <p>
                <strong>ID Pública:</strong> {donation.public_id}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span className="font-bold text-green-700">
                  {donation.status}
                </span>
              </p>
              <p>
                <strong>Valor:</strong> {formatValue(donation.value)}
              </p>
              <p>
                <strong>Data:</strong> {formatDate(donation.date)}
              </p>
              <p>
                <strong>Método de Pagamento:</strong> {donation.payment_method}
              </p>
              <p>
                <strong>Doador:</strong> {donorName}
              </p>
            </div>

            {/* Organização */}
            <h3 className="text-lg font-semibold text-sky-800 pt-4">
              Organização Beneficiada
            </h3>
            <p>
              <strong>Nome:</strong> {organizationName}
            </p>

            {/* Informações Blockchain */}
            <h3 className="text-lg font-semibold text-sky-800 pt-4">
              Registro Blockchain
            </h3>
            <p>
              <strong>Hash:</strong>{" "}
              <span className="break-all text-sm">{transactionHash}</span>
            </p>
            {donation.blockchain_transaction && (
              <p>
                <strong>Rede:</strong> {donation.blockchain_transaction.network}{" "}
                (Status: {donation.blockchain_transaction.status})
              </p>
            )}

            {/* Informações de Alocação */}
            <h3 className="text-lg font-semibold text-sky-800 pt-4">
              Alocações ({donation.allocations.length})
            </h3>
            <div className="space-y-2">
              {donation.allocations.length > 0 ? (
                donation.allocations.map((alloc) => (
                  <div
                    key={alloc.public_id}
                    className="p-2 border rounded bg-gray-50"
                  >
                    <p>
                      <strong>Projeto:</strong> {alloc.project.title}
                    </p>
                    <p>
                      <strong>Valor Alocado:</strong>{" "}
                      {formatValue(alloc.amount_allocated)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">
                  Nenhuma alocação registrada para esta doação.
                </p>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={() => navigate("/historico-doacoes")}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-md font-medium shadow-md hover:from-blue-600 hover:to-cyan-600 transition-all duration-300"
            >
              Voltar ao histórico
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DetalhesDoacoes;
