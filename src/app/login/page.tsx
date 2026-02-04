
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { loginAction, registerAction } from "./actions"
import { LoginButton } from "@/components/auth/LoginButton"
import { RegisterButton } from "@/components/auth/RegisterButton"
import { Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Separate component to handle search params in Suspense
function AuthForm({ searchParams }: { searchParams?: { error?: string, tab?: string } }) {
  const error = searchParams?.error
  const defaultTab = searchParams?.tab || "login"

  return (
    <Card className="w-full max-w-md shadow-2xl border-zinc-200 overflow-hidden">
      <CardHeader className="space-y-2 pb-6 bg-zinc-50 border-b border-zinc-100">
        <div className="text-center mb-4 flex justify-center">
            <Image 
              src="/jrlogo.PNG" 
              alt="JustRent Logo" 
              width={360} 
              height={120} 
              className="h-24 w-auto object-contain" 
            />
        </div>
        <CardTitle className="text-xl font-bold text-center text-zinc-800">Welcome</CardTitle>
        <CardDescription className="text-center text-zinc-500">
          Sign in or create an account to continue
        </CardDescription>
      </CardHeader>
      
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 rounded-none bg-zinc-100 p-0 h-12">
          <TabsTrigger 
            value="login" 
            className="rounded-none h-full data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 font-bold"
          >
            Log In
          </TabsTrigger>
          <TabsTrigger 
            value="register" 
            className="rounded-none h-full data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 font-bold"
          >
            Register
          </TabsTrigger>
        </TabsList>

        <CardContent className="p-6">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md mb-6 border border-red-100 text-center font-medium">
              {error === 'invalid_credentials' && "Invalid email or password"}
              {error === 'unauthorized' && "You don't have permission to access the admin panel"}
              {error === 'email_taken' && "This email is already registered"}
              {error === 'registration_failed' && "Registration failed. Please try again."}
            </div>
          )}

          <TabsContent value="login" className="space-y-4 mt-0">
            <form action={loginAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="name@example.com" required className="bg-zinc-50" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  <a href="#" className="text-xs text-red-600 hover:underline">Forgot password?</a>
                </div>
                <Input id="password" name="password" type="password" required className="bg-zinc-50" />
              </div>
              <LoginButton />
            </form>
          </TabsContent>

          <TabsContent value="register" className="space-y-4 mt-0">
            <form action={registerAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reg-name">Full Name</Label>
                <Input id="reg-name" name="name" type="text" placeholder="John Doe" required className="bg-zinc-50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-email">Email</Label>
                <Input id="reg-email" name="email" type="email" placeholder="name@example.com" required className="bg-zinc-50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password">Password</Label>
                <Input id="reg-password" name="password" type="password" required className="bg-zinc-50" />
              </div>
              <RegisterButton />
            </form>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  )
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const error = typeof params?.error === 'string' ? params.error : undefined
  const tab = typeof params?.tab === 'string' ? params.tab : undefined

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 p-4">
      <Suspense>
        <AuthForm searchParams={{ error, tab }} />
      </Suspense>
    </div>
  )
}
