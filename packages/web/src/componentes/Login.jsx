// src/componentes/Login.jsx
import { useState } from "react";
import { FaEnvelope, FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/enviroments";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // --- VERIFICAÇÃO DA ROLE/TYPE ---
        // O usuário solicitou a verificação do campo 'type' na resposta.
        if (data.type && data.type !== "DONOR") {
          alert(
            "Acesso negado: Somente doadores podem acessar esta interface."
          );
          // Não armazena o token e impede a navegação
          return;
        }

        alert("Login realizado com sucesso!");
        localStorage.setItem("token", data.token);
        navigate("/dashboard");
      } else {
        alert(data.message || "E-mail ou senha incorretos!");
      }
    } catch (error) {
      console.error("Erro ao conectar:", error);
      alert("Erro ao conectar ao servidor.");
    }
  };

  return (
    // Centralização do layout (min-h-screen flex items-center justify-center)
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/25 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] w-[420px]">
        {/* Ícone */}
        <div className="flex justify-center items-center mb-4">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-400 p-3 rounded-full shadow-lg">
            <FaLock className="text-white text-3xl" />
          </div>
        </div>

        {/* Link Esqueci a senha */}
        <div className="flex justify-end mb-2">
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="text-sm text-cyan-600 hover:text-blue-600 hover:underline font-medium"
          >
            Esqueci minha senha
          </button>
        </div>

        {/* Título */}
        <h2 className="text-center text-2xl font-extrabold mb-1 text-sky-800">
          Bem-vindo de volta
        </h2>
        <p className="text-center text-sm text-gray-700 mb-6">
          Acesse sua conta e continue transformando vidas 💙
        </p>

        {/* Formulário */}
        <form className="space-y-5" onSubmit={handleLogin}>
          {/* Email */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-sky-800">E-mail</label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-400" />
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border border-sky-300/60 rounded-md focus:ring-2 focus:ring-sky-400 focus:border-sky-400 bg-white/80 placeholder-sky-300 transition-all"
              />
            </div>
          </div>

          {/* Senha */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-sky-800">Senha</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-10 py-2 border border-sky-300/60 rounded-md focus:ring-2 focus:ring-sky-400 focus:border-sky-400 bg-white/80 placeholder-sky-300 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sky-400 hover:text-sky-600"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Botão */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white py-2 rounded-md font-semibold shadow-lg hover:from-blue-600 hover:to-cyan-500 transition-all duration-300"
          >
            Entrar
          </button>

          {/* Link Cadastro */}
          <div className="text-center text-sm">
            <span className="text-gray-700">Não tem uma conta? </span>
            <a
              href="/register-donor"
              className="text-cyan-600 hover:text-blue-600 hover:underline font-medium"
            >
              Cadastre-se
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
