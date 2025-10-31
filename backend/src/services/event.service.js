const Event = require('../models/event.model');

function isValidObjectIdString(id) {
  return typeof id === 'string' && id.length === 24;
}

function sanitizeCoordinatorIds(coordinators) {
  if (!Array.isArray(coordinators)) return undefined;
  return coordinators.filter(coordinatorId => coordinatorId && coordinatorId !== 'admin-env' && isValidObjectIdString(coordinatorId.toString()));
}

class EventService {
  static async createEvent(requestBody, currentUser) {
    const payload = { ...requestBody };

    const data = { ...payload };

    if (currentUser?.id && currentUser.id !== 'admin-env' && isValidObjectIdString(currentUser.id)) {
      data.createdBy = currentUser.id;
    } else if (payload.createdBy && isValidObjectIdString(payload.createdBy)) {
      data.createdBy = payload.createdBy;
    }

    const sanitizedCoordinators = sanitizeCoordinatorIds(data.coordinators);
    if (sanitizedCoordinators) data.coordinators = sanitizedCoordinators;

    const created = await Event.create(data);
    return created;
  }

  static async listEvents() {
    const events = await Event.find().populate('venueId').lean();
    return events.map(event => ({
      ...event,
      id: event._id.toString(),
      venue: event.venueId
        ? {
            id: event.venueId._id?.toString() || event.venueId,
            name: event.venueId.name,
            location: event.venueId.location,
            capacity: event.venueId.capacity,
            address: event.venueId.address,
            mapLink: event.venueId.mapLink,
          }
        : null,
      venueId: event.venueId?._id?.toString() || event.venueId,
    }));
  }

  static async getEventById(eventId) {
    return await Event.findById(eventId).populate('venueId');
  }

  static async updateEvent(eventId, updateBody, currentUser) {
    const event = await Event.findById(eventId);
    if (!event) {
      const error = new Error('Event not found');
      error.statusCode = 404;
      throw error;
    }

    if (currentUser?.role === 'coordinator') {
      const isAssigned = event.coordinators.some(coordId => coordId.toString() === currentUser.id.toString());
      if (!isAssigned && event.createdBy && event.createdBy.toString() !== currentUser.id.toString()) {
        const error = new Error('You do not have permission to update this event. Only assigned coordinators can update events.');
        error.statusCode = 403;
        throw error;
      }
    }

    const update = { ...updateBody };
    if (currentUser?.id && currentUser.id !== 'admin-env' && isValidObjectIdString(currentUser.id)) {
      update.updatedBy = currentUser.id;
    }

    const updated = await Event.findByIdAndUpdate(eventId, update, { new: true });
    return updated;
  }

  static async deleteEvent(eventId) {
    const deleted = await Event.findByIdAndDelete(eventId);
    if (!deleted) {
      const error = new Error('Event not found');
      error.statusCode = 404;
      throw error;
    }
    return true;
  }
}

module.exports = { EventService };



