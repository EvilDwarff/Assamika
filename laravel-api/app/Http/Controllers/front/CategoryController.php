<?php

namespace App\Http\Controllers\front;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    // GET /api/categories
    public function index(Request $request)
    {
        // статус у категорий у тебя 1/0 (как в админке)
        $categories = Category::query()
            ->where('status', 1)
            ->orderBy('name')
            ->withCount([
                // считаем только публичные товары: не inactive
                'products as products_count' => function ($q) {
                    $q->whereIn('status', ['in_stock', 'sold_out']);
                }
            ])
            ->get(['id', 'name']);

        return response()->json([
            'status' => 200,
            'data' => $categories
        ]);
    }
}
