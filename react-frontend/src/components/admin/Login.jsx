/* eslint-disable no-unused-vars */

import React, { useContext } from 'react';
import Layout from '../common/Layout';
import { useForm } from 'react-hook-form';
import { apiUrl } from '../common/http';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { AdminAuthContext } from '../context/AdminAuth';

const Login = () => {
    const { login } = useContext(AdminAuthContext);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const navigate = useNavigate();

    const onSubmit = async (data) => {
        const res = await fetch(`${apiUrl}/admin/login`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },

            body: JSON.stringify(data)

        }).then(res => res.json())
            .then(result => {
                if (result.status == 200) {
                    const adminInfo = {
                        token: result.token,
                        id: result.id,
                        name: result.name
                    }
                    localStorage.setItem('adminInfo', JSON.stringify(adminInfo))
                    login(adminInfo)
                    navigate('/admin/dashboard')
                } else {

                    toast.error(result.message);
                }
            })
    }
    return (
        <Layout>
            <div className="max-w-md mx-auto py-10">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="bg-white shadow-xl rounded-lg overflow-hidden w-full">
                        <div className="p-8">
                            <h3 className="text-2xl font-prosto mb-6 text-text">
                                Вход для Администратора
                            </h3>

                            <div className="mb-4">
                                <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    {...register('email', {
                                        required: 'Поле Email обязательно для заполнения',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: 'Неверный формат адреса электронной почты',
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

                            <div className="mb-6">
                                <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">
                                    Пароль
                                </label>
                                <input
                                    id="password"
                                    {...register('password', {
                                        required: 'Поле Пароль обязательно для заполнения',
                                    })}
                                    type="password"
                                    className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.password ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Пароль"
                                />
                                {errors.password && (
                                    <p className="text-red-500 text-xs italic mt-1">{errors.password.message}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="w-full btn btn-primary"
                            >
                                Войти
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default Login;