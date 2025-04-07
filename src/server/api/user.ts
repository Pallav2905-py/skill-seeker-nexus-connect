
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { executeQuery } from '../../lib/db';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // In production, use environment variable

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await executeQuery(
      'SELECT email FROM User WHERE email = ?',
      [email]
    );
    
    if (Array.isArray(existingUser) && existingUser.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert new user
    const result = await executeQuery(
      'INSERT INTO User (user_id, name, email, password, created_at, updated_at) VALUES (UUID(), ?, ?, ?, NOW(), NOW())',
      [name, email, hashedPassword]
    );
    
    // Get the created user
    const userData = await executeQuery(
      'SELECT user_id, name, email, created_at FROM User WHERE email = ?',
      [email]
    );
    
    res.status(201).json({ 
      message: 'User registered successfully', 
      user: Array.isArray(userData) && userData.length > 0 ? userData[0] : null 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const users = await executeQuery(
      'SELECT user_id, name, email, password, location, experience, skills FROM User WHERE email = ?',
      [email]
    );
    
    const user = Array.isArray(users) && users.length > 0 ? users[0] : null;
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    
    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { userId: user.user_id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(200).json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.userId; // Set by auth middleware
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const users = await executeQuery(
      'SELECT user_id, name, email, location, experience, skills, resume_link, created_at FROM User WHERE user_id = ?',
      [userId]
    );
    
    const user = Array.isArray(users) && users.length > 0 ? users[0] : null;
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ user });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const userId = req.userId; // Set by auth middleware
    const { name, location, experience, skills } = req.body;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    await executeQuery(
      'UPDATE User SET name = ?, location = ?, experience = ?, skills = ?, updated_at = NOW() WHERE user_id = ?',
      [name, location, experience, skills, userId]
    );
    
    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// Apply for a job
router.post('/apply/:jobId', async (req, res) => {
  try {
    const userId = req.userId; // Set by auth middleware
    const { jobId } = req.params;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Check if already applied
    const existingApplications = await executeQuery(
      'SELECT application_id FROM Application WHERE user_id = ? AND job_id = ?',
      [userId, jobId]
    );
    
    if (Array.isArray(existingApplications) && existingApplications.length > 0) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }
    
    // Create application
    await executeQuery(
      'INSERT INTO Application (application_id, user_id, job_id, status, applied_date) VALUES (UUID(), ?, ?, "pending", NOW())',
      [userId, jobId]
    );
    
    res.status(201).json({ message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Job application error:', error);
    res.status(500).json({ message: 'Server error submitting application' });
  }
});

// Get user's applications
router.get('/applications', async (req, res) => {
  try {
    const userId = req.userId; // Set by auth middleware
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const applications = await executeQuery(
      `SELECT a.application_id, a.status, a.applied_date, j.job_id, j.title, j.company_name 
       FROM Application a 
       JOIN Job j ON a.job_id = j.job_id 
       WHERE a.user_id = ? 
       ORDER BY a.applied_date DESC`,
      [userId]
    );
    
    res.status(200).json({ applications });
  } catch (error) {
    console.error('Applications fetch error:', error);
    res.status(500).json({ message: 'Server error fetching applications' });
  }
});

// Get job recommendations for user
router.get('/recommendations', async (req, res) => {
  try {
    const userId = req.userId; // Set by auth middleware
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Get user skills and experience
    const users = await executeQuery(
      'SELECT skills, experience FROM User WHERE user_id = ?',
      [userId]
    );
    
    const user = Array.isArray(users) && users.length > 0 ? users[0] : null;
    
    if (!user || !user.skills) {
      return res.status(200).json({ 
        recommendations: [],
        message: 'Please update your skills to get job recommendations'
      });
    }
    
    // Get all jobs
    const jobs = await executeQuery(
      'SELECT job_id, title, description, skills_required, company_name, location FROM Job WHERE closing_date IS NULL OR closing_date > NOW()'
    );
    
    if (!Array.isArray(jobs) || jobs.length === 0) {
      return res.status(200).json({ recommendations: [] });
    }
    
    // This would be replaced with the actual AI-based recommendation logic
    // For now, we'll use a simple keyword matching
    const userSkills = user.skills.toLowerCase().split(',').map(s => s.trim());
    const recommendations = jobs.map(job => {
      const jobSkills = job.skills_required.toLowerCase().split(',').map(s => s.trim());
      let matchCount = 0;
      
      userSkills.forEach(skill => {
        if (jobSkills.some(jobSkill => jobSkill.includes(skill) || skill.includes(jobSkill))) {
          matchCount++;
        }
      });
      
      const score = matchCount / Math.max(userSkills.length, jobSkills.length);
      return {
        job,
        score,
        reason: `You have ${matchCount} matching skills for this position`
      };
    });
    
    // Sort by score descending and limit to top 5
    const topRecommendations = recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .filter(rec => rec.score > 0);
    
    res.status(200).json({ recommendations: topRecommendations });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ message: 'Server error getting recommendations' });
  }
});

export default router;
