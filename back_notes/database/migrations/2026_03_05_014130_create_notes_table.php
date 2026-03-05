<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('notes', function (Blueprint $table) {
        $table->id();

        $table->foreignId('etudiant_id')
            ->constrained()
            ->onDelete('cascade');

        $table->foreignId('matiere_id')
            ->constrained()
            ->onDelete('cascade');

        $table->decimal('note', 4, 2);

        $table->timestamps();

        $table->unique(['etudiant_id', 'matiere_id']);
    });
        DB::statement("
        ALTER TABLE notes
        ADD CONSTRAINT check_note
        CHECK (note >= 0 AND note <= 20)
    ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notes');
    }
};
