<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Category;

class CategoryController extends Controller
{
    /**
     * Отобразить список всех категорий.
     */
    public function index()
    {
        $categories = Category::all();

        return response()->json([
            'data' => $categories,
            'message' => 'Список категорий загружен',
            'status' => 200
        ], 200);
    }

    /**
     * Создать новую категорию.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories',
            'status' => 'sometimes|integer|in:0,1'
        ]);

        $validated['status'] = $validated['status'] ?? 1;

        $category = Category::create($validated);

        return response()->json([
            'data' => $category,
            'message' => 'Категория успешно создана',
            'status' => 201
        ], 201);
    }

    /**
     * Показать конкретную категорию.
     */
    public function show($id)
    {
        $category = Category::findOrFail($id);

        return response()->json([
            'data' => $category,
            'message' => 'Категория найдена',
            'status' => 200
        ], 200);
    }

    /**
     * Обновить категорию.
     */
    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255|unique:categories,name,' . $id,
            'status' => 'sometimes|integer|in:0,1'
        ]);

        $category->update($validated);

        return response()->json([
            'data' => $category,
            'message' => 'Категория успешно обновлена',
            'status' => 200
        ], 200);
    }

    /**
     * Удалить категорию.
     */
    public function destroy($id)
    {
        $category = Category::findOrFail($id);
        $category->delete();

        return response()->json([
            'data' => null,
            'message' => 'Категория успешно удалена',
            'status' => 200
        ], 200);
    }
}
