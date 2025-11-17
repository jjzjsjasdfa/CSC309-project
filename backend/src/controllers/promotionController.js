const promotionService = require("../services/promotionService");

const promotionController = {
  async create(req, res) {
    try {
      const promo = await promotionService.createPromotion(req.body);
      return res.status(201).json(promo);
    } catch (err) {
      return res.status(err.code || 400).json({ error: err.message });
    }
  },

  async getAll(req, res) {
    try {
      const q = { ...req.query };
      if (q.page !== undefined) {
        const p = Number(q.page);
        if (!Number.isInteger(p) || p < 1) {
          return res.status(400).json({ error: "Invalid page number" });
        }
      }
      if (q.limit !== undefined) {
        const l = Number(q.limit);
        if (!Number.isInteger(l) || l < 1) {
          return res.status(400).json({ error: "Invalid limit" });
        }
      }

      if (q.started && q.ended) {
        return res.status(400).json({ error: "Cannot request both started and ended" });
      }

      const data = await promotionService.getAllPromotionsForUser(req.user, q);
      return res.status(200).json(data);
    } catch (err) {
      return res.status(err.code || 400).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid promotion id" });
      }

      const promo = await promotionService.getPromotionByIdForUser(id, req.user.role);
      return res.status(200).json(promo);
    } catch (err) {
      return res.status(err.code || 404).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid promotion id" });
      }
      const promo = await promotionService.updatePromotion(id, req.body);
      return res.status(200).json(promo);
    } catch (err) {
      return res.status(err.code || 400).json({ error: err.message });
    }
  },

  async remove(req, res) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid promotion id" });
      }
      await promotionService.deletePromotion(id);
      return res.status(204).end();
    } catch (err) {
      return res.status(err.code || 400).json({ error: err.message });
    }
  }
};

module.exports = promotionController;
