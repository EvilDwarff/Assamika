import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '@components/admin/common/AdminLayout';
import { apiUrl, apiPhoto, adminToken } from '@components/common/http';

const money = (v) => {
  if (v === null || v === undefined) return '-';
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  return n.toFixed(2);
};

const statusBadge = (status) => {
  const map = {
    inactive: { text: 'Неактивен', cls: 'text-gray-600 bg-gray-100' },
    in_stock: { text: 'В наличии', cls: 'text-green-700 bg-green-100' },
    sold_out: { text: 'Нет в наличии', cls: 'text-red-700 bg-red-100' },
  };
  return map[status] || { text: status, cls: 'text-gray-600 bg-gray-100' };
};

export default function Show() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/admin/products`, {
        headers: { Authorization: `Bearer ${adminToken()}` },
      });
      const data = await res.json();
      setProducts(data.data || []);
    } catch (e) {
      console.error('Ошибка при загрузке товаров:', e);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Удалить товар?')) return;
    try {
      await fetch(`${apiUrl}/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken()}` },
      });
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      console.error('Ошибка при удалении товара:', e);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return products
      .filter((p) => {
        const okQ =
          !query ||
          String(p.id).includes(query) ||
          (p.name || '').toLowerCase().includes(query);
        const okS = status === 'all' ? true : p.status === status;
        return okQ && okS;
      })
      .sort((a, b) => b.id - a.id);
  }, [products, q, status]);

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 bg-[var(--color-bg-base)] min-h-screen">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <h1 className="title">Товары</h1>

          <Link to="/admin/products/create" className="btn btn-primary w-full sm:w-auto">
            + Добавить товар
          </Link>
        </div>

        {/* Фильтры */}
        <div className="bg-[var(--color-bg-block)] rounded-xl shadow-sm p-4 mb-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Поиск</label>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ID или название..."
                className="bg-base border border-gray-300 rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Статус</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full py-2 pl-3 pr-10 text-gray-700 bg-base border border-gray-300 rounded-md shadow-sm 
                appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 cursor-pointer"
              >
                <option value="all">Все</option>
                <option value="inactive">Неактивен</option>
                <option value="in_stock">В наличии</option>
                <option value="sold_out">Нет в наличии</option>
              </select>
            </div>

            <div className="flex items-end">
              <button onClick={fetchProducts} className="btn btn-primary w-full">
                Обновить
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Загрузка...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-500">Товаров пока нет</p>
        ) : (
          <>
            {/* Таблица (md+) */}
            <div className="hidden md:block overflow-x-auto bg-[var(--color-bg-block)] rounded-xl shadow-sm">
              <table className="min-w-full text-sm md:text-base">
                <thead>
                  <tr className="bg-block text-text">
                    <th className="py-3 px-4 text-left">ID</th>
                    <th className="py-3 px-4 text-left">Товар</th>
                    <th className="py-3 px-4 text-left">Категория</th>
                    <th className="py-3 px-4 text-left">Цена</th>
                    <th className="py-3 px-4 text-left">Скидка</th>
                    <th className="py-3 px-4 text-left">Остаток</th>
                    <th className="py-3 px-4 text-left">Статус</th>
                    <th className="py-3 px-4 text-center">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => {
                    const b = statusBadge(p.status);
                    return (
                      <tr
                        key={p.id}
                        className="border-b border-[var(--color-border-light)] hover:bg-gray-50"
                      >
                        <td className="py-2 px-4">{p.id}</td>
                        <td className="py-2 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
                              {p.image ? (
                                <img
                                  src={`${apiPhoto}/${p.image}`}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-xs text-gray-500">нет</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-gray-900 truncate max-w-[260px]">
                                {p.name}
                              </div>
                              <div className="text-xs text-gray-500 truncate max-w-[260px]">
                                {p.weight ? `Вес: ${p.weight}` : ' '}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 px-4">
                          <span className="inline-flex px-2 py-1 rounded-lg bg-gray-100 text-gray-800 text-sm">
                            {p.category?.name || 'Без категории'}
                          </span>
                        </td>
                        <td className="py-2 px-4">{money(p.price)}</td>
                        <td className="py-2 px-4">{p.discount_price ? money(p.discount_price) : '-'}</td>
                        <td className="py-2 px-4">{p.reserve}</td>
                        <td className="py-2 px-4">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${b.cls}`}>
                            {b.text}
                          </span>
                        </td>
                        <td className="py-2 px-4">
                          <div className="flex justify-center gap-3">
                            <Link
                              to={`/admin/products/edit/${p.id}`}
                              className="text-gray-600 hover:text-[var(--color-primary)] transition-colors"
                              title="Редактировать"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                <path d="M12 6h4v4" />
                              </svg>
                            </Link>

                            <button
                              onClick={() => deleteProduct(p.id)}
                              className="text-gray-600 hover:text-red-600 transition-colors"
                              title="Удалить"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18" />
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Карточки (mobile) */}
            <div className="md:hidden space-y-3">
              {filtered.map((p) => {
                const b = statusBadge(p.status);
                return (
                  <div key={p.id} className="bg-[var(--color-bg-block)] rounded-xl shadow-sm p-4">
                    <div className="flex gap-3">
                      <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                        {p.image ? (
                          <img
                            src={`${apiUrl}/uploads/products/${p.image}`}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs text-gray-500">нет</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-semibold text-gray-900 truncate">{p.name}</div>
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${b.cls}`}>
                            {b.text}
                          </span>
                        </div>

                        <div className="text-sm text-gray-700 mt-1">
                          Цена: <span className="font-medium">{money(p.price)}</span>
                          {p.discount_price ? (
                            <span className="ml-2 text-green-700 font-medium">({money(p.discount_price)})</span>
                          ) : null}
                        </div>

                        <div className="text-sm text-gray-600 mt-1">
                          Категория: {p.category_id} • Остаток: {p.reserve}
                        </div>

                        <div className="flex gap-2 mt-3">
                          <Link to={`/admin/products/edit/${p.id}`} className="btn btn-primary w-full">
                            Редактировать
                          </Link>
                          <button onClick={() => deleteProduct(p.id)} className="btn w-full border border-gray-300">
                            Удалить
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
