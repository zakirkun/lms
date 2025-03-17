import { Skeleton } from "@/components/ui/skeleton"

export default function LessonLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header Skeleton */}
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <Skeleton className="h-9 w-24 rounded-md" />
          <div className="ml-auto flex items-center gap-4">
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col md:flex-row">
        {/* Sidebar Skeleton */}
        <div className="w-full md:w-80 border-r md:h-[calc(100vh-4rem)] md:overflow-y-auto">
          <div className="p-4 border-b">
            <Skeleton className="h-6 w-3/4" />
            <div className="flex items-center gap-2 mt-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-2 w-full" />
            </div>
          </div>

          <div className="p-4 space-y-6">
            {Array.from({ length: 3 }).map((_, sectionIndex) => (
              <div key={sectionIndex} className="space-y-2">
                <Skeleton className="h-5 w-1/2" />
                <div className="space-y-1 pl-2">
                  {Array.from({ length: 4 }).map((_, lessonIndex) => (
                    <div key={lessonIndex} className="flex items-center gap-2 p-2">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container max-w-4xl py-8">
            <div className="space-y-8">
              {/* Lesson Header */}
              <div className="space-y-2">
                <Skeleton className="h-8 w-3/4" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>

              {/* Video Player */}
              <Skeleton className="aspect-video w-full rounded-lg" />

              {/* Lesson Content */}
              <div className="space-y-4">
                <Skeleton className="h-6 w-1/2" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </div>

              {/* Resources */}
              <div className="space-y-4">
                <Skeleton className="h-6 w-1/3" />
                <div className="grid gap-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 border rounded-lg">
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <div className="space-y-1 flex-1">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-3 w-1/3" />
                      </div>
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-4 border-t">
                <Skeleton className="h-10 w-32 rounded-md" />
                <Skeleton className="h-10 w-32 rounded-md" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

