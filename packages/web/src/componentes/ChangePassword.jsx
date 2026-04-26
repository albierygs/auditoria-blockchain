import { useState } from "react";
import { API_BASE_URL } from "../config/enviroments";

export default function ChangePassword() {
  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNewp] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword: currentPassword,
          newPassword: newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Senha alterada com sucesso!");
      } else {
        alert(
          "Erro ao alterar senha: " + (data.message || "Erro desconhecido.")
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white p-6 rounded-xl shadow"
    >
      <h3 className="text-lg font-semibold">Trocar senha</h3>

      <input
        type="password"
        placeholder="Senha atual"
        value={currentPassword}
        onChange={(e) => setCurrent(e.target.value)}
        className="w-full px-4 py-2 border rounded-md"
        required
      />

      <input
        type="password"
        placeholder="Nova senha"
        value={newPassword}
        onChange={(e) => setNewp(e.target.value)}
        className="w-full px-4 py-2 border rounded-md"
        required
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-emerald-600 text-white px-4 py-2 rounded-md"
      >
        {loading ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
