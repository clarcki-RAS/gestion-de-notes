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
        Schema::create('audit_notes', function (Blueprint $table) {
        $table->id();

        $table->string('type_operation');
        $table->timestamp('date_mise_a_jour');

        $table->unsignedBigInteger('etudiant_id');
        $table->string('nom');
        $table->string('design');

        $table->decimal('note_ancien', 4, 2)->nullable();
        $table->decimal('note_nouv', 4, 2)->nullable();

        $table->foreignId('user_id')
            ->constrained()
            ->onDelete('cascade');

        $table->string('name');           // ou username
        $table->string('machine_hote')->nullable();  // jsp encore

        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_notes');
    }
};
