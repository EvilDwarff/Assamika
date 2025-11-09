<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|min:2|max:100',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Имя обязательно для заполнения.',
            'name.min' => 'Имя должно содержать минимум :min символа.',
            'name.max' => 'Имя не должно превышать :max символов.',

            'email.required' => 'Электронная почта обязательна.',
            'email.email' => 'Введите корректный адрес электронной почты.',
            'email.unique' => 'Пользователь с таким email уже зарегистрирован.',

            'password.required' => 'Пароль обязателен.',
            'password.min' => 'Пароль должен содержать минимум :min символов.',
            'password.confirmed' => 'Пароли не совпадают.',
        ];
    }
}
