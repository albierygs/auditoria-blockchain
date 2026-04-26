// src/componentes/AdminLogin.jsx
import { useState } from "react";
import {
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaUserShield,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/enviroments";

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Endpoint padrão de login
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // --- VERIFICAÇÃO ESTRITA DE ADMIN ---
        if (data.type !== "ADMIN") {
          alert(
            "Acesso Negado: Esta área é restrita a Administradores do Sistema."
          );
          return;
        }

        alert("Acesso Administrativo concedido.");
        localStorage.setItem("token", data.token);
        navigate("/admin-dashboard");
      } else {
        alert(data.message || "Credenciais inválidas.");
      }
    } catch (error) {
      console.error("Erro ao conectar:", error);
      alert("Erro ao conectar ao servidor.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/25 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] w-[420px]">
        {/* Ícone ADMIN (Vermelho) */}
        <div className="flex justify-center items-center mb-4">
          <div className="bg-gradient-to-r from-red-600 to-pink-500 p-3 rounded-full shadow-lg">
            <FaUserShield className="text-white text-3xl" />
          </div>
        </div>

        <h2 className="text-center text-2xl font-extrabold mb-1 text-red-900">
          Painel Administrativo
        </h2>
        <p className="text-center text-sm text-gray-700 mb-6">
          Acesso restrito à gestão global do sistema.
        </p>

        <form className="space-y-5" onSubmit={handleLogin}>
          {/* Email */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-red-800">
              E-mail Administrativo
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400" />
              <input
                type="email"
                placeholder="admin@sistema.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border border-red-300/60 rounded-md focus:ring-2 focus:ring-red-400 focus:border-red-400 bg-white/80 placeholder-red-300 transition-all"
              />
            </div>
          </div>

          {/* Senha */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-red-800">Senha</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-10 py-2 border border-red-300/60 rounded-md focus:ring-2 focus:ring-red-400 focus:border-red-400 bg-white/80 placeholder-red-300 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 hover:text-red-600"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Botão */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-red-600 to-pink-500 text-white py-2 rounded-md font-semibold shadow-lg hover:from-red-700 hover:to-pink-600 transition-all duration-300"
          >
            Acessar Painel
          </button>

          <div className="text-center text-sm">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-red-600 hover:text-red-800 hover:underline font-medium"
            >
              Voltar ao Início
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
