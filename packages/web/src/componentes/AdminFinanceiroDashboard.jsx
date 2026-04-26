// src/componentes/AdminFinanceiroDashboard.jsx
import { useEffect, useState } from "react";
import { FaArrowLeft, FaBuilding, FaChartLine } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/enviroments";

const formatCurrency = (val) =>
  parseFloat(val).toLocaleString("pt-BR", { minimumFractionDigits: 2 });

export default function AdminFinanceiroDashboard() {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [data, setData] = useState(null);
  const token = localStorage.getItem("token");

  // Carregar Orgs
  useEffect(() => {
    fetch(`${API_BASE_URL}/organizations`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setOrganizations);
  }, [token]);

  // Calcular Financeiro ao selecionar Org
  useEffect(() => {
    if (!selectedOrgId) {
      setData(null);
      return;
    }

    const calculate = async () => {
      try {
        const [donations, projects] = await Promise.all([
          fetch(`${API_BASE_URL}/donations?organizationId=${selectedOrgId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((r) => r.json()),
          fetch(`${API_BASE_URL}/organizations/${selectedOrgId}/projects`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((r) => r.json()),
        ]);

        const totalArrecadado = (
          Array.isArray(donations) ? donations : []
        ).reduce(
          (acc, d) =>
            d.status === "CONFIRMED" ? acc + parseFloat(d.value) : acc,
          0
        );

        let totalGasto = 0;
        const projectPromises = (Array.isArray(projects) ? projects : []).map(
          (p) =>
            fetch(`${API_BASE_URL}/projects/${p.public_id}/expenses`, {
              headers: { Authorization: `Bearer ${token}` },
            }).then((r) => r.json())
        );

        const expensesList = await Promise.all(projectPromises);
        expensesList.flat().forEach((e) => {
          if (e.status === "APPROVED" || e.status === "PAID")
            totalGasto += parseFloat(e.value);
        });

        setData({
          totalArrecadado,
          totalGasto,
          saldo: totalArrecadado - totalGasto,
        });
      } catch (e) {
        console.error(e);
      }
    };
    calculate();
  }, [selectedOrgId, token]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-red-100 via-pink-50 to-white">
      <header className="backdrop-blur-md bg-white/80 shadow-md border-b border-red-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/admin-dashboard")}
            className="text-red-600 hover:text-red-700"
          >
            <FaArrowLeft className="text-2xl" />
          </button>
          <h1 className="text-2xl font-bold text-red-800 flex items-center gap-2">
            <FaChartLine /> Dashboard Financeiro Global
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-xl p-6 border border-red-100 mb-8">
          <h2 className="text-lg font-semibold text-red-900 mb-4">
            <FaBuilding className="inline mr-2" /> Selecione a Organização
          </h2>
          <select
            className="w-full p-3 border rounded"
            value={selectedOrgId}
            onChange={(e) => setSelectedOrgId(e.target.value)}
          >
            <option value="">-- Selecione --</option>
            {organizations.map((o) => (
              <option key={o.public_id} value={o.public_id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>

        {data && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow border border-green-100">
              <h3 className="text-gray-500 font-bold">Arrecadado</h3>
              <p className="text-3xl text-green-600 font-bold">
                R$ {formatCurrency(data.totalArrecadado)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow border border-red-100">
              <h3 className="text-gray-500 font-bold">Gasto</h3>
              <p className="text-3xl text-red-600 font-bold">
                R$ {formatCurrency(data.totalGasto)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow border border-blue-100">
              <h3 className="text-gray-500 font-bold">Saldo</h3>
              <p className="text-3xl text-blue-600 font-bold">
                R$ {formatCurrency(data.saldo)}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
