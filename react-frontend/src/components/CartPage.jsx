import React, { useState } from "react";
import Header from "./common/Header";
import Footer from "./common/Footer";
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
    <>
      <Header />
      <section className="bg-bg-block pt-24 md:pt-28 pb-12 md:pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            
            {/* Список товаров */}
            <div className="w-full lg:w-2/3">
              {cartItems.map((item) => (
                <div key={item.id} className="pb-6 mb-6 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-32 h-32 object-contain"
                    />

                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-lg font-medium text-text">
                        {item.title}
                      </h3>
                      <p className="text-gray-500">{item.weight}</p>

                      {/* Удалить */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-500 text-sm flex items-center gap-1 mt-2 hover:text-orange-600"
                      >
                        <span>🗑</span> Удалить
                      </button>
                    </div>

                    {/* Кол-во и цена */}
                    <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-center w-full sm:w-auto gap-3">
                      <div className="flex items-center border border-gray-300">
                        <button
                          onClick={() => decreaseQuantity(item.id)}
                          className="px-3 py-1 text-lg font-bold hover:bg-gray-100"
                        >
                          –
                        </button>
                        <span className="px-4">{item.quantity}</span>
                        <button
                          onClick={() => increaseQuantity(item.id)}
                          className="px-3 py-1 text-lg font-bold hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                      <p className="font-medium text-text">
                        {item.price * item.quantity} ₽
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Итоговая стоимость */}
            <aside className="w-full lg:w-1/3 bg-block shadow-md p-6">
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
      <Footer />
    </>
  );
};

export default CartPage;
