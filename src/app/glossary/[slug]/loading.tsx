export default function GlossaryTermLoading() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse max-w-3xl">
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
      <div className="h-10 bg-gray-200 rounded w-1/2 mb-6" />
      <div className="bg-white rounded-lg border p-6 mb-6">
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
      </div>
      <div className="bg-gray-50 rounded-lg border p-6">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
        </div>
      </div>
    </div>
  );
}
