<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Note;

class NoteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Note::with(['etudiant', 'matiere'])->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'etudiant_id' => 'required|exists:etudiants,id',
            'matiere_id' => 'required|exists:matieres,id',
            'note' => 'required|numeric|min:0|max:20'
        ]);

        // ⚡ Triggers PostgreSQL utilisent cette variable
        DB::statement("SET app.current_user_id = '1'"); // temporaire pour test

        $note = Note::create($request->only(['etudiant_id', 'matiere_id', 'note']));

        return response()->json($note);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return Note::with(['etudiant', 'matiere'])->findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $note = Note::findOrFail($id);

        $request->validate([
            'etudiant_id' => 'sometimes|required|exists:etudiants,id',
            'matiere_id' => 'sometimes|required|exists:matieres,id',
            'note' => 'sometimes|required|numeric|min:0|max:20'
        ]);

        DB::statement("SET app.current_user_id = '1'"); // temporaire pour test

        $note->update($request->only(['etudiant_id', 'matiere_id', 'note']));

        return response()->json($note);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $note = Note::findOrFail($id);

        DB::statement("SET app.current_user_id = '1'"); // temporaire pour test

        $note->delete();

        return response()->json(['message' => 'Note supprimée']);
    }
}
