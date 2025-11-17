const prisma = require("../../prisma/prismaClient");
const userRepository = require("./userRepository");

const promotionRepository = {
  async create(data) {
    return prisma.promotion.create({ data });
  },

  async findMany(where = {}) {
    return prisma.promotion.findMany({ where });
  },

  async findById(id) {
    return prisma.promotion.findUnique({ where: { id } });
  },

  async update(id, data) {
    return prisma.promotion.update({ where: { id }, data });
  },

  async delete(id) {
    return prisma.promotion.delete({ where: { id } });
  },

  async availableByUtorid(utorid){
    const now = new Date(Date.now());
    const activePromos = await prisma.promotion.findMany({
      where: {
        startTime: { lte: now },
        endTime: { gt: now },
      }
    });

    const user = await userRepository.findByUtorid(utorid);


    const used = await prisma.promotionUsage.findMany({
      where: { userId: user.id },
      select: { promotionId: true }
    });
    const usedIds = new Set(used.map(u => u.promotionId));

    const available = activePromos.filter(p => !(p.type === 'onetime' && usedIds.has(p.id)));

    return available;
  },
  
  async addToPromotionUsage(userId, promotionId){
    return await prisma.PromotionUsage.create({
      data: {
        userId,
        promotionId,
      }
    });
  }
};

module.exports = promotionRepository;
