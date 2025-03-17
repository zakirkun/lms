import { Skeleton } from "@/components/ui/skeleton"

export default function MyCoursesLoading() {
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
        <div className="container py-8">
          <div className="flex flex-col gap-6">
            {/* Page Header */}
            <div className="space-y-1">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
              <Skeleton className="h-10 w-48 rounded-md" />
              <Skeleton className="h-10 w-32 rounded-md" />
            </div>

            {/* Course Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border rounded-lg overflow-hidden">
                  <Skeleton className="aspect-video w-full" />
                  <div className="p-4 space-y-4">
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-2 w-full rounded-full" />
                    </div>

                    <div className="flex justify-between">
                      <Skeleton className="h-9 w-24 rounded-md" />
                      <Skeleton className="h-9 w-9 rounded-md" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State (for when there are no courses) */}
            <div className="hidden border rounded-lg p-8 text-center">
              <div className="max-w-md mx-auto space-y-4">
                <Skeleton className="h-16 w-16 rounded-full mx-auto" />
                <Skeleton className="h-6 w-48 mx-auto" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6 mx-auto" />
                <Skeleton className="h-10 w-32 rounded-md mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

