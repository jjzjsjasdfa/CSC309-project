const prisma = require("../../prisma/prismaClient");

const userRepository = {
  async createRegularUser(utorid, name, email, resetToken, expiresAt){
    return prisma.user.create({
      data: { utorid, name, email, role: "regular", resetToken, expiresAt }
    });
  },

  async findByUtorid(utorid){
    return prisma.user.findUnique({
      where: { utorid }
    });
  },

  async findByResetToken(resetToken){
    return prisma.user.findFirst({
      where: { resetToken }
    });
  },

  async findByEmail(email){
    return prisma.user.findUnique({
      where: { email }
    });
  },

  async findManyWithSkipAndLimit(where, skip, limit){
    return prisma.user.findMany({
      where: where,
      skip: skip,
      take: limit,
    });
  },

  async findMany(where){
    return prisma.user.findMany({
      where: where
    });
  },

  async findById(id){
    return prisma.user.findUnique({
      where: { id },
    });
  },

  async findByIdIncludeAvailablePromo(id){
    const now = new Date();

    const activePromos = await prisma.promotion.findMany({
      where: {
        startTime: { lte: now },
        endTime: { gt: now },
      }
    });

    const used = await prisma.promotionUsage.findMany({
      where: { userId: id },
      select: { promotionId: true }
    });
    const usedIds = new Set(used.map(u => u.promotionId));

    const available = activePromos.filter(p => !(p.type === 'onetime' && usedIds.has(p.id)));

    const user = await prisma.user.findUnique({
      where: { id }
    });

    return {
      ...user,
      promotions: available
    };
  },

  async findByIdIncludeAllPromo(id){
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        promotionUsages: {
          include: { promotion: true }
        }
      }
    });

    if (!user) return null;

    return {
      ...user,
      promotions: user.promotionUsages.map(u => u.promotion)
    };
  },

  async updateUserById(id, data){
    return prisma.user.update({
      where: { id },
      data: data
    });
  },

  async updateUserByUtorid(utorid, data){
    return prisma.user.update({
      where: { utorid },
      data: data
    });
  },

};

module.exports = userRepository;
