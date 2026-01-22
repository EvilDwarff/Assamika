import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Layout from "./common/Layout";
import OrderItem from "./common/OrderItem";
import { apiUrl, apiPhoto, userToken } from "@components/common/http";

const InputField = ({ label, name, value, onChange, type = "text", disabled = false }) => (
  <div className="flex flex-col">
    <label htmlFor={name} className="text-gray-700 text-sm font-semibold mb-2">
      {label}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      value={value ?? ""}
      onChange={onChange}
      disabled={disabled}
      className={`shadow appearance-none border w-full py-2 px-3 leading-tight
        focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]
        bg-white text-[var(--color-text)] border-gray-300
        ${disabled ? "opacity-70 cursor-not-allowed" : ""}`}
    />
  </div>
);

const SelectField = ({ label, name, options, value, onChange }) => (
  <div className="flex flex-col">
    <label htmlFor={name} className="text-gray-700 text-sm font-semibold mb-2">
      {label}
    </label>
    <select
      id={name}
      name={name}
      value={value ?? ""}
      onChange={onChange}
      className="shadow appearance-none border w-full py-2 px-3 leading-tight
        focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]
        cursor-pointer bg-white text-[var(--color-text)] border-gray-300"
    >
      <option value="" disabled hidden>
        Выберите способ
      </option>

      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

