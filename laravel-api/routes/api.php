<?php

//use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\admin\AuthController;
use App\Http\Controllers\admin\ProductController;
use App\Http\Controllers\front\AccountController;
use App\Http\Controllers\admin\CategoryController;
use App\Http\Controllers\admin\TempImageController;
use App\Http\Controllers\front\CategoryController as FrontCategoryController;
use App\Http\Controllers\front\ProductController as FrontProductController;

Route::get('/hello', fn() => ['message' => 'Laravel 12 API работает!']);


Route::post('/admin/login',[AuthController::class, 'authenticate']);
Route::post('register', [AccountController::class, 'register']);
Route::post('login',[AccountController::class, 'authenticate']);

Route::get('/categories', [FrontCategoryController::class, 'index']);
Route::get('/products', [FrontProductController::class, 'index']);
Route::get('/products/{id}', [FrontProductController::class, 'show']);

Route::middleware(['auth:sanctum', 'checkUserRole'])->group(function () {
Route::post('update-profile',[AccountController::class, 'updateProfile']);
Route::get('get-account-details',[AccountController::class, 'getAccountDetails']);



});


Route::group(['middleware' => ['auth:sanctum', 'checkAdminRole']], function () {

    Route::prefix('admin')->group(function () {
    // categories CRUD
    Route::resource('categories', CategoryController::class);

     // temp images
    Route::post('temp-images', [TempImageController::class, 'store']);
    Route::delete('temp-images/{id}', [TempImageController::class, 'destroy']);

    // products CRUD
    Route::get('products', [ProductController::class, 'index']);
    Route::post('products', [ProductController::class, 'store']);
    Route::get('products/{id}', [ProductController::class, 'show']);
    Route::put('products/{id}', [ProductController::class, 'update']);
    Route::delete('products/{id}', [ProductController::class, 'destroy']);

    // product images
    Route::post('products/{productId}/images', [ProductController::class, 'addImagesFromTemp']);
    Route::delete('product-images/{imageId}', [ProductController::class, 'deleteImage']);
    Route::post('products/{productId}/default-image', [ProductController::class, 'setDefaultImage']);
    });
});
