
@php
    use App\Models\User;
    /**
     * @var User $user
     */
    $user = auth()->user();
@endphp
<div class="flex items-center gap-4 text-custom-600" style="--c-400:var(--primary-400);--c-600:var(--primary-600);">
    {{$user->email}}
</div>
