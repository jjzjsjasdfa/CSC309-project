const eventsRepository = require("../repositories/eventsRepository");

const eventsService = {
  async registerEvent(name, description, location, startTime, endTime, points, capacity) {

    return await eventsRepository.createEvent(name, description, location, startTime, endTime, points, capacity);
  },

  async getEventsWithSkipAndLimit(where, skip, limit){
    return await eventsRepository.findManyWithSkipAndLimit(where, skip, limit);
  },

  async getEvents(where){
    return await eventsRepository.findMany(where);
  },

  async countEvents(where) {
    return eventsRepository.count(where);
  },

  async getEventsWithCounts(where) {
    return eventsRepository.findManyWithCounts(where);
  },

  async addOrganizer(uid, eid){
    return await eventsRepository.addIntoOrganizers(uid, eid);
  },

  async getEventById(eid){
    return await eventsRepository.findById(eid);

  },
  async deleteOrganizer(uid,eid) {
    return await eventsRepository.deleteOrganizer(uid,eid);
  },

  async checkOrganizer(uid,eid){
    return await eventsRepository.checkIfOrganizer(uid,eid);
  },

  async deleteEventById(id){
    return await eventsRepository.delete(id);
  },

  async updateEvent(id, patch) {
    return eventsRepository.updateEvent(id, patch);
  },

  async addGuest(userId, eventId) {
    return eventsRepository.addIntoGuests(userId, eventId);
  },

  async deleteGuest(userId, eventId) {
    return eventsRepository.deleteGuest(userId, eventId);
  }
}
module.exports = eventsService;