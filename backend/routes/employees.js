const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getAllActiveEmployees,
} = require('../controllers/employeeController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken); // All employee routes are protected

router.get('/', getEmployees);
router.get('/active', getAllActiveEmployees);
router.get('/:id', getEmployeeById);
router.post('/', createEmployee);
router.put('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);

module.exports = router;
