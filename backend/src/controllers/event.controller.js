const { EventService } = require('../services/event.service');

exports.create = async (req, res) => {
  try {
    const created = await EventService.createEvent(req.body, req.user);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ success: false, message: error.message || 'Server error' });
  }
};

exports.list = async (req, res) => {
  try {
    const events = await EventService.listEvents();
    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.get = async (req, res) => {
  try {
    const event = await EventService.getEventById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const updated = await EventService.updateEvent(req.params.id, req.body, req.user);
    res.json({ success: true, data: updated });
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ success: false, message: error.message || 'Server error' });
  }
};

exports.remove = async (req, res) => {
  try {
    await EventService.deleteEvent(req.params.id);
    res.json({ success: true, message: 'Event deleted' });
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ success: false, message: error.message || 'Server error' });
  }
};
