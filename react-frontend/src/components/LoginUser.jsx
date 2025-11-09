/* eslint-disable no-unused-vars */
import React, { useState, useContext } from 'react';
import Layout from '@components/common/Layout';
import { useForm } from 'react-hook-form';
import { apiUrl } from '@components/common/http';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '@components/context/Auth';

const LoginUser = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const {login} = useContext(AuthContext);
    
        const onSubmit = async (data) => {
               const res = await fetch(`${apiUrl}/login`, {
                        method: 'POST',
                        headers: {
                            'Content-type': 'application/json'
                        },
            
                        body: JSON.stringify(data)
            
                    }).then(res => res.json())
                        .then(result => {
                            console.log(result)
            
                            if (result.status == 200) {
                                const userInfo = {
                                    token: result.token, 
                                    id: result.id,
                                    name: result.name
                                }
                                localStorage.setItem('userInfo', JSON.stringify(userInfo))
                                login(userInfo)
                                navigate('/account')
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
                                Вход для пользователя
                            </h3>

                            {/* Email */}
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
                            <div className="mb-6 relative">
                                <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">
                                    Пароль
                                </label>
                                <input
                                    id="password"
                                    {...register('password', {
                                        required: 'Поле Пароль обязательно для заполнения',
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

                            <button type="submit" className="w-full btn btn-primary">
                                Войти
                            </button>
                            <div className="d-flex justify-content-center pt-4 pb-2">
                                Нет аккаунта? &nbsp;
                                <Link to="/account/register" className="text-orange-500 hover:underline">
                                    Зарегистрироваться
                                </Link>
                            </div>

                        </div>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default LoginUser;
