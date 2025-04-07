
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { executeQuery } from '../../lib/db';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // In production, use environment variable

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find admin by email
    const admins = await executeQuery(
      'SELECT admin_id, name, email, password, role FROM Admin WHERE email = ?',
      [email]
    );
    
    const admin = Array.isArray(admins) && admins.length > 0 ? admins[0] : null;
    
    if (!admin) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    
    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, admin.password);
    
    if (!passwordMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { adminId: admin.admin_id, email: admin.email, role: admin.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Remove password from response
    const { password: _, ...adminWithoutPassword } = admin;
    
    res.status(200).json({
      message: 'Login successful',
      token,
      admin: adminWithoutPassword
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Post a new job
router.post('/jobs', async (req, res) => {
  try {
    const adminId = req.adminId; // Set by auth middleware
    const { title, description, skills_required, company_name, location, salary_range, closing_date } = req.body;
    
    if (!adminId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Insert new job
    await executeQuery(
      `INSERT INTO Job (job_id, title, description, skills_required, company_name, location, 
        salary_range, posted_date, closing_date, posted_by_admin_id) 
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, NOW(), ?, ?)`,
      [title, description, skills_required, company_name, location, salary_range, closing_date, adminId]
    );
    
    res.status(201).json({ message: 'Job posted successfully' });
  } catch (error) {
    console.error('Job posting error:', error);
    res.status(500).json({ message: 'Server error posting job' });
  }
});

// Get all jobs posted by the admin
router.get('/jobs', async (req, res) => {
  try {
    const adminId = req.adminId; // Set by auth middleware
    
    if (!adminId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const jobs = await executeQuery(
      `SELECT job_id, title, description, skills_required, company_name, location, 
        salary_range, posted_date, closing_date, 
        (SELECT COUNT(*) FROM Application WHERE job_id = Job.job_id) as application_count 
       FROM Job 
       WHERE posted_by_admin_id = ? 
       ORDER BY posted_date DESC`,
      [adminId]
    );
    
    res.status(200).json({ jobs });
  } catch (error) {
    console.error('Jobs fetch error:', error);
    res.status(500).json({ message: 'Server error fetching jobs' });
  }
});

// Update a job
router.put('/jobs/:jobId', async (req, res) => {
  try {
    const adminId = req.adminId; // Set by auth middleware
    const { jobId } = req.params;
    const { title, description, skills_required, company_name, location, salary_range, closing_date } = req.body;
    
    if (!adminId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Verify admin owns this job
    const jobs = await executeQuery(
      'SELECT job_id FROM Job WHERE job_id = ? AND posted_by_admin_id = ?',
      [jobId, adminId]
    );
    
    if (!Array.isArray(jobs) || jobs.length === 0) {
      return res.status(404).json({ message: 'Job not found or you do not have permission to edit it' });
    }
    
    // Update job
    await executeQuery(
      `UPDATE Job SET title = ?, description = ?, skills_required = ?, company_name = ?, 
        location = ?, salary_range = ?, closing_date = ? 
       WHERE job_id = ?`,
      [title, description, skills_required, company_name, location, salary_range, closing_date, jobId]
    );
    
    res.status(200).json({ message: 'Job updated successfully' });
  } catch (error) {
    console.error('Job update error:', error);
    res.status(500).json({ message: 'Server error updating job' });
  }
});

// Delete a job
router.delete('/jobs/:jobId', async (req, res) => {
  try {
    const adminId = req.adminId; // Set by auth middleware
    const { jobId } = req.params;
    
    if (!adminId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Verify admin owns this job
    const jobs = await executeQuery(
      'SELECT job_id FROM Job WHERE job_id = ? AND posted_by_admin_id = ?',
      [jobId, adminId]
    );
    
    if (!Array.isArray(jobs) || jobs.length === 0) {
      return res.status(404).json({ message: 'Job not found or you do not have permission to delete it' });
    }
    
    // Delete related applications
    await executeQuery('DELETE FROM Application WHERE job_id = ?', [jobId]);
    
    // Delete related recommendations
    await executeQuery('DELETE FROM Recommendation WHERE job_id = ?', [jobId]);
    
    // Delete related feedback
    await executeQuery('DELETE FROM Feedback WHERE job_id = ?', [jobId]);
    
    // Delete job
    await executeQuery('DELETE FROM Job WHERE job_id = ?', [jobId]);
    
    res.status(200).json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Job deletion error:', error);
    res.status(500).json({ message: 'Server error deleting job' });
  }
});

// Get applications for a specific job
router.get('/jobs/:jobId/applications', async (req, res) => {
  try {
    const adminId = req.adminId; // Set by auth middleware
    const { jobId } = req.params;
    
    if (!adminId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Verify admin owns this job
    const jobs = await executeQuery(
      'SELECT job_id FROM Job WHERE job_id = ? AND posted_by_admin_id = ?',
      [jobId, adminId]
    );
    
    if (!Array.isArray(jobs) || jobs.length === 0) {
      return res.status(404).json({ message: 'Job not found or you do not have permission to view applications' });
    }
    
    // Get applications
    const applications = await executeQuery(
      `SELECT a.application_id, a.status, a.applied_date, u.user_id, u.name, u.email, u.location, u.experience, u.skills, u.resume_link
       FROM Application a
       JOIN User u ON a.user_id = u.user_id
       WHERE a.job_id = ?
       ORDER BY a.applied_date DESC`,
      [jobId]
    );
    
    res.status(200).json({ applications });
  } catch (error) {
    console.error('Applications fetch error:', error);
    res.status(500).json({ message: 'Server error fetching applications' });
  }
});

// Update application status
router.put('/applications/:applicationId', async (req, res) => {
  try {
    const adminId = req.adminId; // Set by auth middleware
    const { applicationId } = req.params;
    const { status } = req.body;
    
    if (!adminId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Verify admin owns the job for this application
    const applications = await executeQuery(
      `SELECT a.application_id, j.job_id 
       FROM Application a
       JOIN Job j ON a.job_id = j.job_id
       WHERE a.application_id = ? AND j.posted_by_admin_id = ?`,
      [applicationId, adminId]
    );
    
    if (!Array.isArray(applications) || applications.length === 0) {
      return res.status(404).json({ message: 'Application not found or you do not have permission to update it' });
    }
    
    // Update application status
    await executeQuery(
      'UPDATE Application SET status = ?, reviewed_by_admin_id = ? WHERE application_id = ?',
      [status, adminId, applicationId]
    );
    
    res.status(200).json({ message: 'Application status updated successfully' });
  } catch (error) {
    console.error('Application update error:', error);
    res.status(500).json({ message: 'Server error updating application' });
  }
});

export default router;
