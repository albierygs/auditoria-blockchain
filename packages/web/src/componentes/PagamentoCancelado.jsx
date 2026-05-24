import { useEffect, useState } from "react";
import { FaSpinner, FaTimesCircle } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../config/enviroments";

const formatValue = (value) =>
  `R$ ${parseFloat(value).toFixed(2).replace(".", ",")}`;

export default function PagamentoCancelado() {
  const { donationId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonation = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/donations/${donationId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setDonation(data);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchDonation();
  }, [donationId, token]);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-red-100 via-rose-50 to-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-rose-800">
          <FaSpinner className="animate-spin text-2xl" />
          <p className="font-semibold">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-red-100 via-rose-50 to-white flex items-center justify-center">
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-10 border border-red-100 max-w-md w-full text-center">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-20" />
          <div className="relative w-24 h-24 bg-gradient-to-br from-red-400 to-rose-500 rounded-full flex items-center justify-center shadow-lg">
            <FaTimesCircle className="text-white text-4xl" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-red-800 mb-2">
          Pagamento Cancelado
        </h2>
        <p className="text-gray-600 mb-6">
          {donation ? (
            <>
              O pagamento de{" "}
              <span className="font-bold text-red-700">
                {formatValue(donation.value)}
              </span>{" "}
              para{" "}
              <span className="font-semibold">
                {donation.organization?.name || "—"}
              </span>{" "}
              foi cancelado. Sua doação continua pendente e você pode tentar novamente.
            </>
          ) : (
            "O pagamento foi cancelado. Você pode tentar novamente."
          )}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate(`/pagamento/${donationId}`)}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all shadow-md"
          >
            Tentar Novamente
          </button>
          <button
            onClick={() => navigate("/doacao")}
            className="w-full py-3 border-2 border-red-300 text-red-700 rounded-lg font-semibold hover:bg-red-50 transition"
          >
            Voltar para Doações
          </button>
        </div>
      </div>
    </div>
  );
}
