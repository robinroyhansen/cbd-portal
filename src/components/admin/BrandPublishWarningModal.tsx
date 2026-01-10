'use client';

interface BrandPublishWarningModalProps {
  isOpen: boolean;
  brandName: string;
  onCancel: () => void;
  onPublishReviewOnly: () => void;
  onPublishBoth: () => void;
  isLoading?: boolean;
}

export function BrandPublishWarningModal({
  isOpen,
  brandName,
  onCancel,
  onPublishReviewOnly,
  onPublishBoth,
  isLoading = false
}: BrandPublishWarningModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-amber-900">Brand Not Published</h2>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p className="text-gray-700 mb-4">
            The brand <strong>"{brandName}"</strong> is not published.
          </p>
          <p className="text-gray-600 text-sm">
            This review won't be visible on the public site until the brand is also published.
          </p>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onPublishReviewOnly}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm font-medium"
          >
            {isLoading ? 'Publishing...' : 'Publish Review Only'}
          </button>
          <button
            onClick={onPublishBoth}
            disabled={isLoading}
            className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
          >
            {isLoading ? 'Publishing...' : 'Publish Both'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface UnpublishBrandWarningModalProps {
  isOpen: boolean;
  brandName: string;
  reviewCount: number;
  onCancel: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function UnpublishBrandWarningModal({
  isOpen,
  brandName,
  reviewCount,
  onCancel,
  onConfirm,
  isLoading = false
}: UnpublishBrandWarningModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-red-50 border-b border-red-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-red-900">Unpublish Brand?</h2>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p className="text-gray-700 mb-4">
            The brand <strong>"{brandName}"</strong> has{' '}
            <strong>{reviewCount} published {reviewCount === 1 ? 'review' : 'reviews'}</strong>.
          </p>
          <p className="text-gray-600 text-sm">
            Unpublishing this brand will make {reviewCount === 1 ? 'this review' : 'these reviews'} invisible on the public site, even though {reviewCount === 1 ? 'it remains' : 'they remain'} published.
          </p>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
          >
            {isLoading ? 'Unpublishing...' : 'Unpublish Anyway'}
          </button>
        </div>
      </div>
    </div>
  );
}
