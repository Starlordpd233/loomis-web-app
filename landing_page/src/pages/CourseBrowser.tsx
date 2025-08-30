import { useEffect } from 'react';

export default function CourseBrowser() {
  useEffect(() => {
    // Redirect to the course browser running on port 3001
    window.location.href = 'http://localhost:3001';
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#98252b] mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to course browser...</p>
      </div>
    </div>
  );
}