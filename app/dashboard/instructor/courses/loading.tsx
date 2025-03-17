import { Skeleton } from "@/components/ui/skeleton"

export default function InstructorCoursesLoading() {
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
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-10 w-32 rounded-md" />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
              <Skeleton className="h-10 w-48 rounded-md" />
              <Skeleton className="h-10 w-48 rounded-md" />
              <Skeleton className="h-10 w-32 rounded-md" />
            </div>

            {/* Course List */}
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <Skeleton className="h-32 w-48 rounded-md" />
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <Skeleton className="h-6 w-64" />
                          <div className="flex gap-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-16" />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Skeleton className="h-8 w-8 rounded-md" />
                          <Skeleton className="h-8 w-8 rounded-md" />
                        </div>
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <div className="flex justify-between items-center pt-2">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-4 w-16" />
                          </div>
                          <div className="flex items-center gap-1">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-4 w-16" />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Skeleton className="h-9 w-24 rounded-md" />
                          <Skeleton className="h-9 w-24 rounded-md" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 py-4">
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

