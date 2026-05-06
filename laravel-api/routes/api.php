<?php

//use Illuminate\Http\Request;
use App\Http\Controllers\admin\AuthController;
use App\Http\Controllers\admin\CategoryController;
use App\Http\Controllers\admin\OrderController as AdminOrderController;
use App\Http\Controllers\admin\ProductController;
use App\Http\Controllers\admin\RfmReportController;
use App\Http\Controllers\admin\TempImageController;
use App\Http\Controllers\front\AccountController;
use App\Http\Controllers\front\CartController;
use App\Http\Controllers\front\CategoryController as FrontCategoryController;
use App\Http\Controllers\front\OrderController as FrontOrderController;
use App\Http\Controllers\front\ProductController as FrontProductController;
use Illuminate\Support\Facades\Route;



Route::get('/hello', fn() => ['message' => 'Laravel 12 API работает!']);


Route::post('/admin/login',[AuthController::class, 'authenticate']);
Route::post('register', [AccountController::class, 'register']);
Route::post('login',[AccountController::class, 'authenticate']);

Route::get('/categories', [FrontCategoryController::class, 'index']);
Route::get('/products', [FrontProductController::class, 'index']);
Route::get('/products/newest', [FrontProductController::class, 'newest']);
Route::get('/products/{id}', [FrontProductController::class, 'show']);

Route::middleware(['auth:sanctum', 'checkUserRole'])->group(function () {

    //account
    Route::post('update-profile',[AccountController::class, 'updateProfile']);
    Route::get('get-account-details',[AccountController::class, 'getAccountDetails']);


    // cart
    Route::get('/cart', [CartController::class, 'index']);
    Route::get('/cart/quantity', [CartController::class, 'getQuantity']);
    Route::post('/cart/items', [CartController::class, 'addItem']);
    Route::put('/cart/items/{itemId}', [CartController::class, 'updateItem']);
    Route::delete('/cart/items/{itemId}', [CartController::class, 'removeItem']);
    Route::delete('/cart/clear', [CartController::class, 'clear']);

    // orders (my)
    Route::get('/orders', [FrontOrderController::class, 'index']);
    Route::get('/orders/{id}', [FrontOrderController::class, 'show']);
    Route::post('/orders', [FrontOrderController::class, 'store']);



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


    //orders
    Route::get('/orders', [AdminOrderController::class, 'index']);
    Route::get('/orders/{id}', [AdminOrderController::class, 'show']);
    Route::patch('/orders/{id}/status', [AdminOrderController::class, 'updateStatus']);


     // === RFM Analytics ===
    Route::prefix('rfm')->group(function () {
        // Сводная аналитика
        Route::get('/summary', [RfmReportController::class, 'summary'])->name('admin.rfm.summary');
        
        // Пользователи с РФМ (пагинация)
        Route::get('/users', [RfmReportController::class, 'usersWithRfm'])->name('admin.rfm.users');
        
        // Топ-чемпионы
        Route::get('/top-champions', [RfmReportController::class, 'topChampions'])->name('admin.rfm.champions');
        
        // Под угрозой оттока
        Route::get('/at-risk', [RfmReportController::class, 'atRiskCustomers'])->name('admin.rfm.at-risk');
        
        // Детали по конкретному сегменту (опционально)
        Route::get('/segment/{segment}', [RfmReportController::class, 'bySegment'])->name('admin.rfm.segment');



         // === Пересчёт (только запись) ===
    Route::post('/recalculate', [RfmReportController::class, 'recalculate'])->name('admin.rfm.recalculate');
    });
    
    
    });
});
