export default function GlossaryLoading() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      <div className="h-10 bg-gray-200 rounded w-1/4 mb-6" />
      <div className="flex gap-2 mb-8 flex-wrap">
        {[...Array(26)].map((_, i) => (
          <div key={i} className="h-10 w-10 bg-gray-200 rounded" />
        ))}
      </div>
      <div className="grid gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border p-4">
            <div className="h-5 bg-gray-200 rounded w-1/4 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
