import { cookies } from "next/headers"
import { dictionaries } from "@/lib/dictionary"
import { ForgotPasswordClient } from "./ForgotPasswordClient"

export default async function ForgotPasswordPage() {
    const cookieStore = await cookies()
    const lang = cookieStore.get("NEXT_LOCALE")?.value || "en"
    const dictionary = dictionaries[lang as keyof typeof dictionaries] || dictionaries.en

    return <ForgotPasswordClient dictionary={dictionary} />
}
