<?php
    $header = $getHeader();
    $type = $getType();
?>


<x-dynamic-component :component="$getFieldWrapperView()">
    @if($type === 'info')
        <div class="flex bg-blue-50 border-blue-300 border-solid border rounded-2xl p-5">
            {{$header}}
        </div>
    @endif

    @if($type === 'warning')
        <div class="flex bg-orange-50 border-orange-300 border-solid border rounded-2xl p-5">
            {{$header}}
        </div>
    @endif

    @if($type === 'danger')
        <div class="flex bg-red-50 border-red-300 border-solid border rounded-2xl p-5">
            {{$header}}
        </div>
    @endif

</x-dynamic-component>
