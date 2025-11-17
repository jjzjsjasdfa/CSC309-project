const prisma = require("../../prisma/prismaClient");

const transactionRepository = {
  async createTransaction(transactionData, includePromotions) {
    if (includePromotions) {
      return await prisma.transaction.create({
        data: transactionData,
        include: { promotions: true }
      });
    }else{
      return await prisma.transaction.create({
        data: transactionData
      });
    }
  },

  async getTransactions(where){
    return await prisma.transaction.findMany({
      where: where
    });
  },

  async getTransactionsWithInclude(where, includePromotions){
    if (includePromotions) {
      return await prisma.transaction.findMany({
        where: where,
        include: { promotions: true }
      });
    }else{
      return await prisma.transaction.findMany({
        where: where,
      });
    }
  },

  async getTransactionsWithSkipAndLimitAndInclude(where, skip, limit, includePromotions){
    if (includePromotions) {
      return await prisma.transaction.findMany({
        where: where,
        skip: skip,
        take: limit,
        include: { promotions: true }
      });
    }
    else{
      return await prisma.transaction.findMany({
        where: where,
        skip: skip,
        take: limit,
      });
    }
  },

  async getTransactionById(id){
    return await prisma.transaction.findUnique({
      where: { id }
    });
  },

  async updateTransaction(where, data){
    return await prisma.transaction.update({
      where: where,
      data: data
    });
  }

}

module.exports = transactionRepository;