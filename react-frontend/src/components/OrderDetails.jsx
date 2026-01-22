import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Layout from "./common/Layout";
import OrderItem from "./common/OrderItem";
import { apiUrl, apiPhoto, userToken } from "@components/common/http";

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

const mapPay = (pm) => {
  const m = {
    cash: "Наличными при получении",
    card: "Картой при получении",
  };
  return m[pm] || pm || "-";
};

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = userToken();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);

  const headers = useMemo(() => {
    const h = { Accept: "application/json" };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setOrder(null);
      return;
    }

    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/orders/${id}`, { headers });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || "Не удалось загрузить заказ");
        setOrder(data?.data || null);
      } catch (e) {
        toast.error(e.message || "Ошибка");
        setOrder(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, token, headers]);

  const user = order?.user || {};
  const items = order?.items || [];

  const subtotal = useMemo(() => {
    if (order?.subtotal !== undefined && order?.subtotal !== null) return Number(order.subtotal) || 0;
    return items.reduce(
      (s, it) => s + Number(it.line_total || (Number(it.price || 0) * Number(it.qty || 0))),
      0
    );
  }, [order?.subtotal, items]);

  const shipping = useMemo(() => Number(order?.shipping || 0), [order?.shipping]);
  const total = useMemo(
    () => Number(order?.grand_total || (subtotal + shipping)),
    [order?.grand_total, subtotal, shipping]
  );

  const uiItems = useMemo(() => {
    return items.map((it) => {
      const p = it?.product || null;

      return {
        id: it.id,
        title: it.name || p?.name || "Товар",
        weight: p?.weight || "",
        price: Number(it.price || p?.discount_price || p?.price || 0),
        quantity: Number(it.qty || 0),
        image: p?.image ? `${apiPhoto}/${p.image}` : null,
      };
    });
  }, [items]);

  if (!token) {
    return (
      <Layout>
        <section className="pb-20 pt-5 bg-[var(--color-bg-base)]">
          <div className="container mx-auto px-4">
            <div className="bg-white border border-[var(--color-border-light)] p-6 text-center">
              <p className="text-[var(--color-text)] mb-4">Чтобы посмотреть заказ, нужно войти.</p>
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
      <section className="pb-20 pt-5 bg-[var(--color-bg-base)]">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="title">Детали заказа №{id}</h1>

            <button onClick={() => navigate(-1)} className="btn btn-primary hidden md:block uppercase">
              НАЗАД
            </button>

            <button onClick={() => navigate(-1)} className="md:hidden text-[var(--color-text)]">
              ← Назад
            </button>
          </div>

          {loading ? (
            <div className="text-center text-gray-500 py-10">Загрузка...</div>
          ) : !order ? (
            <div className="text-center text-gray-500 py-10">Заказ не найден</div>
          ) : (
            <>
              {/* Info */}
              <div className="grid md:grid-cols-4 gap-6 mb-10 text-[var(--color-text)]">
                <div className="flex flex-col">
                  <span className="text-sm text-text font-bold mb-1">Дата</span>
                  <span className="text-base font-medium">{fmtDate(order.created_at)}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-sm text-text font-bold mb-1">Статус</span>
                  <span className="text-base font-medium">{mapStatus(order.status)}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-sm text-text font-bold mb-1">Адрес доставки</span>
                  <span className="text-base font-medium">{user.address || "-"}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-sm text-text font-bold mb-1">Оплата</span>
                  <span className="text-base font-medium">{mapPay(order.payment_method)}</span>
                </div>

                {/* Контакты (имя / телефон / почта) */}
                {/* <div className="flex flex-col md:col-span-4">
                  <span className="text-sm text-text font-bold mb-1">Контакты</span>
                  <span className="text-base font-medium">
                    {user.name || "-"} · {user.mobile || "-"} · {user.email || "-"}
                  </span>
                </div>

                {order.comment ? (
                  <div className="flex flex-col md:col-span-4">
                    <span className="text-sm text-text font-bold mb-1">Комментарий</span>
                    <span className="text-base font-medium">{order.comment}</span>
                  </div>
                ) : null} */}
              </div>

              {/* Body */}
              <div className="flex flex-col lg:flex-row gap-10">
                {/* Products */}
                <div className="flex-1">
                  <h2 className="text-xl text-[var(--color-text)] mb-3">Товары</h2>

                  <div className="divide-y divide-[var(--color-border-light)]">
                    {uiItems.map((item) => (
                      <OrderItem key={item.id} item={item} />
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <aside className="w-full lg:w-1/3 bg-[var(--color-bg-block)] p-6 h-fit">
                  <h3 className="text-xl font-semibold mb-4">Стоимость заказа</h3>

                  <div className="space-y-2 text-[var(--color-text)]">
                    <div className="flex justify-between">
                      <span>Заказ</span>
                      <span>{fmtMoney(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Доставка</span>
                      <span>{fmtMoney(shipping)}</span>
                    </div>

                    <hr className="my-3 border-[var(--color-border-light)]" />

                    <div className="flex justify-between font-bold text-lg">
                      <span>Всего:</span>
                      <span>{fmtMoney(total)}</span>
                    </div>
                  </div>
                </aside>
              </div>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default OrderDetails;
