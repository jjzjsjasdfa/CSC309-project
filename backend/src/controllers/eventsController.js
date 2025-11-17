const eventsService = require("../services/eventsService.js");
const userService = require("../services/userService.js");
const transactionService = require("../services/transactionService");

const eventController = {
  async register(req, res) {
    try {
      const { name: n, description: d, location: l, startTime: sT, endTime: eT, points: p, capacity: c} = req.body;

      const s = new Date(sT);
      const e = new Date(eT);

      if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) {
        return res.status(400).json({ error: "Invalid startTime/endTime" });
      }
      if (e.getTime() <= s.getTime()) {
        return res.status(400).json({ error: "endTime must be after startTime" });
      }

      const newEvent = await eventsService.registerEvent(n,d,l,sT,eT,p,c);
      const out = {
        id: newEvent.id,
        name: newEvent.name,
        description: newEvent.description,
        location: newEvent.location,
        startTime: newEvent.startTime,
        endTime: newEvent.endTime,
        capacity: newEvent.capacity ?? null,
        pointsRemain: newEvent.pointsRemain,
        pointsAwarded: newEvent.pointsAwarded,
        published: newEvent.published,
        organizers: newEvent.organizers,
        guests: newEvent.guests
      };
      return res.status(201).json(out);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  async getEvents(req, res){
    try {
      const present = new Date();
      const page  = Number.isInteger(+req.query.page)  && +req.query.page  > 0 ? +req.query.page  : 1;
      const limit = Number.isInteger(+req.query.limit) && +req.query.limit > 0 ? +req.query.limit : 10;

      function parseBool(v) {
        if (v === undefined) return undefined;
        if (v === true || v === 'true') return true;
        if (v === false || v === 'false') return false;
        throw new Error('invalid boolean');
      }

      const where = {};
      if (req.query.name) {
        where.name = { contains: req.query.name, mode: "insensitive" };
      }
      if (req.query.location) {
        where.location = { contains: req.query.location, mode: "insensitive" };
      }

      if (req.query.started !== undefined && req.query.ended !== undefined) {
        return res.status(400).json({ error: 'cannot specify both started and ended' });
      }
      const started = parseBool(req.query.started);
      const ended   = parseBool(req.query.ended);
      if (started === true)  where.startTime = { lte: present };
      if (started === false) where.startTime = { gt:  present };
      if (ended   === true)  where.endTime   = { lte: present };
      if (ended   === false) where.endTime   = { gt:  present };

      const role = req.user?.role;
      if (role === 'regular' || role === 'cashier') {
        where.published = true;
      } else {
        const published = parseBool(req.query.published);
        if (published !== undefined) where.published = published;
      }

      let events = await eventsService.getEventsWithCounts(where);

      const showFull = parseBool(req.query.showFull) ?? false;
      if (!showFull) {
        events = events.filter(ev =>
          ev.capacity == null || (ev._count?.guests ?? 0) < ev.capacity
        );
      }

      const count = events.length;
      const start = (page - 1) * limit;
      const pageItems = events.slice(start, start + limit);

      const isRegularView = (role === 'regular' || role === 'cashier');
      const results = pageItems.map(ev => {
        const base = {
          id: ev.id,
          name: ev.name,
          location: ev.location,
          startTime: ev.startTime,
          endTime: ev.endTime,
          capacity: ev.capacity ?? null,
          numGuests: ev._count?.guests ?? 0,
        };
        if (!isRegularView) {
          base.pointsRemain  = ev.pointsRemain;
          base.pointsAwarded = ev.pointsAwarded;
          base.published     = ev.published;
        }
        return base;
      });

      return res.status(200).json({ count, results });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  async organizeEvent(req, res){
    try {
      let eid = parseInt(req.params.eventId, 10);

      if (isNaN(eid)) {
        return res.status(404).json({ message: "no such event" });
      }
      let { utorid } = req.body;

      let user = await userService.getUserByUtorid(utorid);
      if(user === null){
        return res.status(404).json({ message: "no such user of Utorid" });
      }

      let event = await eventsService.getEventById(eid);
      if(event === null){
        return res.status(404).json({ message: "no such event" });
      }

      if(new Date(event.endTime) < new Date()){
        return res.status(410).json({ message: "event has ended" });
      }

      if (event.guests?.some(g => g.id === user.id)) {
        return res.status(400).json({ error: "user is already a guest of this event" });
      }

      for (let guest of event.guests) {
        if (guest.id === user.id) {
          return res.status(400).json({ 
            error: "User is already a guest of this event." 
          });
        }
      }

      await eventsService.addOrganizer(user.id, event.id);
      let updatedEvent = await eventsService.getEventById(eid);
      let { id, name, location, organizers } = updatedEvent;
      return res.status(201).json({ 
        id, name, location, organizers
      });

    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  async kickOrganizer(req, res){
    try {
      let eid = parseInt(req.params.eventId, 10);
      let uid = parseInt(req.params.userId, 10);
      await eventsService.deleteOrganizer(uid, eid);
      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },

  async deleteEvent(req,res){
    try {
      let eid = parseInt(req.params.eventId, 10);
      let event = await eventsService.getEventById(eid);
      if(Boolean(event.published) === true) {
        return res.status(400).json({ message: "event already published" });
      }
      await eventsService.deleteEventById(eid);
      return res.status(204).send();
    }
    catch(error){
      return res.status(400).json({ error: error.message });
    }
  },

  async getEvent(req,res){
    try {
      let eid = parseInt(req.params.eventId, 10);
      let event = await eventsService.getEventById(eid);
      if(event === null){
        return res.status(404).json({ message: "no such event" });
      }
      let isOrganizer = await eventsService.checkOrganizer(req.user.id,eid);
      if (isOrganizer || req.user.role === "manager" || req.user.role === "superuser") {
        const { id, name, description, location, startTime, endTime, capacity, 
          pointsRemain, pointsAwarded, published, organizers, guests
        } = event;
        return res.status(200).json({ id, name, description, location, startTime, endTime, capacity, 
        pointsRemain, pointsAwarded, published, organizers, guests});
      }


      if(Boolean(event.published) === false) {
        return res.status(404).json({ message: "event not found" });
      }
      const { id, name, description, location, startTime, endTime, capacity, organizers,numGuests
      } = event;
      return res.status(200).json({ id, name, description, location, startTime, endTime, capacity, 
        organizers, numGuests
      });
    }
    catch(error){
      return res.status(400).json({ error: error.message });
    }
  },

  async updateEvent(req, res) {
    try {
      const id = Number(req.params.eventId);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(404).json({ message: "no such event" });
      }

      const current = await eventsService.getEventById(id);
      if (!current) return res.status(404).json({ message: "no such event" });

      const isMgr = ["manager", "superuser"].includes(req.user?.role);
      const now = new Date();
      const hasStarted = new Date(current.startTime) <= now;
      const hasEnded = new Date(current.endTime) <= now;

      const {
        name,
        description,
        location,
        startTime,
        endTime,
        capacity,
        published,
        points,
      } = req.body ?? {};

      const wantsToSetPublished = published !== undefined && published !== null;
      const wantsToSetPoints = points !== undefined && points !== null;
      if ((wantsToSetPublished || wantsToSetPoints) && !isMgr) {
        return res
          .status(403)
          .json({ error: "Only manager/superuser can modify published/points" });
      }

      const patch = {};

      if (name !== undefined && name !== null) patch.name = String(name);
      if (description !== undefined && description !== null)
        patch.description = String(description);
      if (location !== undefined && location !== null)
        patch.location = String(location);

      if (startTime !== undefined && startTime !== null) {
        const s = new Date(startTime);
        if (Number.isNaN(s)) return res.status(400).json({ error: "Invalid startTime" });
        patch.startTime = s;
      }

      if (endTime !== undefined && endTime !== null) {
        const e = new Date(endTime);
        if (Number.isNaN(e)) return res.status(400).json({ error: "Invalid endTime" });
        patch.endTime = e;
      }

      if (capacity !== undefined) {
        if (capacity === null) {
          patch.capacity = null;
        } else {
          const c = Number(capacity);
          if (!Number.isInteger(c) || c <= 0) {
            return res
              .status(400)
              .json({ error: "capacity must be a positive integer or null" });
          }
          const numGuests = Array.isArray(current.guests) ? current.guests.length : 0;
          if (c < numGuests) {
            return res
              .status(400)
              .json({ error: "capacity cannot be below current number of guests" });
          }
          patch.capacity = c;
        }
      }

      if (wantsToSetPublished) {
        if (published !== true) {
          return res
            .status(400)
            .json({ error: "published can only be set to true" });
        }
        patch.published = true;
      }

      if (wantsToSetPoints) {
        const total = Number(points);
        if (!Number.isInteger(total) || total <= 0) {
          return res.status(400).json({ error: "points must be a positive integer" });
        }
        const alreadyAwarded = Number(current.pointsAwarded ?? 0);
        const newRemain = total - alreadyAwarded;
        if (newRemain < 0) {
          return res
            .status(400)
            .json({ error: "points reduction would make remaining negative" });
        }
        patch.pointsRemain = newRemain;
      }

      if (patch.startTime !== undefined || patch.endTime !== undefined) {
        const effStart = patch.startTime ?? new Date(current.startTime);
        const effEnd = patch.endTime ?? new Date(current.endTime);
        if (effEnd <= effStart) {
          return res.status(400).json({ error: "endTime must be after startTime" });
        }
        if (
          (patch.startTime && effStart < now) ||
          (patch.endTime && effEnd < now)
        ) {
          return res
            .status(400)
            .json({ error: "startTime/endTime cannot be in the past" });
        }
      }

      const isEditingPreStartField =
        patch.name !== undefined ||
        patch.description !== undefined ||
        patch.location !== undefined ||
        patch.startTime !== undefined ||
        patch.capacity !== undefined;

      if (hasStarted && isEditingPreStartField) {
        return res.status(400).json({
          error:
            "cannot update name/description/location/startTime/capacity after event has started",
        });
      }
      if (hasEnded && patch.endTime !== undefined) {
        return res
          .status(400)
          .json({ error: "cannot update endTime after event has ended" });
      }

      if (Object.keys(patch).length === 0) {
        return res.status(200).json({
          id: current.id,
          name: current.name,
          location: current.location,
        });
      }

      const updated = await eventsService.updateEvent(id, patch);

      const out = {
        id: updated.id,
        name: updated.name,
        location: updated.location,
      };
      if (patch.startTime !== undefined) out.startTime = updated.startTime;
      if (patch.endTime !== undefined) out.endTime = updated.endTime;
      if (patch.capacity !== undefined) out.capacity = updated.capacity ?? null;
      if (patch.pointsRemain !== undefined) out.pointsRemain = updated.pointsRemain;
      if (patch.published !== undefined) out.published = updated.published;

      return res.status(200).json(out);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },

  async registerGuest(req, res) {
    try {
      const eid = Number(req.params.eventId);
      if (!Number.isInteger(eid) || eid <= 0) return res.status(404).json({ message: "no such event" });

      const { utorid } = req.body || {};
      if (!utorid) return res.status(400).json({ error: "utorid is required" });

      const event = await eventsService.getEventById(eid);
      if (!event) return res.status(404).json({ message: "no such event" });

      const role = req.user?.role;
      const isMgr = role === "manager" || role === "superuser";
      const isOrganizerCaller = await eventsService.checkOrganizer(req.user?.id, eid);
      if (!isMgr && isOrganizerCaller && !event.published) {
        return res.status(404).json({ message: "event not found" });
      }

      const now = new Date();
      const numGuestsNow = event._count?.guests ?? (event.guests ? event.guests.length : 0);

      if (new Date(event.endTime) <= now) {
        return res.status(410).json({ message: "Event has ended." });
      }
      if (event.capacity != null && numGuestsNow >= event.capacity) {
        return res.status(410).json({ message: "Event is at full capacity." });
      }

      const user = await userService.getUserByUtorid(utorid);
      if (!user) return res.status(404).json({ message: "no such user of Utorid" });

      if (event.organizers?.some(o => o.id === user.id)) {
        return res.status(400).json({ error: "user is organizer; remove organizer first" });
      }

      if (event.guests?.some(g => g.id === user.id)) {
        return res.status(400).json({ error: "user is already a guest" });
      }

      const latestEvent = await eventsService.getEventById(eid);
      const currentGuests =
        latestEvent._count?.guests ??
        (latestEvent.guests ? latestEvent.guests.length : 0);

      if (latestEvent.capacity != null && currentGuests >= latestEvent.capacity) {
        return res.status(410).json({ message: "Event is at full capacity." });
      }

      if(eid === 4) console.log(`Before add:\nCapacity: ${event.capacity} numGuests: ${event.guests.length}`)
      await eventsService.addGuest(user.id, eid);
      const updated = await eventsService.getEventById(eid);
      const numGuests = updated._count?.guests ?? (updated.guests ? updated.guests.length : numGuestsNow + 1);

      if(eid === 4) console.log(`After add:\nCapacity: ${updated.capacity} numGuests: ${updated.guests.length}`)

      const body = {
        id: updated.id,
        name: updated.name,
        location: updated.location,
        guestAdded: { id: user.id, utorid: user.utorid, name: user.name },
        numGuests
      };

      return res.status(201).json(body);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },

  async kickGuest(req, res) {
    try {
      const eid = Number(req.params.eventId);
      const uid = Number(req.params.userId);
      if (!Number.isInteger(eid) || eid <= 0) return res.status(404).json({ message: "no such event" });

      const event = await eventsService.getEventById(eid);
      if (!event) return res.status(404).json({ message: "no such event" });

      if (!event.guests?.some(g => g.id === uid)) {
        return res.status(404).json({ message: "guest not found" });
      }
      if(eid === 4) console.log(`Before delete:\nCapacity: ${event.capacity} numGuests: ${event.guests.length}`)
      await eventsService.deleteGuest(uid, eid);
      const updated = await eventsService.getEventById(eid);
      if(eid === 4) console.log(`After delete:\nCapacity: ${updated.capacity} numGuests: ${updated.guests.length}`)
      return res.status(204).send();
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },

  async createEventTransaction(req, res){
    const user = await userService.getUserById(req.user.id);
    const { type, utorid, amount } = req.body;
    let { eventId } = req.params;
    if(isNaN(eventId)){
      return res.status(400).json({ message: "eventId must be a number" });
    }

    eventId = parseInt(eventId, 10);
    const event = await eventsService.getEventById(eventId);
    if(!event){
      return res.status(404).json({ message: `event with Id ${eventId} not found` });
    }

    if(type !== "event"){
      return res.status(400).json({ message: "type must be 'event'" });
    }else if(typeof amount !== "number" || amount <= 0){
      return res.status(400).json({ message: "amount must be a positive number" });
    }

    // only awarding one guest
    if(utorid !== undefined){
      // check if utorid is one of the guests
      const guestUtorids = event.guests.map(g => g.utorid);
      if(!guestUtorids.includes(utorid)){
        return res.status(400).json({ message: `user with utorid ${utorid} not a guest of this event` });
      }

      // check if amount exceeds remaining points
      if(amount > event.pointsRemain){
        return res.status(400).json({ message: "amount exceeds remaining points" });
      }

      // create transaction
      let data = {
        type: "event",
        utorid,
        amount,
        relatedId: eventId,
        createdBy: user.utorid,
      };
      const transaction = await transactionService.createEventTransaction(data);

      // update event
      let patch = {};
      patch.pointsRemain = event.pointsRemain - amount;
      patch.pointsAwarded = event.pointsAwarded + amount;
      const updatedEvent = await eventsService.updateEvent(eventId, patch);

      // update guest
      const updatedUser = await userService.updateUserByUtorid(utorid, { points: { increment: amount } });

      res.status(201).json({
        id: transaction.id,
        recipient: utorid,
        awarded: amount,
        type: "event",
        relatedId: eventId,
        createdBy: user.utorid
      });
    }
    // awarding all guests
    else{
      // check if amount exceeds remaining points
      const guests = event.guests;
      const newAmount = amount * guests.length;
      if(newAmount > event.pointsRemain){
        return res.status(400).json({ message: "amount exceeds remaining points to award all guests" });
      }

      let response = [];
      for(const g of guests){
        // create transaction
        let data = {
          type: "event",
          utorid: g.utorid,
          amount,
          relatedId: eventId,
          createdBy: user.utorid,
        };
        const transaction = await transactionService.createEventTransaction(data);

        // update event
        let patch = {};
        patch.pointsRemain = event.pointsRemain - newAmount;
        patch.pointsAwarded = event.pointsAwarded + newAmount;
        const updatedEvent = await eventsService.updateEvent(eventId, patch);

        // update guest
        const updatedUser = await userService.updateUserByUtorid(g.utorid, { points: { increment: amount } });

        response.push({
          id: transaction.id,
          recipient: g.utorid,
          awarded: amount,
          type: "event",
          relatedId: eventId,
          createdBy: user.utorid
        });
      }

      res.status(201).json(response);
    }
  },

  async registerMyselfAsGuest(req, res){
    const user = await userService.getUserById(req.user.id);

    let { eventId } = req.params;
    if(isNaN(eventId)){
      return res.status(400).json({ message: "eventId must be a number" });
    }

    eventId = parseInt(eventId, 10);
    const event = await eventsService.getEventById(eventId);
    if(!event){
      return res.status(404).json({ message: `event with Id ${eventId} not found` });
    }

    const now = new Date();
    const numGuestsNow = event._count?.guests ?? (event.guests ? event.guests.length : 0);
    if (new Date(event.endTime) <= now || (event.capacity != null && numGuestsNow >= event.capacity)) {
      return res.status(410).json({ message: "event is full or has ended" });
    }

    if (event.guests?.some(g => g.id === user.id)) {
      return res.status(400).json({ error: "user is already a guest" });
    }

    if(eventId === 4) console.log(`Before add myself:\nCapacity: ${event.capacity} numGuests: ${event.guests.length}`)
    const updated = await eventsService.addGuest(user.id, eventId);
    if(eventId === 4) console.log(`After add myself:\nCapacity: ${updated.capacity} numGuests: ${updated.guests.length}`)

    res.status(201).json({
      id: event.id,
      name: event.name,
      location: event.location,
      guestAdded: { id: user.id, utorid: user.utorid, name: user.name },
      numGuests: numGuestsNow + 1
    });
  },

  async removeMyselfAsGuest(req, res){
    const user = await userService.getUserById(req.user.id);

    let { eventId } = req.params;
    if(isNaN(eventId)){
      return res.status(400).json({ message: "eventId must be a number" });
    }

    eventId = parseInt(eventId, 10);
    const event = await eventsService.getEventById(eventId);
    if(!event){
      return res.status(404).json({ message: `event with Id ${eventId} not found` });
    }

    if (!event.guests?.some(g => g.id === user.id)) {
      return res.status(404).json({ message: "guest not found" });
    }

    const now = new Date();
    if(new Date(event.endTime) <= now){
      return res.status(410).json({ message: "event has ended" });
    }

    if(eventId === 4) console.log(`Before remove myself:\nCapacity: ${event.capacity} numGuests: ${event.guests.length}`)
    const updated = await eventsService.deleteGuest(user.id, eventId);
    if(eventId === 4) console.log(`After remove myself:\nCapacity: ${updated.capacity} numGuests: ${updated.guests.length}`)
    return res.status(204).send();
  }
}

module.exports = eventController;