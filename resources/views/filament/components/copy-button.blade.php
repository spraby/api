<button x-data="{ copied: false }"
        x-on:click.prevent="
                    $event.stopPropagation();
                    navigator.clipboard.writeText('{{ $text }}')
                        .then(() => {
                            copied = true;
                            setTimeout(() => { copied = false }, 2000);
                        });
                "
        class="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
        title="Copy email">
    <svg x-show="!copied" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
         stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
    </svg>
    <svg x-show="copied" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-500" fill="none"
         viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
    </svg>
</button>
