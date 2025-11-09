<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->user()->id;

        return [
            'name' => 'required|string|min:2|max:100',
            'email' => 'required|email|unique:users,email,' . $userId,
            'address' => 'required|string|max:255',
            'mobile' => 'required|string|max:20',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Введите имя.',
            'email.required' => 'Введите адрес электронной почты.',
            'email.email' => 'Введите корректный адрес электронной почты.',
            'email.unique' => 'Этот email уже используется другим пользователем.',
            'address.required' => 'Введите адрес.',
            'mobile.required' => 'Введите номер телефона.',
        ];
    }
}
