export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Skeleton */}
      <div className="relative overflow-hidden bg-gray-100 py-20 sm:py-32 dark:bg-zinc-900 animate-pulse">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="h-12 w-3/4 bg-gray-200 dark:bg-zinc-800 rounded-full mx-auto mb-6" />
          <div className="h-4 w-1/2 bg-gray-200 dark:bg-zinc-800 rounded-full mx-auto" />
        </div>
      </div>

      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end justify-between">
          <div className="space-y-4">
            <div className="h-8 w-48 bg-gray-200 dark:bg-zinc-800 rounded-full animate-pulse" />
            <div className="h-4 w-64 bg-gray-200 dark:bg-zinc-800 rounded-full animate-pulse" />
          </div>
          <div className="h-10 w-full sm:w-64 bg-gray-200 dark:bg-zinc-800 rounded-full animate-pulse" />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-zinc-800 shadow-sm animate-pulse">
              <div className="aspect-[16/9] bg-gray-200 dark:bg-zinc-800" />
              <div className="p-6 space-y-4">
                <div className="h-6 w-3/4 bg-gray-200 dark:bg-zinc-800 rounded-full" />
                <div className="h-4 w-full bg-gray-200 dark:bg-zinc-800 rounded-full" />
                <div className="flex justify-between items-center pt-4">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-zinc-800 rounded-full" />
                  <div className="h-4 w-12 bg-gray-200 dark:bg-zinc-800 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
