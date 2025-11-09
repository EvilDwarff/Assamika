<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\admin\AuthController;
use App\Http\Controllers\front\AccountController;
use App\Http\Controllers\admin\CategoryController;

Route::get('/hello', fn() => ['message' => 'Laravel 12 API работает!']);


Route::post('/admin/login',[AuthController::class, 'authenticate']);
Route::post('register', [AccountController::class, 'register']);
Route::post('login',[AccountController::class, 'authenticate']);

Route::middleware(['auth:sanctum', 'checkUserRole'])->group(function () {
Route::post('update-profile',[AccountController::class, 'updateProfile']);
Route::get('get-account-details',[AccountController::class, 'getAccountDetails']);

});


Route::group(['middleware' => ['auth:sanctum', 'checkAdminRole']], function () {
    Route::resource('/admin/categories', CategoryController::class);

});
