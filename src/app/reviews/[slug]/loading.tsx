export default function ReviewLoading() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse max-w-4xl">
      <div className="flex items-center gap-6 mb-8">
        <div className="h-24 w-24 bg-gray-200 rounded-full shrink-0" />
        <div className="flex-1">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2" />
          <div className="h-6 bg-gray-200 rounded w-32" />
        </div>
      </div>
      <div className="bg-white rounded-lg border p-6 mb-6">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="text-center">
              <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-2" />
              <div className="h-4 bg-gray-200 rounded w-20 mx-auto" />
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-lg border p-6">
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
      </div>
    </div>
  );
}
