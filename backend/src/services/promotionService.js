const promotionRepository = require("../repositories/promotionRepository");

const toDbType  = (t) => (t === "one-time" ? "onetime" : t);
const toApiType = (t) => (t === "onetime" ? "one-time" : t);

const nowUtc = () => new Date();
const isActive = (p) => {
  const now = nowUtc();
  return new Date(p.startTime) <= now && now <= new Date(p.endTime);
};

const err404 = (msg = "Promotion not found") => { const e = new Error(msg); e.code = 404; return e; };
const err403 = (msg = "Forbidden") => { const e = new Error(msg); e.code = 403; return e; };

function toNumberOrNull(v) {
  if (v === undefined || v === null) return null;
  const n = typeof v === "number" ? v : Number(v);
  if (Number.isNaN(n)) throw new Error("Value must be a number");
  return n;
}

function numberOrNull(v, name) {
  const n = toNumberOrNull(v);
  if (n === null) return null;
  if (n < 0) throw new Error(`${name} must be non-negative`);
  return n;
}

function intOrNull(v, name) {
  if (v === undefined || v === null) return null;
  const n = typeof v === "number" ? v : Number.parseInt(v, 10);
  if (Number.isNaN(n)) throw new Error(`${name} must be a number`);
  if (!Number.isInteger(n) || n < 0) throw new Error(`${name} must be a non-negative integer`);
  return n;
}

function parseAndCheckDates(startTime, endTime, mustHaveBoth = true) {
  if (mustHaveBoth) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) throw new Error("Invalid date");
    if (end <= start) throw new Error("endTime must be after startTime");
    return { start, end };
  } else {
    const start = startTime !== undefined ? new Date(startTime) : undefined;
    const end = endTime !== undefined ? new Date(endTime) : undefined;

    if (start !== undefined && Number.isNaN(start.getTime())) throw new Error("Invalid startTime");
    if (end !== undefined && Number.isNaN(end.getTime())) throw new Error("Invalid endTime");

    if (start !== undefined && end !== undefined && end <= start) {
      throw new Error("endTime must be after startTime");
    }
    return { start, end };
  }
}

function isoNoMs(d) {
  return new Date(d).toISOString().replace('.000Z', 'Z');
}

function buildUpdateResponse(updated, patch) {
  const out = {
    id: updated.id,
    name: updated.name,
    type: (updated.type === "onetime" ? "one-time" : updated.type),
  };

  const keys = Object.keys(patch);
  if (keys.includes("description")) out.description = updated.description;
  if (keys.includes("startTime"))   out.startTime   = isoNoMs(updated.startTime);
  if (keys.includes("endTime"))     out.endTime     = isoNoMs(updated.endTime);
  if (keys.includes("minSpending")) out.minSpending = updated.minSpending;
  if (keys.includes("rate"))        out.rate        = updated.rate;
  if (keys.includes("points"))      out.points      = updated.points;

  return out;
}

