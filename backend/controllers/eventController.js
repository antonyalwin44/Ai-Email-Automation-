const pool = require('../config/db');

// GET /api/events
const getEvents = async (req, res) => {
  try {
    const { upcoming } = req.query;
    let query = 'SELECT e.*, a.name as created_by_name FROM events e LEFT JOIN admins a ON e.created_by = a.id';
    const params = [];

    if (upcoming === 'true') {
      query += ' WHERE e.event_date >= CURDATE()';
    }

    query += ' ORDER BY e.event_date ASC';

    const [events] = await pool.query(query, params);
    return res.status(200).json({ success: true, events });
  } catch (error) {
    console.error('GetEvents error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/events/:id
const getEventById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT e.*, a.name as created_by_name FROM events e LEFT JOIN admins a ON e.created_by = a.id WHERE e.id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }
    return res.status(200).json({ success: true, event: rows[0] });
  } catch (error) {
    console.error('GetEventById error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// POST /api/events
const createEvent = async (req, res) => {
  try {
    const { event_name, event_type, event_date, event_time, venue, description } = req.body;

    if (!event_name || !event_type || !event_date || !event_time || !venue) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided.' });
    }

    const [result] = await pool.query(
      'INSERT INTO events (event_name, event_type, event_date, event_time, venue, description, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [event_name, event_type, event_date, event_time, venue, description || null, req.admin.id]
    );

    const [newEvent] = await pool.query('SELECT * FROM events WHERE id = ?', [result.insertId]);
    return res.status(201).json({ success: true, message: 'Event created successfully!', event: newEvent[0] });
  } catch (error) {
    console.error('CreateEvent error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// PUT /api/events/:id
const updateEvent = async (req, res) => {
  try {
    const { event_name, event_type, event_date, event_time, venue, description } = req.body;
    const { id } = req.params;

    const [existing] = await pool.query('SELECT id FROM events WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    await pool.query(
      'UPDATE events SET event_name = ?, event_type = ?, event_date = ?, event_time = ?, venue = ?, description = ? WHERE id = ?',
      [event_name, event_type, event_date, event_time, venue, description || null, id]
    );

    const [updated] = await pool.query('SELECT * FROM events WHERE id = ?', [id]);
    return res.status(200).json({ success: true, message: 'Event updated successfully!', event: updated[0] });
  } catch (error) {
    console.error('UpdateEvent error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// DELETE /api/events/:id
const deleteEvent = async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT id FROM events WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    await pool.query('DELETE FROM events WHERE id = ?', [req.params.id]);
    return res.status(200).json({ success: true, message: 'Event deleted successfully!' });
  } catch (error) {
    console.error('DeleteEvent error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getEvents, getEventById, createEvent, updateEvent, deleteEvent };
