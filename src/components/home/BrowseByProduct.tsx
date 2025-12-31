import Link from 'next/link';

const productTypes = [
  {
    name: 'CBD Oils',
    slug: 'cbd-oils',
    icon: '💧',
    description: 'Full spectrum, broad spectrum, and isolate oils'
  },
  {
    name: 'CBD Capsules',
    slug: 'cbd-capsules',
    icon: '💊',
    description: 'Convenient pre-measured doses'
  },
  {
    name: 'CBD Topicals',
    slug: 'cbd-topicals',
    icon: '🧴',
    description: 'Creams, balms, and lotions for targeted relief'
  },
  {
    name: 'CBD Edibles',
    slug: 'cbd-edibles',
    icon: '🍬',
    description: 'Gummies and food products'
  }
];

export function BrowseByProduct() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Explore CBD Products</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Learn about different CBD product types and find what works best for you
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {productTypes.map((product) => (
            <Link
              key={product.slug}
              href={`/categories/products`}
              className="group bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all text-center"
            >
              <span className="text-4xl block mb-4">{product.icon}</span>
              <h3 className="font-semibold text-gray-900 group-hover:text-green-700 mb-2">
                {product.name}
              </h3>
              <p className="text-sm text-gray-500">{product.description}</p>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/categories/products"
            className="text-green-600 hover:text-green-800 font-medium"
          >
            View all product guides →
          </Link>
        </div>
      </div>
    </section>
  );
}