const promotionService = {
  async createPromotion(data) {
    const { name, description, type, startTime, endTime } = data;
    if (!name || !description || !type || !startTime || !endTime) {
      const e = new Error("Missing required fields");
      e.code = 400;
      throw e;
    }
    if (!["automatic", "one-time"].includes(type)) {
      const e = new Error("type must be 'automatic' or 'one-time'");
      e.code = 400;
      throw e;
    }

    const { start, end } = parseAndCheckDates(startTime, endTime, true);

    const created = await promotionRepository.create({
      name,
      description,
      type: toDbType(type),
      startTime: start,
      endTime: end,
      minSpending: numberOrNull(data.minSpending, "minSpending"),
      rate: numberOrNull(data.rate, "rate"),
      points: intOrNull(data.points, "points"),
    });

    return { ...created, type: toApiType(created.type) };
  },

  async getAllPromotionsForUser(user, query = {}) {
    const role = user.role;
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 10;
    const skip = (page - 1) * limit;

    const where = {};

    if (query.name) where.name = { contains: query.name, mode: "insensitive" };
    if (query.type) where.type = toDbType(query.type);

    const now = nowUtc();

    if (role === "regular" || role === "cashier") {
      where.startTime = { lte: now };
      where.endTime = { gte: now };
    } else {
      if (query.started === "true") {

        where.startTime = { lte: now };
      }
      if (query.ended === "true") {
        where.endTime = { lt: now };
      }
    }

    const results = await promotionRepository.findMany(where, skip, limit, { endTime: "asc" });
    return {
      count: results.length,
      results: results.map(p => ({ ...p, type: toApiType(p.type)})),
    };
  },

  async getPromotionByIdForUser(id, role) {
    const p = await promotionRepository.findById(id);
    if (!p) throw err404("Promotion not found");

    if ((role === "regular" || role === "cashier") && !isActive(p)) {
      throw err404("Promotion not active");
    }
    return { ...p, type: toApiType(p.type) };
  },

  async updatePromotion(id, data) {
    const existing = await promotionRepository.findById(id);
    if (!existing) { const e = new Error("Promotion not found"); e.code = 404; throw e; }

    const now = nowUtc();
    const isMissing = (v) => v === undefined || v === null || v === "";

    const patch = {};
    if (!isMissing(data.name))        patch.name        = String(data.name);
    if (!isMissing(data.description)) patch.description = String(data.description);

    if (!isMissing(data.type)) {
      const t = String(data.type);
      if (!["automatic", "one-time", "onetime"].includes(t)) {
        const e = new Error("type must be 'automatic' or 'one-time'"); e.code = 400; throw e;
      }
      patch.type = (t === "one-time" ? "onetime" : t);
    }

    const coerceNum = (v) => Number(v);

    if (!isMissing(data.minSpending)) {
      const n = coerceNum(data.minSpending);
      if (!Number.isFinite(n) || n < 0) {
        const e = new Error("minSpending must be non-negative number"); e.code = 400; throw e;
      }
      patch.minSpending = n;
    }

    if (!isMissing(data.rate)) {
      const n = coerceNum(data.rate);
      if (!Number.isFinite(n) || n < 0) {
        const e = new Error("rate must be non-negative number"); e.code = 400; throw e;
      }
      patch.rate = n;
    }

    if (!isMissing(data.points)) {
      const n = Number(data.points);
      if (!Number.isInteger(n) || n < 0) {
        const e = new Error("points must be a non-negative integer"); e.code = 400; throw e;
      }
      patch.points = n;
    }

    const hasNewStart = !isMissing(data.startTime);
    const hasNewEnd   = !isMissing(data.endTime);

    let newStart = hasNewStart ? new Date(data.startTime) : null;
    let newEnd   = hasNewEnd   ? new Date(data.endTime)   : null;

    if (hasNewStart && Number.isNaN(newStart.getTime())) { const e = new Error("Invalid startTime"); e.code = 400; throw e; }
    if (hasNewEnd   && Number.isNaN(newEnd.getTime()))   { const e = new Error("Invalid endTime");   e.code = 400; throw e; }

    if (hasNewStart && newStart < now) { const e = new Error("startTime cannot be in the past"); e.code = 400; throw e; }
    if (hasNewEnd   && newEnd   < now) { const e = new Error("endTime cannot be in the past");   e.code = 400; throw e; }

    const originalStart = new Date(existing.startTime);
    const originalEnd   = new Date(existing.endTime);
    const originalEnded = now >= originalEnd;

    if (originalEnded && hasNewEnd) {
      const e = new Error("Cannot update endTime after original end time has passed"); e.code = 400; throw e;
    }

    const effectiveStart = hasNewStart ? newStart : originalStart;
    const effectiveEnd   = hasNewEnd   ? newEnd   : originalEnd;
    if (effectiveEnd <= effectiveStart) {
      const e = new Error("endTime must be after startTime"); e.code = 400; throw e;
    }

    if (hasNewStart) patch.startTime = newStart;
    if (hasNewEnd)   patch.endTime   = newEnd;

    if (Object.keys(patch).length === 0) {
      return {
        id: existing.id,
        name: existing.name,
        type: (existing.type === "onetime" ? "one-time" : existing.type),
      };
    }

    const updated = await promotionRepository.update(id, patch);

    return buildUpdateResponse(updated, patch);
  },


  async deletePromotion(id) {
    const p = await promotionRepository.findById(id);
    if (!p) throw err404("Promotion not found");

    if (new Date(p.startTime) <= nowUtc()) {
      throw err403("Cannot delete a promotion that has already started");
    }

    await promotionRepository.delete(id);
  },

  async update(req, res) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: "Invalid promotion id" });
      const promo = await promotionService.updatePromotion(id, req.body);
      return res.status(200).json(promo);
    } catch (err) {
      console.error("PATCH /promotions/:id failed:", err.message);
      return res.status(err.code || 400).json({ error: err.message });
    }
  },

  async usePromotion(userId, promotionId){
    const promoUsage = await promotionRepository.addToPromotionUsage(userId, promotionId);
  }
};

module.exports = promotionService;
