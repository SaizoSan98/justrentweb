
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { testRenteonConnection } from "./actions"
import { Loader2, CheckCircle2, XCircle, Database } from "lucide-react"

export default function RenteonTestPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleTest = async () => {
    setLoading(true)
    setResult(null)
    const res = await testRenteonConnection()
    setResult(res)
    setLoading(false)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Renteon API Connection</h1>
        <p className="text-zinc-500">Test the connection to the Renteon Rental Software API.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
          <CardDescription>
            Click the button below to authenticate and fetch a sample of data (Offices list) from Renteon.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button onClick={handleTest} disabled={loading} className="bg-zinc-900 text-white">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
            Test Connection
          </Button>

          {result && (
            <div className={`p-4 rounded-lg border ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                {result.success ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                )}
                <h3 className={`font-bold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                    {result.success ? "Connection Successful" : "Connection Failed"}
                </h3>
              </div>
              
              {result.success ? (
                  <div className="space-y-2 text-sm text-green-800">
                      <p>Successfully authenticated with Renteon API.</p>
                      <p><strong>Token Preview:</strong> {result.tokenPreview}</p>
                      <p><strong>Data Fetched (Offices):</strong> {Array.isArray(result.data) ? result.data.length : 0} records found.</p>
                      <pre className="bg-white/50 p-2 rounded mt-2 text-xs overflow-x-auto">
                          {JSON.stringify(result.data, null, 2).slice(0, 500)}...
                      </pre>
                  </div>
              ) : (
                  <div className="text-sm text-red-800">
                      <p className="font-bold">{result.error}</p>
                      <pre className="bg-white/50 p-2 rounded mt-2 text-xs overflow-x-auto">
                          {result.details}
                      </pre>
                  </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
