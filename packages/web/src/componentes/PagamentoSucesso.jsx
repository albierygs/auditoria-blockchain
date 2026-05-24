import { useEffect, useState } from "react";
import { FaCheckCircle, FaSpinner } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../config/enviroments";

const formatValue = (value) =>
  `R$ ${parseFloat(value).toFixed(2).replace(".", ",")}`;

export default function PagamentoSucesso() {
  const { donationId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [donation, setDonation] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  // Poll the donation status every 3 seconds until it's confirmed
  useEffect(() => {
    if (confirmed) return;

    const poll = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/donations/${donationId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setDonation(data);
        if (data.status === "CONFIRMED") {
          setConfirmed(true);
        }
      } catch {
        // silently retry
      }
    };

    poll(); // first call immediately
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [donationId, token, confirmed]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-white flex items-center justify-center">
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-10 border border-green-100 max-w-md w-full text-center">
        {!confirmed ? (
          <>
            {/* Loading / Waiting for webhook */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 bg-amber-300 rounded-full animate-ping opacity-20" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                <FaSpinner className="text-white text-4xl animate-spin" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-amber-800 mb-2">
              Processando Pagamento...
            </h2>
            <p className="text-gray-600 mb-6">
              Estamos aguardando a confirmação do seu pagamento pela Stripe.
              Isso pode levar alguns segundos.
            </p>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center justify-center gap-2 text-amber-700">
                <FaSpinner className="animate-spin text-sm" />
                <span className="text-sm font-medium">
                  Aguardando confirmação...
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Confirmed */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <FaCheckCircle className="text-white text-4xl" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-green-800 mb-2">
              Doação realizada com sucesso!
            </h2>
            <p className="text-gray-600 mb-6">
              Sua contribuição de{" "}
              <span className="font-bold text-green-700">
                {donation ? formatValue(donation.value) : "—"}
              </span>{" "}
              para{" "}
              <span className="font-semibold">
                {donation?.organization?.name || "—"}
              </span>{" "}
              foi confirmada.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate("/historico-doacoes")}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-md"
              >
                Ver Histórico de Doações
              </button>
              <button
                onClick={() => navigate("/doacao")}
                className="w-full py-3 border-2 border-green-300 text-green-700 rounded-lg font-semibold hover:bg-green-50 transition"
              >
                Fazer Nova Doação
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
