
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface UserProfileFormProps {
  userData: {
    user_id: string;
    name: string;
    email: string;
    location?: string;
    experience?: string;
    skills?: string;
    resume_link?: string;
  };
  onSave: (updatedData: any) => Promise<void>;
}

const UserProfileForm = ({ userData, onSave }: UserProfileFormProps) => {
  const [formData, setFormData] = useState({
    name: userData.name || '',
    location: userData.location || '',
    experience: userData.experience || '',
    skills: userData.skills || '',
    resume_link: userData.resume_link || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onSave(formData);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was a problem updating your profile.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Your Profile</CardTitle>
        <CardDescription>
          Update your profile information to help us match you with the best opportunities
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={userData.email}
              disabled
              className="bg-gray-100"
            />
            <p className="text-sm text-gray-500">Email cannot be changed</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              placeholder="e.g., New York, NY"
              value={formData.location}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="experience">Work Experience</Label>
            <Textarea
              id="experience"
              name="experience"
              placeholder="Briefly describe your work experience"
              value={formData.experience}
              onChange={handleChange}
              className="min-h-[100px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="skills">Skills</Label>
            <Textarea
              id="skills"
              name="skills"
              placeholder="e.g., JavaScript, React, Node.js, Project Management"
              value={formData.skills}
              onChange={handleChange}
              className="min-h-[100px]"
            />
            <p className="text-sm text-gray-500">Separate skills with commas</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="resume_link">Resume Link</Label>
            <Input
              id="resume_link"
              name="resume_link"
              placeholder="URL to your resume (Google Drive, Dropbox, etc.)"
              value={formData.resume_link}
              onChange={handleChange}
              type="url"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Saving..." : "Save Profile"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default UserProfileForm;
