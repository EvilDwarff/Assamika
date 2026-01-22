import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Layout from "./common/Layout";
import { apiUrl, userToken } from "@components/common/http";

const fmtMoney = (v) => {
  const n = Number(v || 0);
  return new Intl.NumberFormat("ru-RU").format(n) + " ₽";
};

const fmtDate = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("ru-RU");
};

const mapStatus = (s) => {
  const m = {
    new: "Новый",
    processing: "В обработке",
    shipped: "В пути",
    delivered: "Доставлен",
    canceled: "Отменён",
  };
  return m[s] || s || "-";
};

const OrdersHistory = () => {
  const navigate = useNavigate();
  const token = userToken();

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  const headers = useMemo(() => {
    const h = { Accept: "application/json" };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setOrders([]);
      return;
    }

    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/orders`, { headers });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) throw new Error(data?.message || "Не удалось загрузить заказы");

        // ожидаем: {status:200, data:[{..., user:{name,email,mobile,address}, items:[...]}]}
        setOrders(Array.isArray(data?.data) ? data.data : []);
      } catch (e) {
        toast.error(e.message || "Ошибка");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [token, headers]);

  if (!token) {
    return (
      <Layout>
        <section className="bg-[var(--color-bg-base)] pt-5 pb-20">
          <div className="container mx-auto px-4">
            <div className="bg-white border border-[var(--color-border-light)] p-6 text-center">
              <p className="text-[var(--color-text)] mb-4">Чтобы посмотреть заказы, нужно войти.</p>
              <button className="btn btn-primary" onClick={() => navigate("/login")}>
                Войти
              </button>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="bg-[var(--color-bg-base)] pt-5 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="title">История заказов</h1>

            <button onClick={() => navigate(-1)} className="btn btn-primary hidden md:block uppercase">
              НАЗАД
            </button>

            <button onClick={() => navigate(-1)} className="md:hidden text-[var(--color-text)]">
              ← Назад
            </button>
          </div>

          {loading ? (
            <div className="text-center text-gray-500 py-10">Загрузка...</div>
          ) : orders.length === 0 ? (
            <div className="text-center text-gray-500 py-10">Заказов пока нет</div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                <table className="w-full border border-[var(--color-border-light)] bg-white">
                  <thead className="bg-[var(--color-bg-block)]">
                    <tr>
                      <th className="p-3 border">#</th>
                      <th className="p-3 border">Имя</th>
                      <th className="p-3 border">Email</th>
                      <th className="p-3 border">Телефон</th>
                      <th className="p-3 border">Стоимость</th>
                      <th className="p-3 border">Дата</th>
                      <th className="p-3 border">Статус</th>
                      <th className="p-3 border">Детали</th>
                    </tr>
                  </thead>

                  <tbody>
                    {orders.map((o, i) => {
                      const u = o.user || {};
                      return (
                        <tr key={o.id} className="text-center">
                          <td className="p-3 border">{i + 1}</td>
                          <td className="p-3 border">{u.name || "-"}</td>
                          <td className="p-3 border">{u.email || "-"}</td>
                          <td className="p-3 border">{u.mobile || "-"}</td>

                          <td className="p-3 border">
                            {fmtMoney(o.grand_total ?? o.subtotal ?? 0)}
                          </td>
                          <td className="p-3 border">{fmtDate(o.created_at)}</td>
                          <td className="p-3 border">{mapStatus(o.status)}</td>

                          <td className="p-3 border">
                            <Link to={`/orders/${o.id}`} className="text-[var(--color-primary)] underline">
                              Посмотреть
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile version */}
              <div className="md:hidden flex flex-col gap-4">
                {orders.map((o, i) => {
                  const u = o.user || {};
                  return (
                    <div key={o.id} className="bg-white border border-[var(--color-border-light)] p-4 rounded">
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold">Заказ #{i + 1}</span>
                        <span className="text-[var(--color-primary)]">{mapStatus(o.status)}</span>
                      </div>

                      <div className="text-sm space-y-1">
                        <p><strong>Имя:</strong> {u.name || "-"}</p>
                        <p><strong>Email:</strong> {u.email || "-"}</p>
                        <p><strong>Телефон:</strong> {u.mobile || "-"}</p>
                        <p><strong>Стоимость:</strong> {fmtMoney(o.grand_total ?? o.subtotal ?? 0)}</p>
                        <p><strong>Дата:</strong> {fmtDate(o.created_at)}</p>
                      </div>

                      <Link to={`/orders/${o.id}`} className="block text-center btn btn-primary mt-4">
                        Посмотреть
                      </Link>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default OrdersHistory;
