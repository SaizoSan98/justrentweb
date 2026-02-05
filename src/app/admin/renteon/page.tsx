
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { testRenteonConnection, syncCarsFromRenteon } from "./actions"
import { Loader2, CheckCircle2, XCircle, Database, RefreshCw, Car } from "lucide-react"
import { toast } from "sonner"

export default function RenteonTestPage() {
  const [loading, setLoading] = useState(false)
  const [syncLoading, setSyncLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [syncResult, setSyncResult] = useState<any>(null)

  const handleTest = async () => {
    setLoading(true)
    setResult(null)
    const res = await testRenteonConnection()
    setResult(res)
    setLoading(false)
  }

  const handleSyncCars = async () => {
    setSyncLoading(true)
    setSyncResult(null)
    const res = await syncCarsFromRenteon()
    setSyncResult(res)
    if (res.success) {
        toast.success(res.message)
    } else {
        toast.error(res.error)
    }
    setSyncLoading(false)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Renteon API Connection</h1>
        <p className="text-zinc-500">Manage integration with Renteon Rental Software.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
            <CardHeader>
            <CardTitle>Connection Status</CardTitle>
            <CardDescription>
                Test authentication and basic connectivity.
            </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
            <Button onClick={handleTest} disabled={loading} className="bg-zinc-900 text-white w-full">
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
                        <p><strong>Token Preview:</strong> {result.tokenPreview}</p>
                        <p><strong>Data Fetched (Offices):</strong> {Array.isArray(result.data) ? result.data.length : 0} records.</p>
                        <pre className="bg-white/50 p-2 rounded mt-2 text-xs overflow-x-auto max-h-40">
                            {JSON.stringify(result.data, null, 2)}
                        </pre>
                    </div>
                ) : (
                    <div className="text-sm text-red-800">
                        <p className="font-bold">{result.error}</p>
                        <pre className="bg-white/50 p-2 rounded mt-2 text-xs overflow-x-auto max-h-40">
                            {result.details}
                        </pre>
                    </div>
                )}
                </div>
            )}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
            <CardTitle>Fleet Synchronization</CardTitle>
            <CardDescription>
                Import car categories from Renteon to local database.
            </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
                <p className="flex items-start gap-2">
                    <Car className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>This will fetch all active car categories from Renteon and update your local fleet. Existing cars with matching codes will be updated, new ones created.</span>
                </p>
            </div>

            <Button onClick={handleSyncCars} disabled={syncLoading} className="bg-blue-600 hover:bg-blue-700 text-white w-full">
                {syncLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Sync Cars from Renteon
            </Button>

            {syncResult && (
                <div className={`p-4 rounded-lg border ${syncResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                        {syncResult.success ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
                        <h3 className={`font-bold ${syncResult.success ? 'text-green-800' : 'text-red-800'}`}>
                            {syncResult.success ? "Sync Completed" : "Sync Failed"}
                        </h3>
                    </div>
                    {syncResult.success && (
                        <div className="text-sm text-green-800 space-y-1">
                            <p>Created: <strong>{syncResult.stats.created}</strong></p>
                            <p>Updated: <strong>{syncResult.stats.updated}</strong></p>
                            <p>Total Processed: <strong>{syncResult.stats.total}</strong></p>
                        </div>
                    )}
                    {!syncResult.success && (
                        <div className="text-sm text-red-800">
                            {syncResult.error}
                        </div>
                    )}
                </div>
            )}
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
