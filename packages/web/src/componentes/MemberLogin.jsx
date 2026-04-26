// src/componentes/MemberLogin.jsx
import { useState } from "react";
import { FaEye, FaEyeSlash, FaLock, FaUserTag } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/enviroments";

const MemberLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [memberCode, setMemberCode] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Envia memberCode e password
        body: JSON.stringify({ memberCode, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Assume que o back-end retorna a role principal no campo 'type'
        if (data.type && data.type !== "ORG_MEMBER") {
          alert(
            "Acesso negado: Somente membros da organização podem acessar esta área."
          );
          return;
        }

        alert("Login de membro realizado com sucesso!");
        localStorage.setItem("token", data.token);
        // Redireciona para a nova dashboard de membro
        navigate("/member-dashboard");
      } else {
        alert(data.message || "Código de membro ou senha incorretos!");
      }
    } catch (error) {
      console.error("Erro ao conectar:", error);
      alert("Erro ao conectar ao servidor.");
    }
  };

  return (
    // Padrão de layout centralizado
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/25 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] w-[420px]">
        <div className="flex justify-center items-center mb-4">
          <div className="bg-gradient-to-r from-green-500 to-teal-400 p-3 rounded-full shadow-lg">
            <FaUserTag className="text-white text-3xl" />
          </div>
        </div>

        <h2 className="text-center text-2xl font-extrabold mb-1 text-sky-800">
          Acesso de Membro
        </h2>
        <p className="text-center text-sm text-gray-700 mb-6">
          Utilize seu Código de Membro e senha.
        </p>

        <form className="space-y-5" onSubmit={handleLogin}>
          {/* Código de Membro */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-sky-800">
              Código de Membro
            </label>
            <div className="relative">
              <FaUserTag className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-400" />
              <input
                type="text"
                placeholder="00123"
                value={memberCode}
                onChange={(e) => setMemberCode(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border border-sky-300/60 rounded-md focus:ring-2 focus:ring-teal-400 focus:border-teal-400 bg-white/80 placeholder-sky-300 transition-all"
              />
            </div>
          </div>

          {/* Senha */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-sky-800">Senha</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-10 py-2 border border-sky-300/60 rounded-md focus:ring-2 focus:ring-teal-400 focus:border-teal-400 bg-white/80 placeholder-sky-300 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-400 hover:text-teal-600"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Botão */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-teal-400 text-white py-2 rounded-md font-semibold shadow-lg hover:from-green-600 hover:to-teal-500 transition-all duration-300"
          >
            Entrar
          </button>

          <div className="text-center text-sm">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-cyan-600 hover:text-blue-600 hover:underline font-medium"
            >
              Voltar para ínicio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberLogin;
