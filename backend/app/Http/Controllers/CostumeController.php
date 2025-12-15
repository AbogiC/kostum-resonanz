<?php

namespace App\Http\Controllers;

use App\Models\Costume;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CostumeController extends Controller
{
    public function index(Request $request)
    {
        $query = Costume::query();

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $costumes = $query->get();

        return response()->json($costumes);
    }

    public function show($id)
    {
        $costume = Costume::where('id', $id)->first();

        if (!$costume) {
            return response()->json(['error' => 'Costume not found'], 404);
        }

        return response()->json($costume);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'description' => 'required|string',
            'category' => 'required|string',
            'sizes' => 'required|array',
            'images' => 'required|array',
            'price_per_day' => 'required|numeric',
            'available' => 'boolean',
        ]);

        $costume = Costume::create([
            'id' => Str::uuid(),
            'name' => $request->name,
            'description' => $request->description,
            'category' => $request->category,
            'sizes' => $request->sizes,
            'images' => $request->images,
            'price_per_day' => $request->price_per_day,
            'available' => $request->available ?? true,
            'created_at' => now(),
        ]);

        return response()->json($costume, 201);
    }

    public function update(Request $request, $id)
    {
        $costume = Costume::where('id', $id)->first();

        if (!$costume) {
            return response()->json(['error' => 'Costume not found'], 404);
        }

        $request->validate([
            'name' => 'string',
            'description' => 'string',
            'category' => 'string',
            'sizes' => 'array',
            'images' => 'array',
            'price_per_day' => 'numeric',
            'available' => 'boolean',
        ]);

        $costume->update($request->only([
            'name', 'description', 'category', 'sizes', 'images', 'price_per_day', 'available'
        ]));

        return response()->json($costume);
    }

    public function destroy($id)
    {
        $costume = Costume::where('id', $id)->first();

        if (!$costume) {
            return response()->json(['error' => 'Costume not found'], 404);
        }

        $costume->delete();

        return response()->json(['message' => 'Costume deleted successfully']);
    }
}
