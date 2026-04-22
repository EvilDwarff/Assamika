import React, { useEffect, useMemo, useState } from "react";
import Layout from "./common/Layout";
import { apiUrl, apiPhoto, userToken } from "@components/common/http";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { refreshCartBadge } from '@components/common/Header';


const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, itemName, isLoading }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      {/* Бэкдроп с анимацией */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Модальное окно */}
      <div className="relative bg-bg-block rounded-2xl shadow-2xl p-6 w-full max-w-md transform transition-all animate-in fade-in zoom-in-95 duration-200">
        {/* Иконка предупреждения */}
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h3 id="delete-modal-title" className="text-xl font-semibold text-text text-center mb-2">
          Удалить товар?
        </h3>
        
        <p className="text-gray-600 text-center mb-6">
          Вы уверены, что хотите удалить <span className="font-medium text-text">"{itemName}"</span> из корзины?
        </p>

        {/* Кнопки действий */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-text font-medium 
                     hover:bg-gray-50 hover:border-gray-400 transition-colors 
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Отмена
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl btn btn-primary font-medium 
                     flex items-center justify-center gap-2
                     disabled:opacity-70 disabled:cursor-not-allowed
                     hover:opacity-90 transition-opacity"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Удаляем...
              </>
            ) : (
              'Удалить'
            )}
          </button>
        </div>

        {/* Кнопка закрытия (крестик) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1"
          aria-label="Закрыть модальное окно"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};


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
  const [shipping, setShipping] = useState(100); // пока статично
  
  //  Стейт для модального окна удаления
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    itemId: null,
    itemName: ''
  });

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

      refreshCartBadge();
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Не удалось обновить количество");

      setCart(data?.data || { items: [], subtotal: 0 });
    } catch (e) {
      toast.error(e.message || "Ошибка");
    } finally {
      setBusyId(null);
    }
  };

  // ➕ Открытие модального окна удаления
  const openDeleteModal = (item) => {
    setDeleteModal({
      isOpen: true,
      itemId: item.id,
      itemName: getTitle(item)
    });
  };

  //  Закрытие модального окна
  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, itemId: null, itemName: '' });
  };

  //  Обработчик подтверждения удаления
  const handleDeleteConfirm = async () => {
    const { itemId } = deleteModal;
    if (!itemId || !ensureAuth()) return;

    setBusyId(itemId);
    closeDeleteModal();
    
    try {
      const res = await fetch(`${apiUrl}/cart/items/${itemId}`, {
        method: "DELETE",
        headers,
      });

      refreshCartBadge();
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

  // ➕ Обновлённая функция удаления — теперь только открывает модалку
  const removeItem = (item) => {
    if (!ensureAuth()) return;
    openDeleteModal(item);
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
              {/* Левый блок — список товаров */}
              <div className="w-full lg:w-2/3">
                {items.map((it) => (
                  <div key={it.id} className="py-4 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-8">
                      {/* Изображение товара */}
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

                      {/* Текст + контролы */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center gap-4 sm:flex-row sm:justify-between sm:items-start">
                        {/* Текст */}
                        <div className="flex-1 min-w-0 flex flex-col justify-start text-left">
                          <h3 className="text-lg font-medium text-text leading-snug whitespace-normal">
                            {getTitle(it)}
                          </h3>
                          {getWeight(it) ? (
                            <p className="text-gray-500 text-sm mt-0.5">{getWeight(it)}</p>
                          ) : null}

                          {/* Кнопка удаления — теперь открывает модалку */}
                          <button
                            onClick={() => removeItem(it)}
                            disabled={busyId === it.id}
                            className="text-gray-500 text-sm flex items-center gap-2 mt-2 hover:text-orange-600 disabled:opacity-60 transition-colors"
                          >
                            <span aria-hidden>🗑</span>
                            {busyId === it.id ? "Удаляем..." : "Удалить"}
                          </button>
                        </div>

                        {/* Счётчик + цена */}
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

              {/* Правый блок — итоговая стоимость */}
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

      {/* 🗑️ Модальное окно подтверждения удаления */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        itemName={deleteModal.itemName}
        isLoading={busyId === deleteModal.itemId}
      />
    </Layout>
  );
};

export default CartPage;