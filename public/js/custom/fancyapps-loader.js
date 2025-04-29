function check(attempts){
    setTimeout(() => {
        if(window?.Fancybox){
            Fancybox.bind('[data-fancybox^="selector-"]');
        }else if (attempts > 0){
            check(attempts--);
        }
    }, 100)
}

check(20);

