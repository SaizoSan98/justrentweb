import { cookies } from "next/headers"
import { dictionaries } from "@/lib/dictionary"
import { VerifyClient } from "./VerifyClient"

export default async function VerifyPage() {
    const cookieStore = await cookies()
    const lang = cookieStore.get("NEXT_LOCALE")?.value || "en"
    const dictionary = dictionaries[lang as keyof typeof dictionaries] || dictionaries.en

    return <VerifyClient dictionary={dictionary} />
}
