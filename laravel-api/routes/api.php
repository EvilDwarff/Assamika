<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/hello', fn() => ['message' => 'Laravel 12 API работает!']);

Route::middleware('auth:sanctum')->get('/user', fn(Request $request) => $request->user());
