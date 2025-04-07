
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';

const HomePage = () => {
  // Check if user is logged in
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('userData');
  const isLoggedIn = !!token && !!userData;
  
  // Parse user data to determine if user or admin
  let userType: 'user' | 'admin' | undefined;
  let userName: string | undefined;
  
  if (isLoggedIn && userData) {
    try {
      const parsedData = JSON.parse(userData);
      userType = parsedData.admin_id ? 'admin' : 'user';
      userName = parsedData.name;
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} userType={userType} userName={userName} />
      
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight">
            Find Your Perfect <span className="text-blue-600">Career Match</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            AI-powered job matching connects you to opportunities that align with your skills and experience. Let's find your next career move.
          </p>
          
          {/* Search Box */}
          <div className="mt-10 max-w-xl mx-auto">
            <form action="/jobs" className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input 
                type="text" 
                name="search" 
                placeholder="Search jobs by title, skill, or keyword" 
                className="pl-10 h-12 rounded-full"
              />
              <Button type="submit" className="absolute right-1 top-1 rounded-full px-4">
                Search
              </Button>
            </form>
          </div>
          
          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/jobs">
              <Button size="lg" className="px-8">
                Browse All Jobs
              </Button>
            </Link>
            {!isLoggedIn ? (
              <Link to="/register">
                <Button size="lg" variant="outline" className="px-8">
                  Create Account
                </Button>
              </Link>
            ) : userType === 'user' ? (
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="px-8">
                  My Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/admin/dashboard">
                <Button size="lg" variant="outline" className="px-8">
                  Admin Dashboard
                </Button>
              </Link>
            )}
          </div>
        </div>
        
        {/* Features Section */}
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">How It Works</h2>
              <p className="mt-4 text-lg text-gray-600">
                SkillSeeker uses AI to match your profile with the perfect job opportunities
              </p>
            </div>
            
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center">
                <div className="bg-blue-100 p-6 rounded-full">
                  <svg className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900">Create Your Profile</h3>
                <p className="mt-2 text-base text-gray-600 text-center">
                  Add your skills, experience, and preferences to help us match you with the best opportunities
                </p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="bg-blue-100 p-6 rounded-full">
                  <svg className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900">Get AI Recommendations</h3>
                <p className="mt-2 text-base text-gray-600 text-center">
                  Our AI analyzes your profile to find job listings that match your skillset and career goals
                </p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="bg-blue-100 p-6 rounded-full">
                  <svg className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900">Apply with Confidence</h3>
                <p className="mt-2 text-base text-gray-600 text-center">
                  Apply to jobs knowing that they're well-matched to your skills and experience
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="bg-gray-100 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">SkillSeeker</h2>
              <p className="mt-2 text-gray-600">
                Connecting talent with opportunity through AI-powered job matching
              </p>
              <div className="mt-6 flex justify-center space-x-6">
                <Link to="/about" className="text-gray-600 hover:text-gray-900">About</Link>
                <Link to="/privacy" className="text-gray-600 hover:text-gray-900">Privacy</Link>
                <Link to="/terms" className="text-gray-600 hover:text-gray-900">Terms</Link>
                <Link to="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
              </div>
              <p className="mt-8 text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} SkillSeeker. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default HomePage;
