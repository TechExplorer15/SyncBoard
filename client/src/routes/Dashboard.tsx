/**
 * Dashboard — placeholder for Phase 3 (workspace list).
 * For now, shows a welcome message to confirm auth works.
 */
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/layout/Navbar';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome{user ? `, ${user.name}` : ''}!
        </h1>
        <p className="text-gray-500 mt-2">
          Your workspaces will appear here. (Coming in Phase 3)
        </p>

        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="inline-flex h-16 w-16 bg-brand-50 rounded-full items-center justify-center mb-4">
            <svg className="h-8 w-8 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">No workspaces yet</h2>
          <p className="text-gray-500 text-sm mt-1">
            Create a workspace to start organizing your projects.
          </p>
        </div>
      </main>
    </div>
  );
}
