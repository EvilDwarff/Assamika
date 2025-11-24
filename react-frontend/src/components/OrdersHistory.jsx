import React from "react";
import { Link } from "react-router-dom";
import Layout from "./common/Layout";

const mockOrders = [
  {
    id: 1,
    name: "Смирнов В.А.",
    email: "test@email.com",
    total: 1000,
    date: "25.08.25",
    status: "В пути",
  },
  {
    id: 2,
    name: "Смирнов В.А.",
    email: "test@email.com",
    total: 1000,
    date: "25.07.25",
    status: "Доставлен",
  },
];

const OrdersHistory = () => {
  return (
    <Layout>
      <section className="bg-[var(--color-bg-base)] pt-5 pb-20">
        <div className="container mx-auto px-4">

          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="title">История заказов</h1>

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

          {/* Desktop table */}
          <div className="hidden md:block">
            <table className="w-full border border-[var(--color-border-light)] bg-white">
              <thead className="bg-[var(--color-bg-block)]">
                <tr>
                  <th className="p-3 border">#</th>
                  <th className="p-3 border">Имя</th>
                  <th className="p-3 border">Email</th>
                  <th className="p-3 border">Стоимость</th>
                  <th className="p-3 border">Дата</th>
                  <th className="p-3 border">Статус</th>
                  <th className="p-3 border">Детали</th>
                </tr>
              </thead>

              <tbody>
                {mockOrders.map((o, i) => (
                  <tr key={o.id} className="text-center">
                    <td className="p-3 border">{i + 1}</td>
                    <td className="p-3 border">{o.name}</td>
                    <td className="p-3 border">{o.email}</td>
                    <td className="p-3 border">{o.total} ₽</td>
                    <td className="p-3 border">{o.date}</td>
                    <td className="p-3 border">{o.status}</td>
                    <td className="p-3 border">
                      <Link
                        to={`/orders/${o.id}`}
                        className="text-[var(--color-primary)] underline"
                      >
                        Посмотреть
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile version */}
          <div className="md:hidden flex flex-col gap-4">
            {mockOrders.map((o, i) => (
              <div
                key={o.id}
                className="bg-white border border-[var(--color-border-light)] p-4 rounded"
              >
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">Заказ #{i + 1}</span>
                  <span className="text-[var(--color-primary)]">{o.status}</span>
                </div>

                <div className="text-sm space-y-1">
                  <p><strong>Имя:</strong> {o.name}</p>
                  <p><strong>Email:</strong> {o.email}</p>
                  <p><strong>Стоимость:</strong> {o.total} ₽</p>
                  <p><strong>Дата:</strong> {o.date}</p>
                </div>

                <Link
                  to={`/orders/${o.id}`}
                  className="block text-center btn btn-primary mt-4"
                >
                  Посмотреть
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default OrdersHistory;
