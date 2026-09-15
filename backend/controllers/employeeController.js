const pool = require('../config/db');

// GET /api/employees?search=&department=&page=&limit=
const getEmployees = async (req, res) => {
  try {
    const { search = '', department = '', status = '', page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (search) {
      whereClause += ' AND (full_name LIKE ? OR email LIKE ? OR designation LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (department) {
      whereClause += ' AND department = ?';
      params.push(department);
    }
    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    const [employees] = await pool.query(
      `SELECT * FROM employees ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM employees ${whereClause}`,
      params
    );

    const total = countResult[0].total;

    // Get distinct departments for filter
    const [departments] = await pool.query('SELECT DISTINCT department FROM employees ORDER BY department');

    return res.status(200).json({
      success: true,
      employees,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
      departments: departments.map((d) => d.department),
    });
  } catch (error) {
    console.error('GetEmployees error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/employees/:id
const getEmployeeById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM employees WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }
    return res.status(200).json({ success: true, employee: rows[0] });
  } catch (error) {
    console.error('GetEmployeeById error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// POST /api/employees
const createEmployee = async (req, res) => {
  try {
    const { full_name, email, department, designation, status = 'Active' } = req.body;

    if (!full_name || !email || !department || !designation) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // Check for duplicate email
    const [existing] = await pool.query('SELECT id FROM employees WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'An employee with this email already exists.' });
    }

    const [result] = await pool.query(
      'INSERT INTO employees (full_name, email, department, designation, status) VALUES (?, ?, ?, ?, ?)',
      [full_name, email, department, designation, status]
    );

    const [newEmployee] = await pool.query('SELECT * FROM employees WHERE id = ?', [result.insertId]);

    return res.status(201).json({
      success: true,
      message: 'Employee added successfully!',
      employee: newEmployee[0],
    });
  } catch (error) {
    console.error('CreateEmployee error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// PUT /api/employees/:id
const updateEmployee = async (req, res) => {
  try {
    const { full_name, email, department, designation, status } = req.body;
    const { id } = req.params;

    const [existing] = await pool.query('SELECT id FROM employees WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    // Check email uniqueness (exclude self)
    const [emailCheck] = await pool.query('SELECT id FROM employees WHERE email = ? AND id != ?', [email, id]);
    if (emailCheck.length > 0) {
      return res.status(409).json({ success: false, message: 'Another employee with this email already exists.' });
    }

    await pool.query(
      'UPDATE employees SET full_name = ?, email = ?, department = ?, designation = ?, status = ? WHERE id = ?',
      [full_name, email, department, designation, status, id]
    );

    const [updated] = await pool.query('SELECT * FROM employees WHERE id = ?', [id]);
    return res.status(200).json({ success: true, message: 'Employee updated successfully!', employee: updated[0] });
  } catch (error) {
    console.error('UpdateEmployee error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// DELETE /api/employees/:id
const deleteEmployee = async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT id FROM employees WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    await pool.query('DELETE FROM employees WHERE id = ?', [req.params.id]);
    return res.status(200).json({ success: true, message: 'Employee deleted successfully!' });
  } catch (error) {
    console.error('DeleteEmployee error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/employees/all-active (for recipient selection)
const getAllActiveEmployees = async (req, res) => {
  try {
    const [employees] = await pool.query(
      "SELECT id, full_name, email, department, designation FROM employees WHERE status = 'Active' ORDER BY department, full_name"
    );
    return res.status(200).json({ success: true, employees });
  } catch (error) {
    console.error('GetAllActiveEmployees error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee, getAllActiveEmployees };
