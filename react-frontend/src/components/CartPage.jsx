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
    {
      id: 2,
      title: 'Чай зеленый "Jasmine" с добавлением лепестков розы и ванили',
      weight: '0.5 кг',
      price: 550,
      quantity: 2,
      image: ProductImg,
    },
      {
      id: 3,
      title: 'Чай зеленый "Jasmine" с добавлением лепестков розы и ванили',
      weight: '0.5 кг',
      price: 550,
      quantity: 2,
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
      <section className="bg-bg-base pt-4 md:pt-8 pb-12 md:pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

            {/* Список товаров (Левый блок) */}
            <div className="w-full lg:w-2/3">
           {cartItems.map((item) => (
              <div key={item.id} className="py-4 border-b border-gray-200">
                
                {/* КОНТЕЙНЕР КАРТОЧКИ */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-8">
                  
                  {/* 1. Изображение */}
                  <div className="flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
                    />
                  </div>

                  {/* 2. Информация и Счетчик/Цена (ОСНОВНОЙ РАБОЧИЙ БЛОК) */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center gap-4 sm:flex-row sm:justify-between sm:items-start">
                    
                    {/* A. Блок Текста (Название, Вес и Удалить) */}
                    <div className="flex-1 min-w-0 flex flex-col justify-start text-left">
                      <h3 className="text-lg font-medium text-text leading-snug whitespace-normal">
                        {item.title}
                      </h3>
                      <p className="text-gray-500 text-sm mt-0.5">{item.weight}</p> 

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-500 text-sm flex items-center gap-2 mt-2 hover:text-orange-600"
                      >
                        <span aria-hidden>🗑</span>
                        Удалить
                      </button>
                    </div>
                    
                    {/* B. Блок Счётчик и Цена - ГЛАВНЫЙ КОНТЕЙНЕР ДЛЯ ВЫРАВНИВАНИЯ */}
                    {/* На десктопе: flex-col, items-end, w-auto. */}
                    <div className="flex-shrink-0 flex flex-row justify-between items-center w-full mt-2 pt-4 border-t border-gray-200 
                                  sm:flex-col sm:items-end sm:w-auto sm:mt-0 sm:pt-0 sm:border-t-0 sm:self-start"> 
                      
                      {/* Счётчик - ИЗМЕНЕНО: Добавлен w-full и justify-end на sm+ */}
                      <div className="flex items-center bg-transparent text-text order-1 flex-shrink-0 min-w-max 
                                    sm:w-full sm:justify-end"> 
                        <button
                          onClick={() => decreaseQuantity(item.id)}
                          className="px-3 py-1 text-lg font-medium hover:text-orange-600"
                          aria-label="Уменьшить"
                        >
                          –
                        </button>
                        <span className="px-3 py-1 text-base">{item.quantity}</span>
                        <button
                          onClick={() => increaseQuantity(item.id)}
                          className="ps-3 py-1 text-lg font-medium hover:text-orange-600"
                          aria-label="Увеличить"
                        >
                          +
                        </button>
                      </div>

                      {/* Цена - ИЗМЕНЕНО: Добавлен w-full на sm+ */}
                      <div className="text-base sm:text-lg font-medium text-text order-2 sm:mt-2 text-right min-w-max 
                                    sm:w-full"> 
                        {item.price * item.quantity} ₽
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            </div>

            {/* Итоговая стоимость (Правый блок) */}
            <aside className="w-full lg:w-1/3 bg-bg-block shadow-md p-6 lg:min-h-[300px] lg:sticky lg:top-8 self-start">
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
              <button className="w-full mt-6 btn btn-primary uppercase tracking-wider">
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