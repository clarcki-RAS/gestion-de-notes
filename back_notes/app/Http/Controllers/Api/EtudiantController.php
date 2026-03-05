<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Etudiant;

class EtudiantController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
         return Etudiant::all();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
        {$request->validate([
            'nom' => 'required|string',
        ]);

        // NE PAS inclure 'moyenne' car trigger ou default DB
        $etudiant = Etudiant::create([
            'nom' => $request->nom
        ]);

        return response()->json($etudiant);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
         return Etudiant::findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
        'nom' => 'required|string'
    ]);

    $etudiant = Etudiant::findOrFail($id);

    $etudiant->update([
        'nom' => $request->nom
    ]);

    return response()->json($etudiant);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
         Etudiant::destroy($id);

        return response()->json([
            'message' => 'Etudiant supprimé'
        ]);
    }
}
