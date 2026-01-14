<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\TempImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Validator;

class TempImageController extends Controller
{
    public function store(Request $request)
    {
        // ожидаем images[]
        $validator = Validator::make($request->all(), [
            'images'   => 'required|array|min:1',
            'images.*' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 400,
                'errors' => $validator->errors(),
            ], 400);
        }

        $tempDir = public_path('uploads/temp');
        if (!File::exists($tempDir)) {
            File::makeDirectory($tempDir, 0755, true);
        }

        $saved = [];

        foreach ($request->file('images') as $image) {
            $imageName = time() . '-' . uniqid() . '.' . $image->extension();
            $image->move($tempDir, $imageName);

            $temp = TempImage::create(['name' => $imageName]);
            $saved[] = $temp;
        }

        return response()->json([
            'status'  => 200,
            'message' => 'Images uploaded successfully',
            'data'    => $saved,
        ], 200);
    }

    // опционально: удалить временную картинку
    public function destroy($id)
    {
        $temp = TempImage::find($id);
        if (!$temp) {
            return response()->json(['status' => 404, 'message' => 'Temp image not found'], 404);
        }

        File::delete(public_path('uploads/temp/' . $temp->name));
        $temp->delete();

        return response()->json(['status' => 200, 'message' => 'Temp image deleted'], 200);
    }
}
