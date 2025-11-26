import React, { useState } from "react";
import Layout from "./common/Layout";
import OrderItem from "./common/OrderItem";
import ProductImg from "../assets/img/products/image1.webp";



// Компонент поля ввода 
const InputField = ({ label, name, value, onChange, type = "text" }) => (
  <div className="flex flex-col">
    <label htmlFor={name} className="text-gray-700 text-sm font-semibold mb-2">
      {label}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      className={`shadow appearance-none border w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white text-[var(--color-text)] border-gray-300`}
    />
  </div>
);

// Компонент выпадающего списка 
const SelectField = ({ label, name, options, value, onChange }) => (
  <div className="flex flex-col">
    <label htmlFor={name} className="text-gray-700 text-sm font-semibold mb-2">
      {label}
    </label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      // Стили без disabled
      className={`shadow appearance-none border w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer bg-white text-[var(--color-text)] border-gray-300`}
    >
      <option value="" disabled hidden>
        Выберите способ
      </option>
      {options.map(option => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

const CheckoutPage = () => {
  // Имитация данных из корзины.
  const [cartItems] = useState([
    { id: 1, title: 'Чай чёрный "Assam"', weight: '1 кг', price: 968, quantity: 1, image: ProductImg },
    { id: 2, title: 'Чай чёрный "Assam"', weight: '1 кг', price: 968, quantity: 1, image: ProductImg },
    { id: 3, title: 'Чай чёрный "Assam"', weight: '1 кг', price: 968, quantity: 1, image: ProductImg },
  ]);

  // Состояние для редактируемых данных пользователя
  const [formData, setFormData] = useState({
    name: "Смирнов В.А.",
    email: "test@email.com",
    phone: "+7 985 010 40 22",
    address: "Москва, ул. Тверская, 15",
    paymentMethod: "", // Изначально пусто, чтобы выбрать из списка
  });

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = 100;
  const total = subtotal + shipping;
  
  // Обработчик изменения полей формы
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBack = () => {
    console.log("Назад к корзине");
    // В реальном приложении: navigate('/cart')
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Заказ подтвержден. Отправка данных:", formData);
    // Здесь будет логика отправки заказа на сервер
  };

  return (
    <Layout>
      <section className="bg-[var(--color-bg-base)] pt-4 md:pt-8 pb-12 md:pb-20">
        <div className="container mx-auto px-4 sm:px-6 ">
          
          {/* Заголовок и кнопка "Назад" */}
          <div className="flex justify-between items-center mb-6 md:mb-10">
            <h1 className="title">
              Подтверждение заказа
            </h1>
            <button
              onClick={handleBack}
              className="px-6 py-2 btn btn-primary  font-medium transition-colors hidden sm:block uppercase"
            >
              НАЗАД
            </button>
            {/* Кнопка "Назад" для мобильных */}
            <button
              onClick={handleBack}
              className="p-2 text-gray-600 hover:text-[var(--color-primary)] sm:hidden"
              aria-label="Назад"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
          
          {/* Основной контент: Форма и Сводка заказа */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

            {/* Левая часть: Форма и Список товаров */}
            <div className="w-full lg:w-2/3">

              {/* Блок с полями ввода */}
              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                <InputField 
                  label="Имя" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
                <InputField 
                  label="Почта" 
                  name="email"
                  type="email"
                  value={formData.email} 
                  onChange={handleInputChange}
                />
                <InputField 
                  label="Адрес" 
                  name="address"
                  value={formData.address} 
                  onChange={handleInputChange}
                />
                <InputField 
                  label="Телефон" 
                  name="phone"
                  value={formData.phone} 
                  onChange={handleInputChange}
                  type="tel"
                />
                
                <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SelectField
                    label="Способ оплаты"
                    name="paymentMethod"
                    options={["Наличными при получении", "Картой при получении"]}
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                  />
                </div>
              </form>

              {/* Раздел "Товары" */}
              <h2 className="text-xl md:text-2xl font-normal text-[var(--color-text)] border-t border-[var(--color-border-light)] pt-6">
                Товары
              </h2>
              <div className="divide-y divide-[var(--color-border-light)]">
                {cartItems.map((item) => (
                  <OrderItem key={item.id} item={item} />
                ))}
              </div>

            </div>

            {/* Правая часть: Итоговая стоимость (Сводка заказа) */}
            <aside 
              className="w-full lg:w-1/3 p-6 bg-[var(--color-bg-block)] lg:sticky lg:top-22 self-start"
            >
              <h3 className="text-xl font-medium text-[var(--color-text)] mb-4">
                Стоимость заказа
              </h3>
              <div className="space-y-3 text-base text-[var(--color-text)]">
                <div className="flex justify-between">
                  <span>Заказ</span>
                  <span className="font-medium text-[var(--color-text)]">{subtotal} ₽</span>
                </div>
                <div className="flex justify-between">
                  <span>Доставка</span>
                  <span className="font-medium text-[var(--color-text)]">{shipping} ₽</span>
                </div>
                <hr className="my-3 border-[var(--color-border-light)]" /> 
                <div className="flex justify-between font-bold text-lg text-[var(--color-text)]">
                  <span>Всего:</span>
                  <span>{total} ₽</span>
                </div>
              </div>
              <button
                onClick={handleSubmit}
                className="w-full mt-6 btn btn-primary uppercase tracking-wider font-medium"
              >
                Подтвердить
              </button>
            </aside>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CheckoutPage;