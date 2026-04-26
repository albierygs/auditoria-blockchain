// src/componentes/ForgotPassword.jsx
import { useState } from "react";
import { FaEnvelope } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/enviroments";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      alert(
        data.message || "Se o email existir, enviaremos o link de recuperação."
      );
      navigate("/login");
    } catch (error) {
      console.error(error);
      alert("Erro ao tentar recuperar senha.");
    }

    setLoading(false);
  };

  return (
    // Adicionando classes para centralizar o conteúdo na tela
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/25 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] w-[420px]">
        {/* Ícone */}
        <div className="flex justify-center items-center mb-4">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-400 p-3 rounded-full shadow-lg">
            <FaEnvelope className="text-white text-3xl" />
          </div>
        </div>

        <h2 className="text-center text-2xl font-extrabold mb-1 text-sky-800">
          Recuperar senha
        </h2>
        <p className="text-center text-sm text-gray-700 mb-6">
          Enviaremos um link de redefinição para o seu e-mail.
        </p>

        <form onSubmit={handleForgot} className="space-y-5">
          {/* Email */}
          <div>
            <label className="text-sm font-medium text-sky-800">E-mail</label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-400" />
              <input
                type="email"
                placeholder="seu@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-sky-300/60 rounded-md focus:ring-2 focus:ring-sky-400 focus:border-sky-400 bg-white/80 placeholder-sky-300"
              />
            </div>
          </div>

          {/* Botão */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white py-2 rounded-md font-semibold shadow-lg hover:from-blue-600 hover:to-cyan-500 transition-all"
          >
            {loading ? "Enviando..." : "Enviar link"}
          </button>

          {/* Voltar */}
          <div className="text-center text-sm">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-cyan-600 hover:text-blue-600 hover:underline font-medium"
            >
              Voltar para o login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
