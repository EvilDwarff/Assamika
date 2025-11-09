import React, { useState } from 'react';
import Layout from '@components/common/Layout';
import { useForm } from 'react-hook-form';
import { apiUrl } from '@components/common/http';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';

const RegisterUser = () => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const onSubmit = async (data) => {
        const res = await fetch(`${apiUrl}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const result = await res.json();

        if (result.status === 200) {
            toast.success('Регистрация прошла успешно! Войдите в свой аккаунт.');
            navigate('/account/login');
        } else {
            if (result.errors) {
                Object.values(result.errors).forEach((err) => toast.error(err[0]));
            } else {
                toast.error(result.message || 'Ошибка регистрации');
            }
        }
    };

    return (
        <Layout>
            <div className="max-w-md mx-auto py-10">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="bg-white shadow-xl rounded-lg overflow-hidden w-full">
                        <div className="p-8">
                            <h3 className="text-2xl font-prosto mb-6 text-text">
                                Регистрация пользователя
                            </h3>

                            {/* Name */}
                            <div className="mb-4">
                                <label htmlFor="name" className="block text-gray-700 text-sm font-semibold mb-2">
                                    Имя
                                </label>
                                <input
                                    id="name"
                                    {...register('name', {
                                        required: 'Введите имя',
                                        minLength: { value: 2, message: 'Имя слишком короткое' },
                                    })}
                                    type="text"
                                    className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.name ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Имя"
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-xs italic mt-1">{errors.name.message}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="mb-4">
                                <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    {...register('email', {
                                        required: 'Введите Email',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: 'Некорректный адрес электронной почты',
                                        },
                                    })}
                                    type="text"
                                    className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Email"
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-xs italic mt-1">{errors.email.message}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="mb-4 relative">
                                <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">
                                    Пароль
                                </label>
                                <input
                                    id="password"
                                    {...register('password', {
                                        required: 'Введите пароль',
                                        minLength: { value: 6, message: 'Минимум 6 символов' },
                                    })}
                                    type={showPassword ? 'text' : 'password'}
                                    className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.password ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Пароль"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-9 text-gray-500"
                                >
                                    {showPassword ? '⊚' : '◉'}
                                </button>
                                {errors.password && (
                                    <p className="text-red-500 text-xs italic mt-1">{errors.password.message}</p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div className="mb-6 relative">
                                <label htmlFor="password_confirmation" className="block text-gray-700 text-sm font-semibold mb-2">
                                    Подтверждение пароля
                                </label>
                                <input
                                    id="password_confirmation"
                                    {...register('password_confirmation', {
                                        required: 'Подтвердите пароль',
                                        validate: (value) =>
                                            value === watch('password') || 'Пароли не совпадают',
                                    })}
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.password_confirmation ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Подтвердите пароль"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-9 text-gray-500"
                                >
                                    {showConfirmPassword ? '⊚' : '◉'}
                                </button>
                                {errors.password_confirmation && (
                                    <p className="text-red-500 text-xs italic mt-1">{errors.password_confirmation.message}</p>
                                )}
                            </div>

                            <button type="submit" className="w-full btn btn-primary">
                                Зарегистрироваться
                            </button>
                            <div className="d-flex justify-content-center pt-4 pb-2">
                                Уже есть аккаунт? &nbsp;
                                <Link to="/account/login" className="text-orange-500 hover:underline">
                                    Войти
                                </Link>
                            </div>

                        </div>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default RegisterUser;
