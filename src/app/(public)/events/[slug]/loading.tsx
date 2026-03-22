export default function Loading() {
  return (
    <div className="min-h-screen bg-white  animate-pulse">
      <div className="h-[400px] bg-gray-100 dark:bg-zinc-900" />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1 space-y-8">
            <div className="h-10 w-2/3 bg-gray-200 dark:bg-zinc-800 rounded-full" />
            <div className="h-4 w-full bg-gray-200 dark:bg-zinc-800 rounded-full" />
            <div className="h-4 w-full bg-gray-200 dark:bg-zinc-800 rounded-full" />
            <div className="h-4 w-1/2 bg-gray-200 dark:bg-zinc-800 rounded-full" />
          </div>
          <div className="lg:w-80 h-[500px] bg-gray-100 dark:bg-zinc-900 rounded-3xl" />
        </div>
      </div>
    </div>
  )
}
