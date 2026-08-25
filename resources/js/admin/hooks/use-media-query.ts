import {useEffect, useState} from 'react';

/**
 * Подписка на медиазапрос.
 *
 * Первый рендер всегда отдаёт false: matchMedia недоступен до монтирования,
 * значение уточняется в эффекте. Для аудита доступности это безопасно —
 * от результата зависит только aria-orientation, а не сама разметка.
 */
export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia(query);
        const onChange = () => setMatches(mediaQuery.matches);

        onChange();
        mediaQuery.addEventListener('change', onChange);

        return () => mediaQuery.removeEventListener('change', onChange);
    }, [query]);

    return matches;
}
