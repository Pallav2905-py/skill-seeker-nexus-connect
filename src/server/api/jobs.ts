
import express from 'express';
import { executeQuery } from '../../lib/db';

const router = express.Router();

// Get all jobs (public endpoint)
router.get('/', async (req, res) => {
  try {
    const { search, location, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    let query = `
      SELECT job_id, title, description, skills_required, company_name, location, 
        salary_range, posted_date, closing_date 
      FROM Job 
      WHERE (closing_date IS NULL OR closing_date > NOW())
    `;
    const queryParams = [];
    
    // Add search filter
    if (search) {
      query += ` AND (title LIKE ? OR description LIKE ? OR skills_required LIKE ?)`;
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }
    
    // Add location filter
    if (location) {
      query += ` AND location LIKE ?`;
      queryParams.push(`%${location}%`);
    }
    
    // Add ordering and pagination
    query += ` ORDER BY posted_date DESC LIMIT ? OFFSET ?`;
    queryParams.push(Number(limit), offset);
    
    const jobs = await executeQuery(query, queryParams);
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM Job 
      WHERE (closing_date IS NULL OR closing_date > NOW())
    `;
    
    if (search) {
      countQuery += ` AND (title LIKE ? OR description LIKE ? OR skills_required LIKE ?)`;
    }
    
    if (location) {
      countQuery += ` AND location LIKE ?`;
    }
    
    const countResult = await executeQuery(countQuery, queryParams.slice(0, -2));
    const total = countResult[0].total;
    
    res.status(200).json({ 
      jobs, 
      pagination: {
        total,
        pages: Math.ceil(total / Number(limit)),
        page: Number(page),
        limit: Number(limit)
      }
    });
  } catch (error) {
    console.error('Jobs fetch error:', error);
    res.status(500).json({ message: 'Server error fetching jobs' });
  }
});

// Get a specific job by ID (public endpoint)
router.get('/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const jobs = await executeQuery(
      `SELECT j.job_id, j.title, j.description, j.skills_required, j.company_name, j.location, 
        j.salary_range, j.posted_date, j.closing_date, a.name as posted_by
       FROM Job j
       JOIN Admin a ON j.posted_by_admin_id = a.admin_id
       WHERE j.job_id = ?`,
      [jobId]
    );
    
    if (!Array.isArray(jobs) || jobs.length === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    res.status(200).json({ job: jobs[0] });
  } catch (error) {
    console.error('Job fetch error:', error);
    res.status(500).json({ message: 'Server error fetching job' });
  }
});

export default router;
