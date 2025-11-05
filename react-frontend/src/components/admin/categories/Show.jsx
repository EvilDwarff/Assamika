import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiUrl, adminToken } from '@components/common/http';
import AdminLayout from '@components/admin/common/AdminLayout';

const ShowCategory = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCategories = async () => {
        try {
            const res = await fetch(`${apiUrl}/admin/categories`, {
                headers: {
                    Authorization: `Bearer ${adminToken()}`,
                },
            });

            const data = await res.json();
            setCategories(data.data || []);
        } catch (error) {
            console.error('Ошибка при загрузке категорий:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteCategory = async (id) => {
        if (window.confirm('Удалить категорию?')) {
            try {
                await fetch(`${apiUrl}/admin/categories/${id}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${adminToken()}`,
                    },
                });
                setCategories(categories.filter((cat) => cat.id !== id));
            } catch (error) {
                console.error('Ошибка при удалении категории:', error);
            }
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    return (
        <AdminLayout>
            <div className="p-4 md:p-8 bg-[var(--color-bg-base)] min-h-screen">
                <div className="flex items-center justify-between mb-6 flex-nowrap">
                    <h1 className="title mb-3 sm:mb-0">Категории</h1>
                    <Link
                        to="/admin/categories/create"
                        className="btn btn-primary text-sm sm:text-base"
                    >
                        + Добавить категорию
                    </Link>
                </div>

                {loading ? (
                    <p className="text-center text-gray-500">Загрузка...</p>
                ) : categories.length === 0 ? (
                    <p className="text-center text-gray-500">Категорий пока нет</p>
                ) : (
                    <div className="overflow-x-auto bg-[var(--color-bg-block)] rounded-xl shadow-sm">
                        <table className="min-w-full text-sm md:text-base">
                            <thead>
                                <tr className="bg-block text-text">
                                    <th className="py-3 px-4 text-left">ID</th>
                                    <th className="py-3 px-4 text-left">Название</th>
                                    <th className="py-3 px-4 text-left">Статус</th>
                                    <th className="py-3 px-4 text-center">Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((category) => (
                                    <tr
                                        key={category.id}
                                        className="border-b border-[var(--color-border-light)] hover:bg-gray-50"
                                    >
                                        <td className="py-2 px-4">{category.id}</td>
                                        <td className="py-2 px-4">{category.name}</td>
                                        <td className="py-2 px-4">
                                            {category.status === 1 ? (
                                                <span className="text-green-600 font-medium">Активна</span>
                                            ) : (
                                                <span className="text-red-600 font-medium">Отключена</span>
                                            )}
                                        </td>
                                        <td className="py-2 px-4 text-center flex justify-center gap-3">
                                            {/* Иконка редактирования */}
                                            <Link
                                                to={`/admin/categories/edit/${category.id}`}
                                                className="text-gray-600 hover:text-[var(--color-primary)] transition-colors"
                                                title="Редактировать"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                                    <path d="M12 6h4v4" />
                                                </svg>
                                            </Link>

                                            {/* Иконка удаления */}
                                            <button
                                                onClick={() => deleteCategory(category.id)}
                                                className="text-gray-600 hover:text-red-600 transition-colors"
                                                title="Удалить"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path d="M3 6h18" />
                                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default ShowCategory;
