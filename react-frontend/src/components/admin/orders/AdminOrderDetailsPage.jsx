import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import AdminLayout from "@components/admin/common/AdminLayout";
import { apiUrl, adminToken } from "@components/common/http";

const fmtMoney = (v) => {
  const n = Number(v || 0);
  return new Intl.NumberFormat("ru-RU").format(n) + " ₽";
};

const fmtDateTime = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("ru-RU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
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

const statusPillClass = (s) => {
  if (s === "delivered") return "bg-green-100 text-green-700 border-green-200";
  if (s === "shipped") return "bg-blue-100 text-blue-700 border-blue-200";
  if (s === "processing") return "bg-yellow-100 text-yellow-800 border-yellow-200";
  if (s === "canceled") return "bg-red-100 text-red-700 border-red-200";
  return "bg-gray-100 text-gray-700 border-gray-200";
};

const AdminOrderDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const token = adminToken();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [order, setOrder] = useState(null);

  // локально для изменения статуса
  const [nextStatus, setNextStatus] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  const headers = useMemo(() => {
    const h = { Accept: "application/json", "Content-Type": "application/json" };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  const fetchOrder = async () => {
    if (!token) {
      setLoading(false);
      setOrder(null);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/admin/orders/${id}`, { headers });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Не удалось загрузить заказ");

      const o = data?.data || null;
      setOrder(o);

      // инициализируем форму смены статуса текущим значением
      setNextStatus(o?.status || "");
      setCancelReason(o?.cancellation_reason || "");
    } catch (e) {
      toast.error(e.message || "Ошибка");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async () => {
    if (!order?.id) return;

    if (nextStatus === "canceled" && !cancelReason.trim()) {
      toast.error("Укажите причину отмены");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${apiUrl}/admin/orders/${order.id}/status`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          status: nextStatus,
          cancellation_reason: nextStatus === "canceled" ? cancelReason.trim() : null,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Не удалось обновить статус");

      toast.success(data?.message || "Статус обновлён");
      const updated = data?.data || null;
      setOrder(updated);

      // синхронизируем поля (на случай, если бэк что-то нормализовал)
      setNextStatus(updated?.status || nextStatus);
      setCancelReason(updated?.cancellation_reason || "");
    } catch (e) {
      toast.error(e.message || "Ошибка");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, id]);

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
              <h1 className="title">Заказ #{id}</h1>

              <button
                onClick={() => navigate(-1)}
                className="btn btn-primary hidden md:block uppercase"
              >
                НАЗАД
              </button>

              <button onClick={() => navigate(-1)} className="md:hidden text-[var(--color-text)]">
                ← Назад
              </button>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/admin/orders"
                className="btn uppercase border border-gray-300 bg-white hover:bg-gray-50"
              >
                К списку
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="text-center text-gray-500 py-10">Загрузка...</div>
          ) : !order ? (
            <div className="bg-white border border-[var(--color-border-light)] p-6 text-center text-gray-500">
              Заказ не найден
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left: main */}
              <div className="lg:col-span-2 space-y-4">
                {/* Order summary */}
                <div className="bg-white border border-[var(--color-border-light)] p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <div className="text-sm text-gray-500">ID: {order.id}</div>
                      <div className="text-sm text-gray-500">Дата: {fmtDateTime(order.created_at)}</div>
                      <div className="text-sm text-gray-500">
                        Обновлён: {fmtDateTime(order.updated_at)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 text-xs rounded border ${statusPillClass(
                          order.status
                        )}`}
                      >
                        {mapStatus(order.status)}
                      </span>
                      <div className="text-lg font-semibold text-[var(--color-text)]">
                        {fmtMoney(order.grand_total ?? order.subtotal ?? 0)}
                      </div>
                    </div>
                  </div>

                  {order.status === "canceled" && order.cancellation_reason ? (
                    <div className="mt-3 p-3 border border-red-200 bg-red-50 text-red-800 text-sm">
                      <div className="font-semibold mb-1">Причина отмены</div>
                      <div className="whitespace-pre-wrap">{order.cancellation_reason}</div>
                    </div>
                  ) : null}
                </div>

                {/* Items */}
                <div className="bg-white border border-[var(--color-border-light)]">
                  <div className="p-4 border-b">
                    <div className="font-semibold text-[var(--color-text)]">Состав заказа</div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[var(--color-bg-block)]">
                        <tr>
                          <th className="p-3 border text-left">Товар</th>
                          <th className="p-3 border">Кол-во</th>
                          <th className="p-3 border">Цена</th>
                          <th className="p-3 border">Сумма</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(order.items || []).map((it, idx) => {
                          const p = it.product || {};
                          const qty = Number(it.quantity ?? it.qty ?? 1);
                          const price = Number(it.price ?? it.unit_price ?? p.price ?? 0);
                          const lineTotal = Number(it.total ?? it.line_total ?? qty * price);

                          return (
                            <tr key={it.id ?? idx} className="text-center">
                              <td className="p-3 border text-left">
                                <div className="flex flex-col">
                                  <span className="font-medium">{p.title || p.name || "Товар"}</span>
                                  <span className="text-xs text-gray-500">
                                    SKU: {p.sku || "-"} • Product ID: {p.id || "-"}
                                  </span>
                                </div>
                              </td>
                              <td className="p-3 border">{qty}</td>
                              <td className="p-3 border">{fmtMoney(price)}</td>
                              <td className="p-3 border font-medium">{fmtMoney(lineTotal)}</td>
                            </tr>
                          );
                        })}

                        {(order.items || []).length === 0 ? (
                          <tr>
                            <td className="p-4 text-center text-gray-500" colSpan={4}>
                              Позиции не найдены
                            </td>
                          </tr>
                        ) : null}
                      </tbody>
                    </table>
                  </div>

                  {/* Totals */}
                  <div className="p-4 border-t">
                    <div className="flex flex-col sm:items-end gap-1 text-sm text-gray-700">
                      <div className="flex justify-between sm:w-80">
                        <span>Подытог</span>
                        <span className="font-medium">{fmtMoney(order.subtotal ?? 0)}</span>
                      </div>

                      {"shipping" in (order || {}) || "shipping_cost" in (order || {}) ? (
                        <div className="flex justify-between sm:w-80">
                          <span>Доставка</span>
                          <span className="font-medium">
                            {fmtMoney(order.shipping ?? order.shipping_cost ?? 0)}
                          </span>
                        </div>
                      ) : null}

                      {"discount" in (order || {}) ? (
                        <div className="flex justify-between sm:w-80">
                          <span>Скидка</span>
                          <span className="font-medium">-{fmtMoney(order.discount ?? 0)}</span>
                        </div>
                      ) : null}

                      {"tax" in (order || {}) ? (
                        <div className="flex justify-between sm:w-80">
                          <span>Налог</span>
                          <span className="font-medium">{fmtMoney(order.tax ?? 0)}</span>
                        </div>
                      ) : null}

                      <div className="flex justify-between sm:w-80 pt-2 border-t mt-2 text-base">
                        <span className="font-semibold">Итого</span>
                        <span className="font-semibold">
                          {fmtMoney(order.grand_total ?? order.subtotal ?? 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: customer + status editor */}
              <div className="space-y-4">
                {/* Customer */}
                <div className="bg-white border border-[var(--color-border-light)] p-4">
                  <div className="font-semibold text-[var(--color-text)] mb-3">Покупатель</div>
                  {order.user ? (
                    <div className="text-sm text-[var(--color-text)] space-y-2">
                      <div>
                        <div className="text-gray-500 text-xs">Имя</div>
                        <div className="font-medium">{order.user.name || "-"}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs">Email</div>
                        <div className="font-medium">{order.user.email || "-"}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs">Телефон</div>
                        <div className="font-medium">{order.user.mobile || "-"}</div>
                      </div>
                      {"id" in order.user ? (
                        <div>
                          <div className="text-gray-500 text-xs">User ID</div>
                          <div className="font-medium">{order.user.id}</div>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">Пользователь не указан</div>
                  )}
                </div>

                {/* Status editor */}
                <div className="bg-white border border-[var(--color-border-light)] p-4">
                  <div className="font-semibold text-[var(--color-text)] mb-3">Статус заказа</div>

                  <label className="text-gray-700 text-xs font-semibold mb-1 block">Новый статус</label>
                  <select
                    value={nextStatus}
                    onChange={(e) => setNextStatus(e.target.value)}
                    className="shadow appearance-none border w-full py-2 px-3 leading-tight
                      focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]
                      bg-white text-[var(--color-text)] border-gray-300"
                  >
                    <option value="new">Новый</option>
                    <option value="processing">В обработке</option>
                    <option value="shipped">В пути</option>
                    <option value="delivered">Доставлен</option>
                    <option value="canceled">Отменён</option>
                  </select>

                  {nextStatus === "canceled" ? (
                    <div className="mt-3">
                      <label className="text-gray-700 text-xs font-semibold mb-1 block">
                        Причина отмены *
                      </label>
                      <textarea
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        rows={4}
                        placeholder="Опишите причину отмены"
                        className="shadow appearance-none border w-full py-2 px-3 leading-tight
                          focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]
                          bg-white text-[var(--color-text)] border-gray-300"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        Причина обязательна при отмене.
                      </div>
                    </div>
                  ) : null}

                  <div className="flex gap-2 mt-4">
                    <button
                      className="btn btn-primary uppercase flex-1"
                      disabled={saving || nextStatus === order.status}
                      onClick={updateStatus}
                    >
                      {saving ? "Сохранение..." : "Сохранить"}
                    </button>
                    <button
                      className="btn uppercase border border-gray-300 bg-white hover:bg-gray-50"
                      disabled={saving}
                      onClick={fetchOrder}
                      title="Перезагрузить заказ"
                    >
                      ↻
                    </button>
                  </div>

                  {nextStatus === order.status ? (
                    <div className="text-xs text-gray-500 mt-2">Статус не изменён.</div>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </AdminLayout>
  );
};

export default AdminOrderDetailsPage;
