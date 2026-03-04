import { useState } from 'react';

interface EmailCollectionModalProps {
  projectName: string;
  onSubmit: (email: string, name?: string, propertyName?: string) => void;
  onSkip: () => void;
  isLoading?: boolean;
}

export function EmailCollectionModal({
  projectName,
  onSubmit,
  onSkip,
  isLoading = false,
}: EmailCollectionModalProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [propertyName, setPropertyName] = useState(projectName);
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    onSubmit(email, name || undefined, propertyName || projectName);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-xl">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Get Your Report</h2>
          <p className="text-gray-600">We'll email your PDF report instantly and save it for future reference.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
            />
            {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
          </div>

          {/* Name (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe (optional)"
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
            />
          </div>

          {/* Property Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property/Project Name
            </label>
            <input
              type="text"
              value={propertyName}
              onChange={(e) => setPropertyName(e.target.value)}
              placeholder={projectName}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
            />
          </div>

          {/* Benefits */}
          <div className="bg-indigo-50 rounded-lg p-3 mt-6">
            <div className="text-xs text-indigo-900 space-y-1">
              <div className="flex gap-2">
                <span className="text-indigo-600">✓</span>
                <span>PDF report sent to your email</span>
              </div>
              <div className="flex gap-2">
                <span className="text-indigo-600">✓</span>
                <span>Project saved to your portfolio</span>
              </div>
              <div className="flex gap-2">
                <span className="text-indigo-600">✓</span>
                <span>Future reference and comparison</span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onSkip}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50"
            >
              Skip for Now
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>📧 Get Report</>
              )}
            </button>
          </div>

          {/* Privacy Note */}
          <p className="text-xs text-gray-500 text-center mt-4">
            We'll never share your email. Unsubscribe anytime.
          </p>
        </form>
      </div>
    </div>
  );
}
