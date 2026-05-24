import { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaCreditCard,
  FaLock,
  FaSpinner,
  FaTimesCircle,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../config/enviroments";

const formatValue = (value) =>
  `R$ ${parseFloat(value).toFixed(2).replace(".", ",")}`;

export default function Pagamento() {
  const { donationId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    const fetchDonation = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/donations/${donationId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Doação não encontrada");
        const data = await res.json();
        
        if (data.status !== "PENDING") {
          navigate("/historico-doacoes");
        }
        
        setDonation(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDonation();
  }, [donationId, token, navigate]);

  const handleProceedToCheckout = async () => {
    setCheckoutLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE_URL}/donations/${donationId}/checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        }
      );
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Erro ao gerar link de pagamento.");
      }
      
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Link de pagamento não retornado.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-indigo-800">
          <FaSpinner className="animate-spin text-2xl" />
          <p className="font-semibold">Carregando dados da doação...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-white flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-red-200 max-w-md text-center">
          <FaTimesCircle className="text-red-500 text-4xl mx-auto mb-4" />
          <p className="text-red-600 font-semibold">{error}</p>
          <button
            onClick={() => navigate("/doacao")}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-white">
      <header className="backdrop-blur-md bg-white/70 shadow-md border-b border-indigo-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/doacao")}
            className="text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <FaArrowLeft className="text-2xl" />
          </button>
          <div className="flex items-center gap-3">
            <FaLock className="text-indigo-800 text-xl" />
            <h1 className="text-2xl font-bold text-indigo-800 tracking-tight">
              Pagamento Seguro via Stripe
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-xl p-6 border border-indigo-100 mb-6 text-center">
          <p className="text-sm text-gray-500 mb-2">Você está doando para</p>
          <h2 className="text-2xl font-bold text-indigo-900 mb-6">
            {donation?.organization?.name || "—"}
          </h2>
          
          <div className="inline-block bg-indigo-50 px-8 py-6 rounded-2xl border border-indigo-100 mb-8">
            <p className="text-sm text-indigo-600 font-medium mb-1">Valor da Doação</p>
            <p className="text-4xl font-extrabold text-indigo-800">
              {formatValue(donation?.value)}
            </p>
          </div>

          <div className="space-y-4 max-w-sm mx-auto">
            <button
              onClick={handleProceedToCheckout}
              disabled={checkoutLoading}
              className="w-full py-4 flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50"
            >
              {checkoutLoading ? (
                <>
                  <FaSpinner className="animate-spin" /> Processando...
                </>
              ) : (
                <>
                  <FaCreditCard /> Ir para o Pagamento
                </>
              )}
            </button>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <FaLock className="text-green-500" />
              <span>Você será redirecionado para o checkout seguro da Stripe.</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
