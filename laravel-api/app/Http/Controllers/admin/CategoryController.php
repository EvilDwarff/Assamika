<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Category;

class CategoryController extends Controller
{
    /**
     * Display a listing of the categories.
     */
    public function index()
    {
        $categories = Category::all();

        return response()->json([
            'data' => $categories,
            'status' => 200
        ], 200);
    }

    /**
     * Store a newly created category in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories',
            'status' => 'sometimes|integer|in:0,1' // опционально, по умолчанию 1
        ]);

        // Устанавливаем статус по умолчанию, если не передан
        $validated['status'] = $validated['status'] ?? 1;

        $category = Category::create($validated);

        return response()->json([
            'data' => $category,
            'status' => 201
        ], 201);
    }

    /**
     * Display the specified category.
     */
    public function show($id)
    {
        $category = Category::findOrFail($id);

        return response()->json([
            'data' => $category,
            'status' => 200
        ], 200);
    }

    /**
     * Update the specified category in storage.
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
            'status' => 200
        ], 200);
    }

    /**
     * Remove the specified category from storage.
     */
    public function destroy($id)
    {
        $category = Category::findOrFail($id);
        $category->delete();

        return response()->json([
            'message' => 'Category deleted successfully',
            'status' => 200
        ], 200);
    }
}
