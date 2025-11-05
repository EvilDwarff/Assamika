import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUrl, adminToken } from '@components/common/http';
import AdminLayout from '@components/admin/common/AdminLayout';

const CreateCategory = () => {
  const [name, setName] = useState('');
  const [status, setStatus] = useState(1);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Поле "Название категории" обязательно';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    try {
      const res = await fetch(`${apiUrl}/admin/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken()}`,
        },
        body: JSON.stringify({ name, status }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ global: data.message || 'Ошибка при создании категории' });
        return;
      }

      navigate('/admin/categories');
    } catch (err) {
      setErrors({ global: 'Ошибка соединения с сервером' });
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 bg-[var(--color-bg-base)] flex justify-center">
        <form
          onSubmit={handleSubmit}
          className="bg-[var(--color-bg-block)] w-full max-w-md rounded-xl shadow-lg p-6 space-y-5"
        >
          <h1 className="title text-center">Создать категорию</h1>

          {errors.global && (
            <p className="text-red-600 text-sm text-center">{errors.global}</p>
          )}

          {/* Название категории */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Название категории
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight 
                focus:outline-none focus:ring-2 focus:ring-orange-500 
                ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Введите название..."
            />
            {errors.name && (
              <p className="text-red-500 text-xs italic mt-1">{errors.name}</p>
            )}
          </div>

          {/* Статус */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Статус
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(Number(e.target.value))}
              className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight 
              focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value={1}>Активна</option>
              <option value={0}>Отключена</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full btn btn-primary mt-4"
          >
            Создать
          </button>
        </form>
      </div>
    </AdminLayout>
  );
};

export default CreateCategory;