const CheckoutPage = () => {
  const navigate = useNavigate();
  const token = userToken();

  const [cartItems, setCartItems] = useState([]); // items из /api/cart
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "", // mobile
    email: "",
    address: "",
    payment_method: "",
    comment: "",
  });

  const authHeaders = useMemo(() => {
    const h = { Accept: "application/json" };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  // 1) грузим корзину + профиль
  useEffect(() => {
    if (!token) {
      setLoading(false);
      setCartItems([]);
      return;
    }

    (async () => {
      setLoading(true);
      try {
        const [cartRes, accRes] = await Promise.all([
          fetch(`${apiUrl}/cart`, { headers: authHeaders }),
          fetch(`${apiUrl}/get-account-details`, { headers: authHeaders }),
        ]);

        const cartJson = await cartRes.json().catch(() => ({}));
        const accJson = await accRes.json().catch(() => ({}));

        if (!cartRes.ok) throw new Error(cartJson?.message || "Ошибка загрузки корзины");
        if (!accRes.ok) throw new Error(accJson?.message || "Ошибка загрузки профиля");

        setCartItems(cartJson?.data?.items || []);

        // у тебя бэк обычно возвращает {status:200,data:{...}}
        const u = accJson?.data || {};
        setFormData((p) => ({
          ...p,
          name: u.name || "",
          email: u.email || "",
          phone: u.mobile || "",
          address: u.address || "",
        }));
      } catch (e) {
        toast.error(e?.message || "Ошибка загрузки");
      } finally {
        setLoading(false);
      }
    })();
  }, [token, authHeaders]);

  // 2) расчёты
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const p = item.product || {};
      const unit =
        p.discount_price && Number(p.discount_price) > 0
          ? Number(p.discount_price)
          : Number(p.price || 0);
      return sum + unit * Number(item.qty || 0);
    }, 0);
  }, [cartItems]);

  const shipping = 0; // у тебя на бэке shipping=0
  const total = subtotal + shipping;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleBack = () => navigate("/cart");

  const uiItems = cartItems.map((i) => {
    const p = i.product || {};
    const price =
      p.discount_price && Number(p.discount_price) > 0
        ? Number(p.discount_price)
        : Number(p.price || 0);

    return {
      id: i.id,
      title: p.name,
      weight: p.weight,
      price,
      quantity: i.qty,
      image: p.image ? `${apiPhoto}/${p.image}` : null,
    };
  });

  // 3) submit: сначала update-profile, потом orders
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Нужно войти в аккаунт");
      navigate("/login");
      return;
    }

    if (!formData.name.trim()) return toast.error("Введите имя");
    if (!formData.phone.trim()) return toast.error("Введите телефон");
    if (!formData.address.trim()) return toast.error("Введите адрес");
    if (!formData.payment_method) return toast.error("Выберите способ оплаты");

    setSubmitting(true);

    try {
      // A) обновляем профиль (чтобы в БД сохранились телефон/адрес)
      const updRes = await fetch(`${apiUrl}/update-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,   // если у тебя бэк валидирует email — оставляем
          mobile: formData.phone,
          address: formData.address,
        }),
      });

      const updJson = await updRes.json().catch(() => ({}));
      if (!updRes.ok) {
        const msg =
          updJson?.message ||
          (updJson?.errors ? Object.values(updJson.errors)?.[0]?.[0] : null) ||
          "Не удалось обновить профиль";
        throw new Error(msg);
      }

      // B) создаём заказ (новая структура!)
      const orderRes = await fetch(`${apiUrl}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          payment_method: formData.payment_method,
          comment: formData.comment,
        }),
      });

      const orderJson = await orderRes.json().catch(() => ({}));
      if (!orderRes.ok) {
        const msg =
          orderJson?.message ||
          (orderJson?.errors ? Object.values(orderJson.errors)?.[0]?.[0] : null) ||
          "Ошибка создания заказа";
        throw new Error(msg);
      }

      toast.success("Заказ создан!");
      navigate("/orders");
    } catch (err) {
      toast.error(err?.message || "Ошибка оформления заказа");
    } finally {
      setSubmitting(false);
    }
  };

  // если не залогинен
  if (!token) {
    return (
      <Layout>
        <section className="bg-[var(--color-bg-base)] pt-4 md:pt-8 pb-12 md:pb-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="bg-[var(--color-bg-block)] p-6 shadow text-center">
              <div className="text-text mb-4">Чтобы оформить заказ, нужно войти.</div>
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
      <section className="bg-[var(--color-bg-base)] pt-4 md:pt-8 pb-12 md:pb-20">
        <div className="container mx-auto px-4 sm:px-6 ">
          <div className="flex justify-between items-center mb-6 md:mb-10">
            <h1 className="title">Подтверждение заказа</h1>

            <button onClick={handleBack} className="px-6 py-2 btn btn-primary hidden sm:block uppercase">
              НАЗАД
            </button>

            <button onClick={handleBack} className="p-2 text-gray-600 sm:hidden" aria-label="Назад">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="text-center text-gray-500 py-10">Загрузка...</div>
          ) : uiItems.length === 0 ? (
            <div className="text-center text-gray-500 py-10">Корзина пуста</div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
              <div className="w-full lg:w-2/3">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                  {/* Имя */}
                  <InputField label="Имя" name="name" value={formData.name} onChange={handleInputChange} />

                  {/* Телефон */}
                  <InputField label="Телефон" name="phone" value={formData.phone} onChange={handleInputChange} type="tel" />

                  {/* ✅ Email под телефоном */}
                  <InputField
                    label="Почта"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    type="email"
                    disabled
                  />

                  {/* Адрес */}
                  <InputField label="Адрес" name="address" value={formData.address} onChange={handleInputChange} />

                  <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SelectField
                      label="Способ оплаты"
                      name="payment_method"
                      value={formData.payment_method}
                      onChange={handleInputChange}
                      options={[
                        { value: "cash", label: "Наличными при получении" },
                        { value: "card", label: "Картой при получении" },
                      ]}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-gray-700 text-sm font-semibold mb-2 block">Комментарий</label>
                    <textarea
                      name="comment"
                      value={formData.comment}
                      onChange={handleInputChange}
                      className="shadow appearance-none border w-full py-2 px-3 text-gray-700 leading-tight
                        focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]
                        bg-white border-gray-300 min-h-[90px]"
                    />
                  </div>
                </form>

                <h2 className="text-xl md:text-2xl font-normal text-[var(--color-text)] border-t border-[var(--color-border-light)] pt-6">
                  Товары
                </h2>
                <div className="divide-y divide-[var(--color-border-light)]">
                  {uiItems.map((item) => (
                    <OrderItem key={item.id} item={item} />
                  ))}
                </div>
              </div>

              <aside className="w-full lg:w-1/3 p-6 bg-[var(--color-bg-block)] lg:sticky lg:top-22 self-start">
                <h3 className="text-xl font-medium text-[var(--color-text)] mb-4">Стоимость заказа</h3>

                <div className="space-y-3 text-base text-[var(--color-text)]">
                  <div className="flex justify-between">
                    <span>Заказ</span>
                    <span className="font-medium">{subtotal} ₽</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Доставка</span>
                    <span className="font-medium">{shipping} ₽</span>
                  </div>
                  <hr className="my-3 border-[var(--color-border-light)]" />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Всего:</span>
                    <span>{total} ₽</span>
                  </div>
                </div>

                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full mt-6 btn btn-primary uppercase tracking-wider font-medium disabled:opacity-60"
                >
                  {submitting ? "Оформляем..." : "Подтвердить"}
                </button>
              </aside>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default CheckoutPage;
