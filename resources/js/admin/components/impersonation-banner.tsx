import {router} from "@inertiajs/react"
import {LogOutIcon} from "lucide-react"

import {Button} from "@/components/ui/button"
import {useLang} from "@/lib/lang"
import type {User} from "@/types/inertia"

interface ImpersonationBannerProps {
    user: User
}

export function ImpersonationBanner({user}: ImpersonationBannerProps) {
    const {t} = useLang()

    const handleStopImpersonating = () => {
        router.post("/sb/admin/impersonate/stop")
    }

    const userName = `${user.first_name} ${user.last_name}`.trim() || user.email

    return (
        <div className="bg-amber-500 text-amber-950 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
                <span>
                    {t('admin.impersonation.banner_text') || 'You are impersonating'}{' '}
                    <span className="font-semibold">
                        {userName}
                    </span>
                </span>
            </div>
            <Button
                variant="outline"
                size="sm"
                onClick={handleStopImpersonating}
                className="bg-amber-600 border-amber-700 text-amber-950 hover:bg-amber-700 hover:text-white"
            >
                <LogOutIcon className="mr-2 h-4 w-4"/>
                {t('admin.impersonation.stop') || 'Stop Impersonating'}
            </Button>
        </div>
    )
}