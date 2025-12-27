import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Welcome to Northwestern University</h1>
        <p className="text-gray-600 text-center mb-8">Explore our academic catalog and find the perfect courses for your studies.</p>
        <div className="flex justify-center">
          <Link 
            to="/courses-a-z" 
            className="bg-purple-900 text-white px-6 py-3 rounded-md font-medium hover:bg-purple-800 transition-colors"
          >
            View Courses A-Z
          </Link>
        </div>
      </div>
    </div>
  );
}