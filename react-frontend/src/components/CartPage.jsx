import React, { useEffect, useMemo, useState } from "react";
import Layout from "./common/Layout";
import { apiUrl, apiPhoto, userToken } from "@components/common/http";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const money = (v) => {
  const n = Number(v);
  if (Number.isNaN(n)) return v ?? "-";
  return new Intl.NumberFormat("ru-RU").format(n) + " ₽";
};

const CartPage = () => {
  const navigate = useNavigate();

  const token = userToken();
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null); // itemId который обновляем/удаляем
  const [cart, setCart] = useState(null); // { items:[], subtotal }
  const [shipping, setShipping] = useState(100); // пока статично, позже можно с бэка

  const headers = useMemo(() => {
    const h = { Accept: "application/json" };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  const fetchCart = async () => {
    if (!token) {
      setLoading(false);
      setCart(null);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/cart`, { headers });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Не удалось загрузить корзину");
      }

      // ожидаем {status:200, data:{items:[...], subtotal:...}}
      setCart(data?.data || { items: [], subtotal: 0 });
    } catch (e) {
      toast.error(e.message || "Ошибка");
      setCart({ items: [], subtotal: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const items = cart?.items || [];

  // subtotal: если бэк прислал subtotal — используем, иначе считаем
  const subtotal = useMemo(() => {
    if (cart?.subtotal !== undefined && cart?.subtotal !== null) return Number(cart.subtotal) || 0;

    return items.reduce((sum, it) => {
      const price = Number(it?.price ?? it?.product?.discount_price ?? it?.product?.price ?? 0);
      const qty = Number(it?.qty ?? 1);
      return sum + price * qty;
    }, 0);
  }, [cart?.subtotal, items]);

  const total = subtotal + Number(shipping || 0);

  const ensureAuth = () => {
    if (!token) {
      toast.error("Нужно войти, чтобы пользоваться корзиной");
      // navigate("/login");
      return false;
    }
    return true;
  };

  const updateQty = async (itemId, newQty) => {
    if (!ensureAuth()) return;
    if (newQty < 1) return;

    setBusyId(itemId);
    try {
      const res = await fetch(`${apiUrl}/cart/items/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify({ qty: Number(newQty) }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Не удалось обновить количество");

      setCart(data?.data || { items: [], subtotal: 0 });
      //toast.success("Количество обновлено");
    } catch (e) {
      toast.error(e.message || "Ошибка");
    } finally {
      setBusyId(null);
    }
  };

  const removeItem = async (itemId) => {
    if (!ensureAuth()) return;

    if (!window.confirm("Удалить товар из корзины?")) return;

    setBusyId(itemId);
    try {
      const res = await fetch(`${apiUrl}/cart/items/${itemId}`, {
        method: "DELETE",
        headers,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Не удалось удалить");

      setCart(data?.data || { items: [], subtotal: 0 });
      toast.success("Товар удалён");
    } catch (e) {
      toast.error(e.message || "Ошибка");
    } finally {
      setBusyId(null);
    }
  };

  // UI helpers
  const getLinePrice = (it) => {
    const unitPrice = Number(it?.price ?? it?.product?.discount_price ?? it?.product?.price ?? 0);
    return unitPrice * Number(it?.qty ?? 1);
  };

  const getTitle = (it) => it?.product?.name || it?.title || "Товар";
  const getWeight = (it) => it?.product?.weight || it?.weight || "";
  const getImage = (it) => (it?.product?.image ? `${apiPhoto}/${it.product.image}` : null);
  const qty = (it) => Number(it?.qty ?? it?.quantity ?? 1);

  return (
    <Layout>
      <section className="bg-bg-base pt-4 md:pt-8 pb-12 md:pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {!token ? (
            <div className="bg-bg-block shadow-md p-6 text-center">
              <p className="text-text mb-4">Чтобы пользоваться корзиной, нужно войти в аккаунт.</p>
              <button className="btn btn-primary" onClick={() => navigate("/account/login")}>
                Войти
              </button>
            </div>
          ) : loading ? (
            <div className="text-center text-gray-500 py-16">Загрузка...</div>
          ) : items.length === 0 ? (
            <div className="bg-bg-block shadow-md p-6 text-center">
              <p className="text-text mb-4">Корзина пуста</p>
              <button className="btn btn-primary" onClick={() => navigate("/catalog")}>
                Перейти в каталог
              </button>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
              {/* Левый блок */}
              <div className="w-full lg:w-2/3">
                {items.map((it) => (
                  <div key={it.id} className="py-4 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-8">
                      {/* img */}
                      <div className="flex-shrink-0">
                        {getImage(it) ? (
                          <img
                            src={getImage(it)}
                            alt={getTitle(it)}
                            className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
                          />
                        ) : (
                          <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-100 flex items-center justify-center text-gray-400">
                            нет фото
                          </div>
                        )}
                      </div>

                      {/* text + controls */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center gap-4 sm:flex-row sm:justify-between sm:items-start">
                        {/* text */}
                        <div className="flex-1 min-w-0 flex flex-col justify-start text-left">
                          <h3 className="text-lg font-medium text-text leading-snug whitespace-normal">
                            {getTitle(it)}
                          </h3>
                          {getWeight(it) ? (
                            <p className="text-gray-500 text-sm mt-0.5">{getWeight(it)}</p>
                          ) : null}

                          <button
                            onClick={() => removeItem(it.id)}
                            disabled={busyId === it.id}
                            className="text-gray-500 text-sm flex items-center gap-2 mt-2 hover:text-orange-600 disabled:opacity-60"
                          >
                            <span aria-hidden>🗑</span>
                            {busyId === it.id ? "Удаляем..." : "Удалить"}
                          </button>
                        </div>

                        {/* counter + price */}
                        <div
                          className="flex-shrink-0 flex flex-row justify-between items-center w-full mt-2 pt-4 border-t border-gray-200
                          sm:flex-col sm:items-end sm:w-auto sm:mt-0 sm:pt-0 sm:border-t-0 sm:self-start"
                        >
                          <div className="flex items-center bg-transparent text-text order-1 flex-shrink-0 min-w-max sm:w-full sm:justify-end">
                            <button
                              onClick={() => updateQty(it.id, qty(it) - 1)}
                              disabled={busyId === it.id || qty(it) <= 1}
                              className="px-3 py-1 text-lg font-medium hover:text-orange-600 disabled:opacity-50"
                              aria-label="Уменьшить"
                            >
                              –
                            </button>
                            <span className="px-3 py-1 text-base">{qty(it)}</span>
                            <button
                              onClick={() => updateQty(it.id, qty(it) + 1)}
                              disabled={busyId === it.id}
                              className="ps-3 py-1 text-lg font-medium hover:text-orange-600 disabled:opacity-50"
                              aria-label="Увеличить"
                            >
                              +
                            </button>
                          </div>

                          <div className="text-base sm:text-lg font-medium text-text order-2 sm:mt-2 text-right min-w-max sm:w-full">
                            {money(getLinePrice(it))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Правый блок */}
              <aside className="w-full lg:w-1/3 bg-bg-block shadow-md p-6 lg:min-h-[300px] lg:sticky lg:top-8 self-start">
                <h3 className="text-xl font-medium text-text mb-4">Стоимость заказа</h3>

                <div className="space-y-3 text-base text-text">
                  <div className="flex justify-between">
                    <span>Заказ</span>
                    <span>{money(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Доставка</span>
                    <span>{money(shipping)}</span>
                  </div>
                  <hr className="my-2 border-gray-300" />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Всего:</span>
                    <span>{money(total)}</span>
                  </div>
                </div>

                <button
                  className="w-full mt-6 btn btn-primary uppercase tracking-wider"
                  onClick={() => navigate('/checkout')}
                >
                  Подтвердить
                </button>
              </aside>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default CartPage;
