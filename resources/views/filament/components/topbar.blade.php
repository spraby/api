
@php
    use App\Models\User;
    /**
     * @var User $user
     */
    $user = auth()->user();
@endphp
<div class="flex items-center gap-4 text-emerald-600">
    {{$user->email}}
</div>
