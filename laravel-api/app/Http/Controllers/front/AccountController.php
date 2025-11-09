<?php

namespace App\Http\Controllers\front;

use App\Models\User;
//use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\UpdateProfileRequest;

class AccountController extends Controller
{
    public function register(RegisterRequest $request)
    {
        $user = User::create([
            'name' => $request->validated()['name'],
            'email' => $request->validated()['email'],
            'password' => Hash::make($request->validated()['password']),
            'role' => 'customer',
        ]);

        return response()->json([
            'status' => 200,
            'message' => 'Регистрация прошла успешно.',
        ], 200);
    }

    public function authenticate(LoginRequest $request)
    {
        if (!Auth::attempt($request->validated())) {
            return response()->json([
                'status' => 401,
                'message' => 'Неверный адрес электронной почты или пароль.'
            ], 401);
        }

        $user = Auth::user();
        $token = $user->createToken('token')->plainTextToken;

        return response()->json([
            'status' => 200,
            'token' => $token,
            'id' => $user->id,
            'name' => $user->name
        ], 200);
    }

    // public function getOrderDetails($id, Request $request)
    // {
    //     $order = Order::where('user_id', $request->user()->id)
    //         ->with('items', 'items.product')
    //         ->find($id);

    //     if (!$order) {
    //         return response()->json([
    //             'status' => 404,
    //             'message' => 'Заказ не найден.',
    //             'data' => []
    //         ], 404);
    //     }

    //     return response()->json([
    //         'status' => 200,
    //         'data' => $order
    //     ], 200);
    // }

    // public function getOrders(Request $request)
    // {
    //     $orders = Order::where('user_id', $request->user()->id)
    //         ->orderByDesc('created_at')
    //         ->get();

    //     if ($orders->isEmpty()) {
    //         return response()->json([
    //             'status' => 404,
    //             'message' => 'У вас пока нет заказов.',
    //             'data' => []
    //         ], 404);
    //     }

    //     return response()->json([
    //         'status' => 200,
    //         'data' => $orders
    //     ], 200);
    // }

    public function updateProfile(UpdateProfileRequest $request)
    {
        $user = $request->user();
        $user->update($request->validated());

        return response()->json([
            'status' => 200,
            'message' => 'Профиль успешно обновлён.'
        ], 200);
    }

    public function getAccountDetails(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'status' => 404,
                'message' => 'Пользователь не найден.',
                'data' => []
            ], 404);
        }

        return response()->json([
            'status' => 200,
            'data' => $user
        ], 200);
    }
}
