// src/componentes/OrganizationNotifications.jsx
import { useEffect, useState } from "react";
import {
  FaBell,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaTimes,
} from "react-icons/fa";
import { API_BASE_URL } from "../config/enviroments";

const OrganizationNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) return;

      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/notifications/organization`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Falha ao carregar notificações.");

        const data = await response.json();
        setNotifications(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erro ao buscar notificações:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    // Atualizar notificações a cada 30 segundos
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const handleDismiss = async (notificationId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/${notificationId}/dismiss`,
        {
          method: "PUT",
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

  const getNotificationStyle = (type) => {
    switch (type) {
      case "APPROVED":
        return "bg-green-50 border-green-200";
      case "REJECTED":
        return "bg-red-50 border-red-200";
      case "PENDING":
        return "bg-blue-50 border-blue-200";
      case "DONATION":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const unreadCount = notifications.length;

  return (
    <div className="relative">
      {/* Botão de Notificações */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors"
        title="Notificações"
      >
        <FaBell className="text-2xl" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Painel de Notificações */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-teal-50">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FaBell /> Notificações
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              {unreadCount} {unreadCount === 1 ? "notificação" : "notificações"} não lida(s)
            </p>
          </div>

          {loading ? (
            <div className="p-6 text-center text-gray-500">
              Carregando notificações...
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-500 text-sm">
              Erro ao carregar notificações
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Você não tem notificações no momento.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-l-4 flex gap-3 ${getNotificationStyle(
                    notification.type
                  )}`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(notification.created_at).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDismiss(notification.id)}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          )}

          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 text-center">
              <button
                onClick={() => setNotifications([])}
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

export default OrganizationNotifications;
