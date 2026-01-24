export default function ResearchLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section Skeleton */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white">
        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-20">
          {/* Badge */}
          <div className="h-10 w-40 bg-white/10 rounded-full mb-6 animate-pulse" />

          <div className="h-16 w-96 max-w-full bg-white/20 rounded-lg mb-4 animate-pulse" />
          <div className="h-8 w-64 bg-white/10 rounded-lg mb-8 animate-pulse" />

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6">
                <div className="h-10 w-20 bg-white/20 rounded mb-2 animate-pulse" />
                <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Sources Banner Skeleton */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3 md:py-4">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filters Skeleton */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <div className="h-10 w-64 bg-gray-100 rounded-xl animate-pulse" />
            <div className="h-10 w-32 bg-gray-100 rounded-xl animate-pulse" />
            <div className="h-10 w-32 bg-gray-100 rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Studies Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-3">
              <div className="flex items-start justify-between">
                <div className="h-5 w-2/3 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 w-8 bg-gray-100 rounded-full animate-pulse" />
              </div>
              <div className="h-3 w-1/2 bg-gray-100 rounded animate-pulse" />
              <div className="h-16 w-full bg-gray-100 rounded animate-pulse" />
              <div className="flex gap-2">
                <div className="h-6 w-20 bg-gray-100 rounded-full animate-pulse" />
                <div className="h-6 w-24 bg-gray-100 rounded-full animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
