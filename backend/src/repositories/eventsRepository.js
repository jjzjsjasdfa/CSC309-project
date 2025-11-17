const prisma = require("../../prisma/prismaClient");

const eventsRepository = {
  async createEvent(name, description, location, startTime, endTime, pointsRemain, capacity) {

    const data = { name, description, location, startTime, endTime, pointsRemain,  published: false};
    if (capacity !== undefined && capacity !== null){
        data.capacity = capacity;
    }
    return prisma.event.create({data,
      include: {
        organizers: true,
        guests: true,
        _count: {select: {guests: true}}
      } });
  },

  async findManyWithSkipAndLimit(where, skip, limit){
    return prisma.event.findMany({
      where: where,
      include: {_count:{select:{guests: true}}},
      orderBy: {startTime: "asc"},
      skip: skip,
      take: limit,
    });
  },

  async findMany(where){
    return prisma.event.findMany({
      where: where,
      include: {_count: {select: {guests: true}}},
      orderBy: {startTime: "asc"}
    });
  },

  async count(where) {
    return prisma.event.count({ where });
  },

  async findManyWithCounts(where) {
    return prisma.event.findMany({
      where,
      orderBy: {id: 'asc'},
      include: { _count: {select: {guests: true}}}
    });
  },

  async addIntoOrganizers(uid,eid){
    return prisma.event.update({
      where: { id: eid },
      data: {
        organizers: {
        connect: { id: uid }, 
      },
    },
    });
  },

  async addIntoGuests(uid,eid){
    return prisma.event.update({
      where: { id: eid },
      data: {
        guests: {
        connect: { id: uid }, 
      },
    },
    });
  },

  async findById(id){
    return prisma.event.findUnique({
      where: {id},
      include: {
        organizers: true,
        guests: true,
      _count: {select: {guests: true}}
      }
    })
  },

  async deleteById(id) {
    return prisma.event.delete({where: {id}});
  },

  async deleteOrganizer(uid,eid){
    return prisma.event.update({
      where: {id: eid},
      data: {
        organizers: {
        disconnect: { id: uid }, 
      },
    },
    });
  },

  async checkIfOrganizer(uid,eid){
    let event = await prisma.event.findFirst({
    where: {
      id: eid,
      organizers: {
        some: {
          id: uid
        }
      }
    }
    });
    return event !== null;
  },
  
  async delete(id) {
    return prisma.event.delete({where: {id}});
  },

  async updateEvent(id, patch) {
    return prisma.event.update({
      where: {id},
      data: patch,
      include: {
        _count: {select: {guests: true}},
        organizers: true,
        guests: true
      }
    });
   },

  async deleteGuest(uid, eid) {
    return prisma.event.update({
      where: {id: eid},
      data: {guests: {disconnect: {id: uid}}},
    });
  }
};

module.exports = eventsRepository;
