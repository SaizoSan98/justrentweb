
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import Link from "next/link"
import { Logo } from "@/components/ui/logo"
import { loginAction, registerAction } from "./actions"
import { LoginButton } from "@/components/auth/LoginButton"
import { RegisterButton } from "@/components/auth/RegisterButton"
import { Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft } from "lucide-react"
import { cookies } from "next/headers"
import { dictionaries, Dictionary } from "@/lib/dictionary"

// Separate component to handle search params in Suspense
function AuthForm({ searchParams, dictionary }: { searchParams?: { error?: string, tab?: string }, dictionary: Dictionary }) {
  const error = searchParams?.error
  const defaultTab = searchParams?.tab || "login"

  return (
    <div className="w-full max-w-md">
      <Link href="/" className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        {dictionary.login.back_home}
      </Link>
      <Card className="w-full shadow-2xl border-zinc-200 overflow-hidden">
        <CardHeader className="space-y-2 pb-6 bg-zinc-50 border-b border-zinc-100">
          <div className="text-center mb-4 flex justify-center">
            <Logo variant="dark" className="scale-125" />
          </div>
          <CardTitle className="text-xl font-bold text-center text-zinc-800">{dictionary.login.welcome}</CardTitle>
          <CardDescription className="text-center text-zinc-500">
            {dictionary.login.subtitle}
          </CardDescription>
        </CardHeader>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-none bg-zinc-100 p-0 h-12">
            <TabsTrigger
              value="login"
              className="rounded-none h-full data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 font-bold"
            >
              {dictionary.auth.log_in}
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="rounded-none h-full data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 font-bold"
            >
              {dictionary.auth.register}
            </TabsTrigger>
          </TabsList>

          <CardContent className="p-6">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md mb-6 border border-red-100 text-center font-medium">
                {error === 'invalid_credentials' && dictionary.login.error_invalid}
                {error === 'unauthorized' && dictionary.login.error_unauthorized}
                {error === 'email_taken' && dictionary.login.error_taken}
                {error === 'registration_failed' && dictionary.login.error_failed}
              </div>
            )}

            <TabsContent value="login" className="space-y-4 mt-0">
              <form action={loginAction} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{dictionary.auth.email_address}</Label>
                  <Input id="email" name="email" type="email" placeholder="name@example.com" required className="bg-zinc-50" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password">{dictionary.auth.password}</Label>
                    <Link href="/forgot-password" className="text-xs text-red-600 hover:underline">{dictionary.login.forgot_password}</Link>
                  </div>
                  <Input id="password" name="password" type="password" required className="bg-zinc-50" />
                </div>
                <LoginButton pendingText={dictionary.auth.signing_in} text={dictionary.auth.sign_in} />
              </form>
            </TabsContent>

            <TabsContent value="register" className="space-y-4 mt-0">
              <form action={registerAction} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-name">{dictionary.login.full_name}</Label>
                  <Input id="reg-name" name="name" type="text" placeholder="John Doe" required className="bg-zinc-50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">{dictionary.auth.email_address}</Label>
                  <Input id="reg-email" name="email" type="email" placeholder="name@example.com" required className="bg-zinc-50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">{dictionary.auth.password}</Label>
                  <Input id="reg-password" name="password" type="password" required className="bg-zinc-50" />
                </div>
                <RegisterButton pendingText={dictionary.auth.creating_account} text={dictionary.auth.create_account} />
              </form>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  )
}

export const dynamic = 'force-dynamic'

export default async function LoginPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams
  const error = typeof searchParams?.error === 'string' ? searchParams.error : undefined
  const tab = typeof searchParams?.tab === 'string' ? searchParams.tab : undefined
  const cookieStore = await cookies()
  const lang = cookieStore.get("NEXT_LOCALE")?.value || "en"
  const dictionary = dictionaries[lang as keyof typeof dictionaries] || dictionaries.en

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 p-4">
      <Suspense>
        <AuthForm searchParams={{ error, tab }} dictionary={dictionary} />
      </Suspense>
    </div>
  )
}
