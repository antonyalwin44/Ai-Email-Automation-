const pool = require('../config/db');

// GET /api/logs
const getEmailLogs = async (req, res) => {
  try {
    const { status = '', event_id = '', page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (status) {
      whereClause += ' AND el.status = ?';
      params.push(status);
    }
    if (event_id) {
      whereClause += ' AND el.event_id = ?';
      params.push(event_id);
    }

    const [logs] = await pool.query(
      `SELECT 
        el.id, el.email_subject, el.recipient_email, el.sent_time, el.status, el.error_message,
        emp.full_name as employee_name, emp.department,
        ev.event_name, ev.event_type
       FROM email_logs el
       LEFT JOIN employees emp ON el.employee_id = emp.id
       LEFT JOIN events ev ON el.event_id = ev.id
       ${whereClause}
       ORDER BY el.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM email_logs el ${whereClause}`,
      params
    );

    // Summary stats
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Sent' THEN 1 ELSE 0 END) as sent,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'Failed' THEN 1 ELSE 0 END) as failed
      FROM email_logs
    `);

    return res.status(200).json({
      success: true,
      logs,
      stats: stats[0],
      pagination: {
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult[0].total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('GetEmailLogs error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/logs/dashboard-stats
const getDashboardStats = async (req, res) => {
  try {
    const [[empStats]] = await pool.query("SELECT COUNT(*) as total, SUM(status='Active') as active FROM employees");
    const [[eventStats]] = await pool.query("SELECT COUNT(*) as total, SUM(event_date >= CURDATE()) as upcoming FROM events");
    const [[emailStats]] = await pool.query(`
      SELECT 
        SUM(CASE WHEN status = 'Sent' THEN 1 ELSE 0 END) as sent,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'Failed' THEN 1 ELSE 0 END) as failed
      FROM email_logs
    `);

    return res.status(200).json({
      success: true,
      stats: {
        totalEmployees: empStats.total || 0,
        activeEmployees: empStats.active || 0,
        totalEvents: eventStats.total || 0,
        upcomingEvents: eventStats.upcoming || 0,
        emailsSent: emailStats.sent || 0,
        emailsPending: emailStats.pending || 0,
        emailsFailed: emailStats.failed || 0,
      },
    });
  } catch (error) {
    console.error('GetDashboardStats error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getEmailLogs, getDashboardStats };
