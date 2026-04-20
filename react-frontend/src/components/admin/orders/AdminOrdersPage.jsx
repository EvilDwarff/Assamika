import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AdminLayout from '@components/admin/common/AdminLayout';
import { apiUrl, adminToken } from "@components/common/http";

const fmtMoney = (v) => {
  const n = Number(v || 0);
  return new Intl.NumberFormat("ru-RU").format(n) + " ₽";
};

const fmtDateTime = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("ru-RU", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
};

const mapStatus = (s) => {
  const m = {
    new: "Новый",
    processing: "В обработке",
    shipped: "В пути",
    paid: "Оплачен",
    canceled: "Отменён",
  };
  return m[s] || s || "-";
};

const statusPillClass = (s) => {
  if (s === "paid") return "bg-green-100 text-green-700 border-green-200";
  if (s === "shipped") return "bg-blue-100 text-blue-700 border-blue-200";
  if (s === "processing") return "bg-yellow-100 text-yellow-800 border-yellow-200";
  if (s === "canceled") return "bg-red-100 text-red-700 border-red-200";
  return "bg-gray-100 text-gray-700 border-gray-200";
};

const AdminOrdersPage = () => {
  const navigate = useNavigate();
  const token = adminToken();

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState(null); // paginate meta
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({
    status: "",
    q: "",
    per_page: 20,
  });

  const headers = useMemo(() => {
    const h = { Accept: "application/json" };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  const fetchOrders = async (pageToLoad = 1) => {
    if (!token) {
      setLoading(false);
      setOrders([]);
      return;
    }

    setLoading(true);
    try {
      const qs = new URLSearchParams();
      qs.set("page", String(pageToLoad));
      qs.set("per_page", String(filters.per_page || 20));
      if (filters.status) qs.set("status", filters.status);
      if (filters.q?.trim()) qs.set("q", filters.q.trim());

      const res = await fetch(`${apiUrl}/admin/orders?${qs.toString()}`, { headers });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Не удалось загрузить заказы");

      // ожидаем paginate: data.data = {data:[...], current_page,...}
      const payload = data?.data;
      setOrders(payload?.data || []);
      setMeta({
        current_page: payload?.current_page ?? pageToLoad,
        last_page: payload?.last_page ?? 1,
        total: payload?.total ?? 0,
        from: payload?.from ?? null,
        to: payload?.to ?? null,
      });
      setPage(payload?.current_page ?? pageToLoad);
    } catch (e) {
      toast.error(e.message || "Ошибка");
      setOrders([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  };

  // initial + whenever filters change
  useEffect(() => {
    fetchOrders(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, filters.status, filters.per_page]);

  const applySearch = () => {
    fetchOrders(1);
  };

  const clearFilters = () => {
    setFilters((p) => ({ ...p, status: "", q: "" }));
    // статус/пер_page вызовут useEffect, а q — нет, поэтому явно:
    setTimeout(() => fetchOrders(1), 0);
  };

  if (!token) {
    return (
      <AdminLayout>
        <section className="bg-[var(--color-bg-base)] pt-5 pb-20">
          <div className="container mx-auto px-4">
            <div className="bg-white border border-[var(--color-border-light)] p-6 text-center">
              <p className="text-[var(--color-text)] mb-4">Нужно войти как администратор.</p>
              <button className="btn btn-primary" onClick={() => navigate("/admin/login")}>
                Войти
              </button>
            </div>
          </div>
        </section>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <section className="bg-[var(--color-bg-base)] pt-5 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center justify-between gap-4">
              <h1 className="title">Заказы</h1>

              {/* <button
                onClick={() => navigate(-1)}
                className="btn btn-primary hidden md:block uppercase"
              >
                НАЗАД
              </button>

              <button
                onClick={() => navigate(-1)}
                className="md:hidden text-[var(--color-text)]"
              >
                ← Назад
              </button> */}
            </div>

            {/* Filters */}
            <div className="bg-white border border-[var(--color-border-light)] p-3 md:p-4 flex flex-col sm:flex-row gap-3 sm:items-end">
              <div className="flex-1 min-w-0">
                <label className="text-gray-700 text-xs font-semibold mb-1 block">Поиск</label>
                <input
                  value={filters.q}
                  onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") applySearch();
                  }}
                  placeholder="ID / имя / email"
                  className="shadow appearance-none border w-full py-2 px-3 leading-tight
                    focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]
                    bg-white text-[var(--color-text)] border-gray-300"
                />
              </div>

              <div className="w-full sm:w-56">
                <label className="text-gray-700 text-xs font-semibold mb-1 block">Статус</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
                  className="shadow appearance-none border w-full py-2 px-3 leading-tight
                    focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]
                    bg-white text-[var(--color-text)] border-gray-300"
                >
                  <option value="">Все</option>
                  <option value="new">Новый</option>
                  <option value="processing">В обработке</option>
                  <option value="shipped">В пути</option>
                  <option value="paid">Оплачен</option>
                  <option value="canceled">Отменён</option>
                </select>
              </div>

              <div className="w-full sm:w-40">
                <label className="text-gray-700 text-xs font-semibold mb-1 block">На странице</label>
                <select
                  value={filters.per_page}
                  onChange={(e) => setFilters((p) => ({ ...p, per_page: Number(e.target.value) }))}
                  className="shadow appearance-none border w-full py-2 px-3 leading-tight
                    focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]
                    bg-white text-[var(--color-text)] border-gray-300"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button className="btn btn-primary uppercase" onClick={applySearch}>
                  Найти
                </button>
                <button className="btn uppercase border border-gray-300 bg-white hover:bg-gray-50" onClick={clearFilters}>
                  Сброс
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="text-center text-gray-500 py-10">Загрузка...</div>
          ) : orders.length === 0 ? (
            <div className="bg-white border border-[var(--color-border-light)] p-6 text-center text-gray-500">
              Заказов не найдено
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden lg:block">
                <div className="bg-white border border-[var(--color-border-light)] overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[var(--color-bg-block)]">
                      <tr>
                        <th className="p-3 border">ID</th>
                        <th className="p-3 border text-left">Покупатель</th>
                        <th className="p-3 border">Телефон</th>
                        <th className="p-3 border">Сумма</th>
                        <th className="p-3 border">Дата</th>
                        <th className="p-3 border">Статус</th>
                        <th className="p-3 border">Детали</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => {
                        const u = o.user || {};
                        return (
                          <tr key={o.id} className="text-center">
                            <td className="p-3 border font-medium">{o.id}</td>
                            <td className="p-3 border text-left">
                              <div className="flex flex-col">
                                <span className="font-medium">{u.name || "-"}</span>
                                <span className="text-xs text-gray-500">{u.email || "-"}</span>
                              </div>
                            </td>
                            <td className="p-3 border">{u.mobile || "-"}</td>
                            <td className="p-3 border">{fmtMoney(o.grand_total ?? o.subtotal ?? 0)}</td>
                            <td className="p-3 border">{fmtDateTime(o.created_at)}</td>
                            <td className="p-3 border">
                              <span className={`inline-flex items-center px-2 py-1 text-xs rounded border ${statusPillClass(o.status)}`}>
                                {mapStatus(o.status)}
                              </span>
                            </td>
                            <td className="p-3 border">
                              <Link
                                to={`/admin/orders/${o.id}`}
                                className="text-[var(--color-primary)] underline"
                              >
                                Открыть
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600">
                    {meta?.from && meta?.to ? (
                      <span>Показано {meta.from}–{meta.to} из {meta.total}</span>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      className="btn border border-gray-300 bg-white hover:bg-gray-50 uppercase"
                      disabled={(meta?.current_page ?? 1) <= 1}
                      onClick={() => fetchOrders((meta?.current_page ?? 1) - 1)}
                    >
                      Назад
                    </button>

                    <span className="text-sm text-gray-700">
                      Стр. {meta?.current_page ?? page} / {meta?.last_page ?? 1}
                    </span>

                    <button
                      className="btn border border-gray-300 bg-white hover:bg-gray-50 uppercase"
                      disabled={(meta?.current_page ?? 1) >= (meta?.last_page ?? 1)}
                      onClick={() => fetchOrders((meta?.current_page ?? 1) + 1)}
                    >
                      Вперёд
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile / Tablet cards */}
              <div className="lg:hidden flex flex-col gap-4">
                {orders.map((o) => {
                  const u = o.user || {};
                  return (
                    <div
                      key={o.id}
                      className="bg-white border border-[var(--color-border-light)] p-4 rounded"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="text-sm text-gray-500">Заказ #{o.id}</div>
                          <div className="font-semibold text-[var(--color-text)] truncate">{u.name || "-"}</div>
                          <div className="text-xs text-gray-500 truncate">{u.email || "-"}</div>
                        </div>

                        <span className={`shrink-0 inline-flex items-center px-2 py-1 text-xs rounded border ${statusPillClass(o.status)}`}>
                          {mapStatus(o.status)}
                        </span>
                      </div>

                      <div className="text-sm mt-3 space-y-1 text-[var(--color-text)]">
                        <div className="flex justify-between gap-3">
                          <span className="text-gray-500">Телефон</span>
                          <span className="font-medium">{u.mobile || "-"}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-gray-500">Сумма</span>
                          <span className="font-medium">{fmtMoney(o.grand_total ?? o.subtotal ?? 0)}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-gray-500">Дата</span>
                          <span className="font-medium">{fmtDateTime(o.created_at)}</span>
                        </div>
                      </div>

                      <Link
                        to={`/admin/orders/${o.id}`}
                        className="block text-center btn btn-primary mt-4 uppercase"
                      >
                        Открыть
                      </Link>
                    </div>
                  );
                })}

                {/* Pagination simple */}
                <div className="flex items-center justify-between mt-2">
                  <button
                    className="btn border border-gray-300 bg-white hover:bg-gray-50 uppercase"
                    disabled={(meta?.current_page ?? 1) <= 1}
                    onClick={() => fetchOrders((meta?.current_page ?? 1) - 1)}
                  >
                    Назад
                  </button>

                  <span className="text-sm text-gray-700">
                    {meta?.current_page ?? page} / {meta?.last_page ?? 1}
                  </span>

                  <button
                    className="btn border border-gray-300 bg-white hover:bg-gray-50 uppercase"
                    disabled={(meta?.current_page ?? 1) >= (meta?.last_page ?? 1)}
                    onClick={() => fetchOrders((meta?.current_page ?? 1) + 1)}
                  >
                    Вперёд
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </AdminLayout>
  );
};

export default AdminOrdersPage;
