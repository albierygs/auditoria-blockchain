// src/componentes/NotificationCenter.jsx
import { useEffect, useState, useCallback } from "react";
import {
  FaBell,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaTimes,
  FaCheck,
} from "react-icons/fa";
import { API_BASE_URL } from "../config/enviroments";

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPanel, setShowPanel] = useState(false);
  const [filter, setFilter] = useState("ALL"); // ALL, UNREAD, APPROVED, REJECTED, DONATION
  const token = localStorage.getItem("token");

  // Buscar notificações
  const fetchNotifications = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Falha ao carregar notificações.");

      const data = await response.json();
      setNotifications(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error("Erro ao buscar notificações:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
    // Atualizar notificações a cada 30 segundos
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Marcar notificação como lida
  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n
          )
        );
      }
    } catch (err) {
      console.error("Erro ao marcar como lida:", err);
    }
  };

  // Descartar notificação
  const handleDismiss = async (notificationId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/${notificationId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        setNotifications((prev) =>
          prev.filter((n) => n.id !== notificationId)
        );
      }
    } catch (err) {
      console.error("Erro ao descartar notificação:", err);
    }
  };

  // Marcar todas como lidas
  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/mark-all-read`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, read: true }))
        );
      }
    } catch (err) {
      console.error("Erro ao marcar todas como lidas:", err);
    }
  };

  // Filtrar notificações
  const getFilteredNotifications = () => {
    if (filter === "ALL") return notifications;
    if (filter === "UNREAD") return notifications.filter((n) => !n.read);
    return notifications.filter((n) => n.type === filter);
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Ícone por tipo
  const getNotificationIcon = (type) => {
    switch (type) {
      case "APPROVED":
        return <FaCheckCircle className="text-green-500 text-xl" />;
      case "REJECTED":
        return <FaExclamationTriangle className="text-red-500 text-xl" />;
      case "PENDING":
        return <FaInfoCircle className="text-blue-500 text-xl" />;
      case "DONATION":
        return <FaBell className="text-yellow-500 text-xl" />;
      default:
        return <FaBell className="text-gray-500 text-xl" />;
    }
  };

  // Estilo por tipo
  const getNotificationStyle = (type) => {
    switch (type) {
      case "APPROVED":
        return "bg-green-50 border-l-4 border-green-500";
      case "REJECTED":
        return "bg-red-50 border-l-4 border-red-500";
      case "PENDING":
        return "bg-blue-50 border-l-4 border-blue-500";
      case "DONATION":
        return "bg-yellow-50 border-l-4 border-yellow-500";
      default:
        return "bg-gray-50 border-l-4 border-gray-500";
    }
  };

  return (
    <div className="relative">
      {/* Botão de Notificações */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors rounded-full hover:bg-gray-100"
        title="Notificações"
      >
        <FaBell className="text-2xl" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Painel de Notificações */}
      {showPanel && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col">
          {/* Cabeçalho */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-teal-50 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FaBell /> Notificações
              </h3>
              <button
                onClick={() => setShowPanel(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {unreadCount} {unreadCount === 1 ? "notificação" : "notificações"} não lida(s)
            </p>
          </div>

          {/* Filtros */}
          <div className="p-3 border-b border-gray-100 bg-gray-50 flex-shrink-0 flex gap-2 overflow-x-auto">
            {["ALL", "UNREAD", "APPROVED", "REJECTED", "DONATION"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  filter === f
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
              >
                {f === "ALL" ? "Todas" : f === "UNREAD" ? "Não Lidas" : f}
              </button>
            ))}
          </div>

          {/* Conteúdo */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-6 text-center text-gray-500">
                Carregando notificações...
              </div>
            ) : error ? (
              <div className="p-6 text-center text-red-500 text-sm">
                Erro ao carregar notificações
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                Nenhuma notificação encontrada.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 flex gap-3 hover:bg-gray-50 transition-colors ${getNotificationStyle(
                      notification.type
                    )} ${!notification.read ? "bg-opacity-100" : "bg-opacity-50"}`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold text-gray-800 ${!notification.read ? "font-bold" : ""}`}>
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notification.created_at).toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <div className="flex-shrink-0 flex gap-2">
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Marcar como lida"
                        >
                          <FaCheck className="text-sm" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDismiss(notification.id)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title="Descartar"
                      >
                        <FaTimes className="text-sm" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rodapé */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50 flex-shrink-0 text-center">
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
              >
                Marcar todas como lidas
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
