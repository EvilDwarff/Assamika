import React, { useState } from "react";
import Layout from "./common/Layout";
import ProductImg from "../assets/img/products/image1.webp";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      title: 'Чай чёрный "Assam"',
      weight: '1 кг',
      price: 968,
      quantity: 1,
      image: ProductImg,
    },
  ]);

  const increaseQuantity = (id) =>
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );

  const decreaseQuantity = (id) =>
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );

  const removeItem = (id) =>
    setCartItems((prev) => prev.filter((item) => item.id !== id));

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = 100;
  const total = subtotal + shipping;

  return (
    <Layout>
      <section className="bg-bg-base pt-24 md:pt-28 pb-12 md:pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

            {/* Список товаров */}
            <div className="w-full lg:w-2/3">
           {cartItems.map((item) => (
  <div key={item.id} className="py-4 border-b border-gray-200">
    <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-8">
      {/* Изображение */}
      <div className="flex-shrink-0">
        <img
          src={item.image}
          alt={item.title}
          className="w-28 h-28 sm:w-32 sm:h-32 object-contain"
        />
      </div>

      {/* Текст (вертикально центрирован) */}
      <div className="flex-1 flex flex-col justify-center text-center sm:text-left">
        <h3 className="text-lg font-medium text-text leading-snug">
          {item.title}
        </h3>
        <p className="text-gray-500 mt-1">{item.weight}</p>

        <button
          onClick={() => removeItem(item.id)}
          className="text-gray-500 text-sm flex items-center gap-2 mt-2 hover:text-orange-600 mx-auto sm:mx-0"
        >
          <span aria-hidden>🗑</span>
          Удалить
        </button>
      </div>

      {/* Правый блок: счётчик (без рамки) и цена */}
      <div className="flex flex-row sm:flex-col items-center sm:items-end gap-4 sm:gap-2 min-w-[110px]">
        {/* Счётчик — без внешней рамки, компактный */}
        <div className="flex items-center bg-transparent rounded-md">
          <button
            onClick={() => decreaseQuantity(item.id)}
            className="px-3 py-1 text-lg font-medium hover:text-orange-600"
            aria-label="Уменьшить"
          >
            –
          </button>
          <span className="px-4 text-base">{item.quantity}</span>
          <button
            onClick={() => increaseQuantity(item.id)}
            className="ps-3 py-1 text-lg font-medium hover:text-orange-600"
            aria-label="Увеличить"
          >
            +
          </button>
        </div>

        {/* Цена */}
        <div className="text-base sm:text-lg font-medium text-text">
          {item.price * item.quantity} ₽
        </div>
      </div>
    </div>
  </div>
))}

            </div>

            {/* Итоговая стоимость */}
            <aside className="w-full lg:w-1/3 bg-bg-block shadow-md p-6">
              <h3 className="text-xl font-medium text-text mb-4">
                Стоимость заказа
              </h3>
              <div className="space-y-3 text-base text-text">
                <div className="flex justify-between">
                  <span>Заказ</span>
                  <span>{subtotal} ₽</span>
                </div>
                <div className="flex justify-between">
                  <span>Доставка</span>
                  <span>{shipping} ₽</span>
                </div>
                <hr className="my-2 border-gray-300" />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Всего:</span>
                  <span>{total} ₽</span>
                </div>
              </div>
              <button className="w-full mt-6 bg-orange-600 hover:bg-orange-700 text-white uppercase py-3 text-sm tracking-wide transition-colors">
                Подтвердить
              </button>
            </aside>
          </div>
        </div>
      </section>
      </Layout>
  );
};

export default CartPage;
