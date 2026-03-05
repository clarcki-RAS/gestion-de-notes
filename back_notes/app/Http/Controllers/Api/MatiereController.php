<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Matiere;

class MatiereController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
       return Matiere::all();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
         $request->validate([
            'design' => 'required|string',
            'coef' => 'required|integer|min:1'
        ]);

        $matiere = Matiere::create([
            'design' => $request->design,
            'coef' => $request->coef
        ]);

        return response()->json($matiere);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return Matiere::findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $matiere = Matiere::findOrFail($id);

        $request->validate([
            'design' => 'sometimes|required|string',
            'coef' => 'sometimes|required|integer|min:1'
        ]);

        $matiere->update($request->only(['design', 'coef']));

        return response()->json($matiere);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $matiere = Matiere::findOrFail($id);
        $matiere->delete();

        return response()->json(['message' => 'Matière supprimée']);
    }
}
