import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiUrl, adminToken } from '@components/common/http';
import AdminLayout from '@components/admin/common/AdminLayout';

const EditCategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [status, setStatus] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await fetch(`${apiUrl}/admin/categories/${id}`, {
          headers: {
            Authorization: `Bearer ${adminToken()}`,
          },
        });
        const data = await res.json();
        setName(data.data.name);
        setStatus(data.data.status);
      } catch (error) {
        setError('Ошибка при загрузке категории');
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiUrl}/admin/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken()}`,
        },
        body: JSON.stringify({ name, status }),
      });

      if (!res.ok) throw new Error('Ошибка при обновлении');
      navigate('/admin/categories');
    } catch (error) {
      setError('Ошибка при сохранении');
    }
  };

  if (loading) return <p className="text-center mt-10">Загрузка...</p>;

  return (
    <AdminLayout>
    <div className="p-4 md:p-8 bg-[var(--color-bg-base)] flex justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-[var(--color-bg-block)] w-full max-w-md rounded-xl shadow-md p-6 space-y-4"
      >
        <h1 className="title text-center">Редактировать категорию</h1>

        {error && <p className="text-red-600 text-sm text-center">{error}</p>}

        <div>
          <label className="block mb-1 font-medium">Название категории</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-base border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight 
              focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>

            {/* Статус  */}
          <div className="relative">
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Статус
            </label>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(Number(e.target.value))}
                className="w-full py-2 pl-3 pr-10 text-gray-700 bg-base border border-gray-300 rounded-md shadow-sm 
                  appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500
                  cursor-pointer"
              >
                <option value={1}>Активна</option>
                <option value={0}>Отключена</option>
              </select>
              {/* Кастомная стрелка */}
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>


        <div className="flex justify-between mt-4">
          <button type="submit" className="btn btn-primary w-full">
            Сохранить
          </button>
        </div>
      </form>
    </div>
    </AdminLayout>
  );
};

export default EditCategory;
