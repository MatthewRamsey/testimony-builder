import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <div className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-indigo-600 to-indigo-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-5xl font-extrabold mb-6">
                Testimony Pro
              </h1>
              <p className="text-xl mb-8 max-w-2xl mx-auto">
                Craft your personal faith testimony with guided storytelling frameworks.
                Share your journey, inspire others, and preserve your story.
              </p>
              <p className="text-indigo-100 mb-6 text-sm">
                ✓ No sign-up required  ✓ Start in 30 seconds  ✓ 100% free to try
              </p>
              <div className="flex gap-4 justify-center items-center">
                <Link
                  href="/create/choose-framework"
                  className="rounded-md bg-white px-8 py-4 text-lg font-bold text-indigo-600 shadow-lg hover:bg-indigo-50 hover:shadow-xl transition-all inline-flex items-center justify-center"
                >
                  Start Writing Now
                </Link>
                <Link
                  href="/gallery"
                  className="rounded-md bg-indigo-500 px-6 py-[1.125rem] text-base font-semibold text-white shadow-sm hover:bg-indigo-400 inline-flex items-center justify-center"
                >
                  View Gallery
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need to tell your story
            </h2>
            <p className="text-lg text-gray-600">
              Choose from multiple frameworks or write freely
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Multiple Frameworks</h3>
              <p className="text-gray-600">
                Choose from Before → Encounter → After, Life Timeline, Seasons of Growth, or Free-Form
              </p>
            </div>

            <div className="text-center">
              <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">PDF Export</h3>
              <p className="text-gray-600">
                Export your testimony as a beautiful PDF to share or keep forever
              </p>
            </div>

            <div className="text-center">
              <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276a1 1 0 010 4.552L15 10zM4 6h8a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Read-Only Sharing</h3>
              <p className="text-gray-600">
                Share a clean, read-only link so others can read your story
              </p>
            </div>
          </div>
        </div>

      </div>
    </main>
  )
}
