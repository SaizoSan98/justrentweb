import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginAction } from "./actions"
import { Suspense } from "react"

// Separate component to handle search params in Suspense
function LoginForm({ searchParams }: { searchParams?: { error?: string } }) {
  const error = searchParams?.error

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-black text-center">Admin Login</CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to access the admin panel
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md mb-4 border border-red-100 text-center font-medium">
            {error === 'invalid_credentials' && "Invalid email or password"}
            {error === 'unauthorized' && "You don't have permission to access the admin panel"}
          </div>
        )}
        <form action={loginAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="admin@justrent.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          <Button type="submit" className="w-full bg-zinc-900 text-white hover:bg-zinc-800">
            Sign In
          </Button>
        </form>
      </CardContent>
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <Suspense>
        <LoginForm searchParams={{ error }} />
      </Suspense>
    </div>
  )
}
