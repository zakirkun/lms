import { Skeleton } from "@/components/ui/skeleton"

export default function SettingsLoading() {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Sidebar Skeleton */}
      <div className="w-full md:w-64 md:flex-shrink-0 border-r">
        <div className="flex h-14 items-center border-b px-4">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="p-4 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="container py-8 max-w-4xl">
          <div className="flex flex-col gap-8">
            {/* Settings Header */}
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>

            {/* Settings Tabs */}
            <div className="border-b space-y-4">
              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-32 rounded-md" />
                ))}
              </div>
            </div>

            {/* Settings Form */}
            <div className="space-y-6">
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full rounded-md" />
                  <Skeleton className="h-3 w-64" />
                </div>

                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <div className="grid gap-4 md:grid-cols-2">
                    <Skeleton className="h-10 w-full rounded-md" />
                    <Skeleton className="h-10 w-full rounded-md" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <Skeleton className="h-10 w-32 rounded-md" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Skeleton className="h-5 w-5 rounded-md" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Skeleton className="h-10 w-32 rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

