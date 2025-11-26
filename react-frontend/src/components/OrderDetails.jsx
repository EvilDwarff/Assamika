import React from "react";
import Layout from "./common/Layout";
import ProductImg from "../assets/img/products/image1.webp";
import OrderItem from "./common/OrderItem";

const mockOrder = {
    id: 1,
    date: "25.08.25",
    status: "В пути",
    address: "Москва, ул. Пушкина д. 10, кв. 5",
    email: "test@email.com",
    shipping: 100,
    items: [
        { id: 1, title: 'Чай "Assam"', weight: "1 кг", price: 968, quantity: 1, image: ProductImg },
        { id: 2, title: 'Чай "Assam"', weight: "1 кг", price: 968, quantity: 1, image: ProductImg },
        { id: 3, title: 'Чай "Assam"', weight: "1 кг", price: 968, quantity: 1, image: ProductImg }
    ]
};



const OrderDetails = () => {
    const subtotal = mockOrder.items.reduce(
        (s, i) => s + i.price * i.quantity,
        0
    );
    const total = subtotal + mockOrder.shipping;

    return (
        <Layout>
            <section className="pb-20 pt-5 bg-[var(--color-bg-base)]">
                <div className="container mx-auto px-4">

                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="title">Детали заказа №{mockOrder.id}</h1>

                        <button
                            onClick={() => window.history.back()}
                            className="btn btn-primary hidden md:block uppercase"
                        >
                            НАЗАД
                        </button>

                        <button
                            onClick={() => window.history.back()}
                            className="md:hidden text-[var(--color-text)]"
                        >
                            ← Назад
                        </button>
                    </div>

                    {/* Info */}
                    <div className="grid md:grid-cols-4 gap-6 mb-10 text-[var(--color-text)]">

                        <div className="flex flex-col">
                            <span className="text-sm text-text font-bold mb-1">Дата</span>
                            <span className="text-base font-medium">{mockOrder.date}</span>
                        </div>

                        <div className="flex flex-col">
                            <span className="text-sm text-text font-bold mb-1">Статус</span>
                            <span className="text-base font-medium">{mockOrder.status}</span>
                        </div>

                        <div className="flex flex-col">
                            <span className="text-sm text-text font-bold mb-1">Адрес доставки</span>
                            <span className="text-base font-medium">{mockOrder.address}</span>
                        </div>

                        <div className="flex flex-col">
                            <span className="text-sm text-text font-bold mb-1">Контакты</span>
                            <span className="text-base font-medium">{mockOrder.email}</span>
                        </div>

                    </div>

                    {/* Body */}
                    <div className="flex flex-col lg:flex-row gap-10">

                        {/* Products */}
                        <div className="flex-1">
                            <h2 className="text-xl text-[var(--color-text)] mb-3">Товары</h2>

                            {/* 🔹 ТЕ ЖЕ ОБЁРТКИ, ЧТО И В CHECKOUT */}
                            <div className="divide-y divide-[var(--color-border-light)]">
                                {mockOrder.items.map((item) => (
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
                                    <span>{subtotal} ₽</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Доставка</span>
                                    <span>{mockOrder.shipping} ₽</span>
                                </div>

                                <hr className="my-3 border-[var(--color-border-light)]" />

                                <div className="flex justify-between font-bold text-lg">
                                    <span>Всего:</span>
                                    <span>{total} ₽</span>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default OrderDetails;
