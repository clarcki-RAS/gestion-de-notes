<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Note;
class NoteController extends Controller
{
    public function index()
    {
        return Note::with(['etudiant', 'matiere'])->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'etudiant_id' => 'required|exists:etudiants,id',
            'matiere_id' => 'required|exists:matieres,id',
            'note' => 'required|numeric|min:0|max:20'
        ]);
        $userId = auth()->id();
        if ($userId) {
            DB::statement("SET app.current_user_id = '" . $userId . "'");
        }
        $machineHote = $request->input('machine_hote', null);
        if ($machineHote) {
            DB::statement("SELECT set_config('app.current_machine_hote', '" . $machineHote . "', true)");
        }
        $note = Note::create($request->only(['etudiant_id', 'matiere_id', 'note']));
        return response()->json($note);
    }

    public function show(string $id)
    {
        return Note::with(['etudiant', 'matiere'])->findOrFail($id);
    }

    public function update(Request $request, string $id)
    {
        $note = Note::findOrFail($id);
        $request->validate([
            'etudiant_id' => 'sometimes|required|exists:etudiants,id',
            'matiere_id' => 'sometimes|required|exists:matieres,id',
            'note' => 'sometimes|required|numeric|min:0|max:20'
        ]);
        $userId = auth()->id();
        if ($userId) {
            DB::statement("SET app.current_user_id = '" . $userId . "'");
        }
        $machineHote = $request->input('machine_hote', null);
        if ($machineHote) {
            DB::statement("SELECT set_config('app.current_machine_hote', '" . $machineHote . "', true)");
        }
        $note->update($request->only(['etudiant_id', 'matiere_id', 'note']));
        return response()->json($note);
    }

    public function destroy(string $id)
    {
        $note = Note::findOrFail($id);
        $userId = auth()->id();
        if ($userId) {
            DB::statement("SET app.current_user_id = '" . $userId . "'");
        }
        $machineHote = request()->input('machine_hote', null);
        if ($machineHote) {
            DB::statement("SELECT set_config('app.current_machine_hote', '" . $machineHote . "', true)");
        }
        $note->delete();
        return response()->json(['message' => 'Note supprimée']);
    }
}