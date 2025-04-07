
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search, MapPin, Briefcase } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import JobCard from '@/components/jobs/JobCard';

interface Job {
  job_id: string;
  title: string;
  company_name: string;
  location: string;
  description: string;
  skills_required: string;
  salary_range?: string;
  posted_date: string;
}

interface Pagination {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

const JobsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ 
    total: 0, pages: 0, page: 1, limit: 10 
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Check if user is logged in
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('userData');
  const isLoggedIn = !!token && !!userData;
  
  // Parse user data
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

  // Form state
  const [formState, setFormState] = useState({
    search: searchParams.get('search') || '',
    location: searchParams.get('location') || '',
  });

  const fetchJobs = async () => {
    setIsLoading(true);
    
    const search = searchParams.get('search') || '';
    const location = searchParams.get('location') || '';
    const page = searchParams.get('page') || '1';
    
    try {
      const response = await fetch(
        `/api/jobs?search=${search}&location=${location}&page=${page}&limit=10`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      
      const data = await response.json();
      setJobs(data.jobs);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load jobs. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (formState.search) params.set('search', formState.search);
    if (formState.location) params.set('location', formState.location);
    params.set('page', '1');
    
    setSearchParams(params);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  };

  const handleApply = async (jobId: string) => {
    if (!isLoggedIn) {
      toast({
        title: "Login Required",
        description: "Please log in to apply for this job.",
      });
      return;
    }
    
    try {
      const response = await fetch(`/api/user/apply/${jobId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to apply for job');
      }
      
      toast({
        title: "Application Submitted",
        description: "Your application has been submitted successfully.",
      });
    } catch (error) {
      console.error('Application error:', error);
      toast({
        variant: "destructive",
        title: "Application Failed",
        description: error instanceof Error ? error.message : "Failed to apply for this job.",
      });
    }
  };

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} userType={userType} userName={userName} />
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search and filter section */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input 
                    type="text" 
                    name="search" 
                    placeholder="Job title, keyword, or company" 
                    className="pl-10"
                    value={formState.search}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input 
                    type="text" 
                    name="location" 
                    placeholder="City, state, or remote" 
                    className="pl-10"
                    value={formState.location}
                    onChange={handleInputChange}
                  />
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Searching..." : "Search Jobs"}
                </Button>
              </div>
            </form>
          </div>
          
          {/* Results section */}
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {pagination.total} Job{pagination.total !== 1 ? 's' : ''} Found
            </h2>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-2">Sort by:</span>
              <Select defaultValue="newest">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="relevant">Most relevant</SelectItem>
                  <SelectItem value="salary">Salary (high to low)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white p-12 rounded-lg shadow-sm text-center">
              <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No jobs found</h3>
              <p className="mt-2 text-gray-600">
                Try adjusting your search criteria to find more results.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {jobs.map((job) => (
                <JobCard 
                  key={job.job_id} 
                  job={job} 
                  onApply={handleApply} 
                  showApplyButton={isLoggedIn && userType === 'user'}
                />
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  Previous
                </Button>
                
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === pagination.page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                >
                  Next
                </Button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default JobsPage;
