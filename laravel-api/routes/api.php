<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\admin\AuthController;

Route::get('/hello', fn() => ['message' => 'Laravel 12 API работает!']);


Route::post('/admin/login',[AuthController::class, 'authenticate']);

Route::middleware('auth:sanctum')->get('/user', fn(Request $request) => $request->user());
