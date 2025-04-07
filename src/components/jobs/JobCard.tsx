
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from 'date-fns';
import { MapPin, Briefcase, Calendar, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

interface JobCardProps {
  job: {
    job_id: string;
    title: string;
    company_name: string;
    location: string;
    skills_required: string;
    salary_range?: string;
    posted_date: string;
    description: string;
  };
  onApply?: (jobId: string) => void;
  showApplyButton?: boolean;
  showFullDescription?: boolean;
  recommendationScore?: number;
}

const JobCard = ({ 
  job, 
  onApply, 
  showApplyButton = true, 
  showFullDescription = false,
  recommendationScore
}: JobCardProps) => {
  const handleApply = () => {
    if (onApply) {
      onApply(job.job_id);
    }
  };

  const skills = job.skills_required.split(',').map(skill => skill.trim());
  const postedDate = new Date(job.posted_date);
  const timeAgo = formatDistanceToNow(postedDate, { addSuffix: true });
  
  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold">{job.title}</CardTitle>
            <p className="text-gray-600 flex items-center gap-1 mt-1">
              <Briefcase className="h-4 w-4" /> {job.company_name}
            </p>
          </div>
          {recommendationScore !== undefined && (
            <Badge variant={recommendationScore > 0.7 ? "default" : "secondary"} className="ml-2">
              {Math.round(recommendationScore * 100)}% Match
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2 md:gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" /> {job.location}
          </span>
          {job.salary_range && (
            <span className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" /> {job.salary_range}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" /> {timeAgo}
          </span>
        </div>
        
        <div>
          {showFullDescription ? (
            <p className="text-gray-700">{job.description}</p>
          ) : (
            <p className="text-gray-700 line-clamp-2">{job.description}</p>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 pt-2">
          {skills.slice(0, 5).map((skill, index) => (
            <Badge key={index} variant="outline">{skill}</Badge>
          ))}
          {skills.length > 5 && <Badge variant="outline">+{skills.length - 5} more</Badge>}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Link to={`/jobs/${job.job_id}`}>
          <Button variant="outline">View Details</Button>
        </Link>
        {showApplyButton && (
          <Button onClick={handleApply}>Apply Now</Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default JobCard;
