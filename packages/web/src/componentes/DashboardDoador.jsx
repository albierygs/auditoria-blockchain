import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { FaHeart, FaSignOutAlt, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/enviroments";

const DashboardDoador = () => {
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    nome: "",
    email: "",
    telefone: "",
    cidade: "",
    estado: "",
    cpf: "",
    dataNascimento: "",
    criadoEm: "",
  });

  // 🔐 Verificar se o usuário está logado
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Sessão expirada. Faça login novamente.");
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        // 🔑 Decodificar o token para obter o ID
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.publicId; // Supondo que o payload tem um campo 'id'

        // 🌐 Função assíncrona para buscar os dados
        const fetchUserData = async () => {
          try {
            const response = await fetch(`${API_BASE_URL}/donors/${userId}`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                // 🛡️ Enviar o token no cabeçalho Authorization
                Authorization: `Bearer ${token}`,
              },
            });

            if (!response.ok) {
              // Se a resposta não for 200 OK, lança um erro
              throw new Error("Falha ao buscar dados do usuário.");
            }

            const data = await response.json();

            const dataToSave = {
              nome: data.name,
              email: data.email,
              telefone: data.phone,
              cidade: data.city,
              estado: data.state,
              cpf: data.document,
              dataNascimento: data.birth_date,
              criadoEm: data.created_at,
            };

            // 💾 Salvar os dados no localStorage e no estado
            localStorage.setItem("userData", JSON.stringify(dataToSave));
            setUserData(dataToSave);
          } catch (error) {
            console.error("Erro ao buscar dados do doador:", error);
            // Opcional: Tratar o erro (ex: alert, logout)
            alert(
              "Não foi possível carregar o perfil. Por favor, tente novamente."
            );
            // navigate("/login"); // Você pode optar por deslogar em caso de erro grave
          }
        };

        fetchUserData();
      } catch (error) {
        console.error("Erro ao decodificar token:", error);
        // Tratar o caso de token inválido, forçando o logout
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        alert("Token inválido. Faça login novamente.");
        navigate("/login");
      }
    }
  }, [navigate]);

  // 🔐 Logout correto
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const donorName = userData?.nome ? userData.nome.split(" ")[0] : "doador(a)";

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-white overflow-y-auto">
      {/* Cabeçalho */}
      <header className="backdrop-blur-md bg-white/80 border-b border-cyan-100 shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo e título */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-lg shadow-sm">
              <FaHeart className="text-white text-2xl" />
            </div>
            <h1 className="text-2xl font-extrabold text-sky-800 tracking-tight">
              Plataforma de Doações
            </h1>
          </div>

          {/* Ações de usuário */}
          <div className="flex items-center gap-4">
            {/* Perfil */}
            <button
              onClick={() => navigate("/perfil")}
              className="flex items-center gap-2 text-sky-800 hover:text-cyan-600 transition"
            >
              <FaUser className="text-xl" />
              <span>Perfil</span>
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="text-sky-800 hover:text-red-500 transition"
            >
              <FaSignOutAlt className="text-xl" />
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <section className="text-center">
          <h2 className="text-3xl font-semibold text-sky-900 mb-4">
            Bem-vindo(a) de volta, {donorName} 💙
          </h2>

          <p className="text-gray-600 mb-8">
            Obrigado por continuar transformando vidas através das suas
            contribuições.
          </p>

          {/* Card principal */}
          <div className="bg-white/80 backdrop-blur-lg border border-cyan-100 rounded-xl shadow-lg p-8 inline-block mb-12">
            <p className="text-lg text-gray-700 mb-3">
              Veja o histórico de suas ações solidárias ou descubra novas formas
              de ajudar.
            </p>
            <button
              onClick={() => navigate("/historico-doacoes")}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded-md font-semibold shadow-md hover:from-blue-600 hover:to-cyan-600 transition-all duration-300"
            >
              Ver todas as doações →
            </button>
          </div>

          {/* Título da seção de atalhos */}
          <h3 className="text-2xl font-semibold text-sky-900 mb-6">
            Ações rápidas
          </h3>

          {/* Atalhos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
            {/* 🟦 Doação */}
            <div
              onClick={() => navigate("/doacao")}
              className="cursor-pointer bg-white/70 backdrop-blur-lg border border-cyan-100 
                         p-6 rounded-xl shadow-md hover:bg-white/90 transition-all duration-300"
            >
              <h4 className="text-xl text-sky-800 font-semibold mb-2">
                Doação
              </h4>
              <p className="text-gray-600">
                Registrar ou consultar doações recentes.
              </p>
            </div>

            {/* ⛓ Blockchain */}
            <div
              onClick={() => navigate("/blockchain")}
              className="cursor-pointer bg-white/70 backdrop-blur-lg border border-cyan-100 
                         p-6 rounded-xl shadow-md hover:bg-white/90 transition-all duration-300"
            >
              <h4 className="text-xl text-sky-800 font-semibold mb-2">
                Blockchain
              </h4>
              <p className="text-gray-600">
                Acompanhar transações com total transparência.
              </p>
            </div>

            {/* 🎯 Alocação */}
            <div
              onClick={() => navigate("/alocacao")}
              className="cursor-pointer bg-white/70 backdrop-blur-lg border border-cyan-100 
                         p-6 rounded-xl shadow-md hover:bg-white/90 transition-all duration-300"
            >
              <h4 className="text-xl text-sky-800 font-semibold mb-2">
                Alocação
              </h4>
              <p className="text-gray-600">
                Ver como as doações foram distribuídas.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardDoador;
