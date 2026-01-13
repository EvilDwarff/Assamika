import React, { useState } from 'react';
import Layout from '@components/common/Layout';
import { useForm } from 'react-hook-form';
import { apiUrl, userToken } from '@components/common/http';
import { toast } from 'react-toastify';
import Loader from '@components/common/Loader';
import { Link, useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: async () => {
      const res = await fetch(`${apiUrl}/get-account-details`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${userToken()}`
        }
      });
      const result = await res.json();
      setLoading(false);
      if (result.status === 200) {
        reset({
          name: result.data.name,
          email: result.data.email,
          mobile: result.data.mobile,
          address: result.data.address,
        });
      }
    }
  });

  const updateAccount = async (data) => {
    const res = await fetch(`${apiUrl}/update-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${userToken()}`
      },
      body: JSON.stringify(data)
    });
    const result = await res.json();

    if (result.status === 200) {
      toast.success(result.message);
    } else if (result.errors) {
      Object.keys(result.errors).forEach((field) => {
        setError(field, { message: result.errors[field][0] });
      });
    }
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    navigate('/');
    toast.info('Вы вышли из аккаунта');
  };

  return (
    <Layout>
      <div className=" py-16 px-4 sm:px-8 md:px-16">
        {loading && <Loader />}
        {!loading && (
          <div className="max-w-4xl mx-auto">

            {/* Header */}
            <div className="flex items-center justify-between mb-10 gap-2">
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 truncate">
                Личный кабинет
              </h1>

              <div className="relative shrink-0">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="btn btn-primary text-sm sm:text-base px-4 py-2"
                >
                  МЕНЮ
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <Link
                      to="/account"
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setMenuOpen(false)}
                    >
                      Личный кабинет
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setMenuOpen(false)}
                    >
                      Заказы
                    </Link>
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Выйти
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* Имя */}
              <div>
                <label className="block text-gray-700 mb-2">Имя</label>
                <input
                  {...register('name', { required: 'Введите имя' })}
                  type="text"
                  className={`shadow appearance-none border w-full py-2 px-3 bg-white leading-tight
                  text-text border-gray-300 focus:outline-none
                  focus:ring-2 focus:ring-primary
                  ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Почта */}
              <div>
                <label className="block text-gray-700 mb-2">Почта</label>
                <input
                  {...register('email', {
                    required: 'Введите email',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Некорректный email'
                    }
                  })}
                  type="email"
                  className={`shadow appearance-none border w-full py-2 px-3 bg-white leading-tight
                  text-text border-gray-300 focus:outline-none
                  focus:ring-2 focus:ring-primary
                  ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Адрес */}
              <div>
                <label className="block text-gray-700 mb-2">Адрес</label>
                <input
                  {...register('address', { required: 'Введите адрес' })}
                  type="text"
                  className={`shadow appearance-none border w-full py-2 px-3 bg-white leading-tight
                  text-text border-gray-300 focus:outline-none
                  focus:ring-2 focus:ring-primary
                  ${errors.address ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                )}
              </div>

              {/* Телефон */}
              <div>
                <label className="block text-gray-700 mb-2">Телефон</label>
                <input
                  {...register('mobile', { required: 'Введите телефон' })}
                  type="text"
                  className={`shadow appearance-none border w-full py-2 px-3 bg-white leading-tight
                  text-text border-gray-300 focus:outline-none
                  focus:ring-2 focus:ring-primary
                  ${errors.mobile ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.mobile && (
                  <p className="text-red-500 text-sm mt-1">{errors.mobile.message}</p>
                )}
              </div>

            </div>

            {/* Buttons */}
            <div className="mt-8 flex items-center justify-start gap-4">
              <button
                onClick={handleSubmit(updateAccount)}
                className="btn btn-primary"
              >
                ОБНОВИТЬ
              </button>
            </div>

          </div>
        )}
      </div>
    </Layout>
  );
};

export default Profile;
