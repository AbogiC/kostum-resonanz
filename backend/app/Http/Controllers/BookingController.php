<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Costume;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BookingController extends Controller
{
    public function index()
    {
        $bookings = Booking::where('user_email', auth()->user()->email)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($bookings);
    }

    public function store(Request $request)
    {
        $request->validate([
            'costume_id' => 'required|string',
            'start_date' => 'required|string',
            'end_date' => 'required|string',
            'size' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        $costume = Costume::where('id', $request->costume_id)->first();

        if (!$costume) {
            return response()->json(['error' => 'Costume not found'], 404);
        }

        $booking = Booking::create([
            'id' => Str::uuid(),
            'user_email' => auth()->user()->email,
            'user_name' => auth()->user()->name,
            'costume_id' => $request->costume_id,
            'costume_name' => $costume->name,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'size' => $request->size,
            'notes' => $request->notes,
            'status' => 'pending',
            'created_at' => now(),
        ]);

        return response()->json($booking, 201);
    }

    public function adminIndex()
    {
        $bookings = Booking::orderBy('created_at', 'desc')->get();

        return response()->json($bookings);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string',
        ]);

        $booking = Booking::where('id', $id)->first();

        if (!$booking) {
            return response()->json(['error' => 'Booking not found'], 404);
        }

        $booking->update(['status' => $request->status]);

        return response()->json($booking);
    }
}
