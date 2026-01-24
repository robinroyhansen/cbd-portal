export default function ConditionsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Breadcrumb skeleton */}
      <div className="h-4 w-48 bg-gray-200 rounded mb-8 animate-pulse" />

      {/* Hero Section Skeleton */}
      <div className="text-center mb-12">
        <div className="h-12 w-80 mx-auto bg-gray-200 rounded-lg mb-4 animate-pulse" />
        <div className="h-6 w-96 max-w-full mx-auto bg-gray-100 rounded mb-2 animate-pulse" />
        <div className="h-6 w-72 mx-auto bg-gray-100 rounded animate-pulse" />
      </div>

      {/* Stats Banner Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
            <div className="h-10 w-16 mx-auto bg-gray-200 rounded mb-2 animate-pulse" />
            <div className="h-4 w-24 mx-auto bg-gray-100 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Search and Filters Skeleton */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="h-12 flex-1 bg-gray-100 rounded-xl animate-pulse" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 w-24 bg-gray-100 rounded-full animate-pulse" />
            ))}
          </div>
        </div>
      </div>

      {/* Conditions Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 flex items-start gap-4">
            <div className="h-12 w-12 bg-gray-200 rounded-xl flex-shrink-0 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-full bg-gray-100 rounded animate-pulse" />
              <div className="h-3 w-2/3 bg-gray-100 rounded animate-pulse" />
              <div className="flex gap-2 pt-2">
                <div className="h-6 w-20 bg-gray-100 rounded-full animate-pulse" />
                <div className="h-6 w-16 bg-gray-100 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
