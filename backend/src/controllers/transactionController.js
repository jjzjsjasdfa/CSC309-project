const transactionService = require("../services/transactionService");
const userService = require("../services/userService");
const userRepository = require("../repositories/userRepository");
const promotionRepository = require("../repositories/promotionRepository");
const promotionService = require("../services/promotionService");
const transactionRepository = require("../repositories/transactionRepository");

const transactionController = {
    async createTransaction(req, res) {
        let { utorid, type, promotionIds, remark } = req.body;

        let transactionData = {}
        let includePromotions = false;

        const transactionUser = await userService.getUserByUtorid(utorid);
        if (!transactionUser){
            return res.status(404).json({ error: `Transaction user not Found` });
        }
        transactionData.utorid = transactionUser.utorid;

        const createdByUser = await userRepository.findById(req.user.id);
        transactionData.createdBy = createdByUser.utorid;

        // check if promotionIds are valid
        let promotions = [];
        transactionData.promotions = { connect: [] };
        if (promotionIds === undefined || promotionIds.length === 0){
            promotionIds = [];
            transactionData.promotions = {};
        }else{
            const availablePromos = await promotionRepository.availableByUtorid(utorid);
            const availablePromoIds = availablePromos.map(p => p.id);

            // check if all promoIds are valid
            for(const id of promotionIds){
                if(!availablePromoIds.includes(id)){
                    return res.status(400).json({ error: "Invalid promoId" });
                }
                const promo = await promotionRepository.findById(id);
                promotions.push(promo);

                transactionData.promotions.connect.push({ id });
                includePromotions = true;
            }
        }

        if(remark === undefined) remark = "";
        transactionData.remark = remark;



        if (type === "purchase") {
            transactionData.type = "purchase";

            // verify the payload
            const { spent } = req.body;
            if (typeof spent !== "number") {
                return res.status(400).json({ error: "spent should be a number" });
            }
            transactionData.spent = spent;

            // calculated the earned points and update user points
            // basic points
            let earned = Math.round(spent * 4);

            // promotion points
            for (const promotion of promotions) {
                // promotion is used
                if(promotion.minSpending === undefined ||
                  (promotion.minSpending !== undefined && spent !== undefined && spent >= promotion.minSpending)){
                  // earn promotion points
                  const fixedPoints = promotion.points === undefined ? 0 : promotion.points;
                  earned += fixedPoints;
                  if (promotion.rate != null) earned += Math.round(spent * promotion.rate * 100);

                  // update the table
                  await promotionService.usePromotion(transactionUser.id, promotion.id);
                }

                // promotion is not used
                if(promotion.minSpending !== undefined && spent !== undefined && spent < promotion.minSpending){
                  return res.status(400).json({ error: "spent is less than the minimum spending" });
                }
            }

            transactionData.earned = earned;

            if (createdByUser.suspicious) {
              transactionData.suspicious = true;
              transactionData.amount = earned;
              transactionData.earned = 0;
            }

            // create transaction
            const purchase = await transactionService.createPurchaseWithInclude(transactionData, includePromotions);

            // update user points
            if (!createdByUser.suspicious) {
                const updatedTransactionUser = await userRepository.updateUserByUtorid(utorid, { points: { increment: earned } });
            }

            return res.status(201).json({
                id: purchase.id,
                utorid: purchase.utorid,
                type: purchase.type,
                spent: purchase.spent,
                earned: purchase.earned,
                remark: purchase.remark,
                promotionIds: promotionIds,
                createdBy: purchase.createdBy,
            });
        }


        if (type === "adjustment") {
            transactionData.type = "adjustment";

            // verify the payload
            const { amount, relatedId } = req.body;
            if (typeof amount !== "number" || typeof relatedId !== "number") {
                return res.status(400).json({ error: "amount and relatedId should be numbers" });
            }
            transactionData.amount = amount;

            const oldTransaction = await transactionService.findById(relatedId);
            if (!oldTransaction) {
                return res.status(404).json({ error: "related transaction not found" });
            }
            transactionData.relatedId = relatedId;

            // create transaction
            const adjustment = await transactionService.createAdjustmentWithInclude(transactionData, includePromotions);

            // update user points
            const updatedTransactionUser = await userRepository.updateUserByUtorid(utorid, { points: { increment: amount } });

            return res.status(201).json({
                id: adjustment.id,
                utorid: adjustment.utorid,
                amount: adjustment.amount,
                type: adjustment.type,
                relatedId: adjustment.relatedId,
                remark: adjustment.remark,
                promotionIds: promotionIds,
                createdBy: adjustment.createdBy
            });
        }
    },

    async getTransactions(req, res) {
      let page, limit;
      let where = {};

      if(req.query.amount !== undefined && req.query.operator !== undefined){
        where["amount"] = {};
        where["amount"][req.query.operator] = parseInt(req.query.amount, 10);
      }

      if (typeof req.query.name === "string" && req.query.name !== "") {
        const nameQ = req.query.name;
        const prisma = require("../../prisma/prismaClient");
        const matches = await prisma.user.findMany({
        where: {
            OR: [
            { name:   { contains: nameQ, mode: "insensitive" } },
            { utorid: { contains: nameQ, mode: "insensitive" } },
            ],
        },
        select: { utorid: true }
        });

        if (matches.length > 0) {
            where.utorid = { in: matches.map(u => u.utorid) };
        } else {
            where.utorid = { contains: nameQ, mode: "insensitive" };
        }
      }

      for(const key in req.query){
        const value = req.query[key];
        if(value !== undefined){
          switch(key){
            case "utorid":
            case "createdBy":
            case "type":
              where[key] = req.query[key];
              break;
            case "suspicious":
              where[key] = req.query[key] === "true";
              break;
            case "promotionId":
              where["promotions"] = {};
              where["promotions"]["some"] = { id: parseInt(req.query[key], 10) };
              break;
            case "relatedId":
              where["relatedId"] = parseInt(req.query[key], 10);
              break;
            case "page":
              page = parseInt(req.query[key], 10);
              break;
            case "limit":
              limit = parseInt(req.query[key], 10);
              break;
          }
        }
      }

      if(page === undefined){
        page = 1;
      }

      if(limit === undefined){
        limit = 10;
      }

      const skip = (page - 1) * limit;

      if(page < 1 || limit < 1){
        return res.status(400).json({ error: "page and limit must be positive integers" });
      }else if(req.query.relatedId !== undefined && req.query.type === undefined){
        return res.status(400).json({ error: "relatedId must be used with type" });
      }else if(req.query.amount !== undefined && req.query.operator === undefined){
        return res.status(400).json({ error: "amount must be used with operator" });
      }else if(req.operator !== undefined && req.operator !== "gte" && req.operator !== "lte"){
        return res.status(400).json({ error: "operator must be gte or lte" });
      }

      let transactions = await transactionService.getTransactionsWithInclude(where, true);
      const count = transactions.length;
      if(!transactions){
        return res.status(200).json({ count: count, results: [], message: "no transactions found with this condition" });
      }

      transactions = await transactionService.getTransactionsWithSkipAndLimitAndInclude(where, skip, limit, true);
      if(!transactions){
        return res.status(200).json({ count: count, results: [], message: "no transactions in this page" });
      }

      return res.status(200).json({
        count: count,
        results: transactions,
      });
    },

  async processRedemption(req, res) {
      const user = await userRepository.findById(req.user.id);

      const { processed } = req.body;
      if(processed === undefined || typeof processed !== "boolean" || processed !== true){
        return res.status(400).json({ error: "processed can only be true" });
      }

      const transactionId = parseInt(req.params.transactionId, 10);

      const transaction = await transactionService.findById(transactionId);
      if(transaction === undefined){
        return res.status(404).json({ error: "transaction not found" });
      }else if(transaction.type !== "redemption"){
        return res.status(400).json({ error: "transaction is not a redemption" });
      }else if(transaction.processedBy !== null){
        return res.status(400).json({ error: "transaction is already processed" });
      }

      // update transaction
      const updatedTransaction = await transactionService.updateTransaction({ id: transactionId }, { processedBy: user.utorid });

      // remove the points
      const updatedUser = await userRepository.updateUserByUtorid(transaction.utorid, { points: { decrement: transaction.amount } });
      if(!updatedUser){
        return res.status(404).json({ error: "user not found" });
      }

      return res.status(200).json({
        id: updatedTransaction.id,
        utorid: updatedTransaction.utorid,
        type: updatedTransaction.type,
        processedBy: updatedTransaction.processedBy,
        redeemed: transaction.amount,
        remark: updatedTransaction.remark,
        createdBy: updatedTransaction.createdBy,
      })
  },

    async getTransactionById(req, res) {
        const id = parseInt(req.params.transactionId, 10);
        if (Number.isNaN(id)) return res.status(400).json({ error: "invalid id" });

        const transaction = await transactionService.getById(id);
        if (!transaction) return res.status(404).json({ error: "not found" });

        return res.status(200).json({ id: transaction.id, utorid: transaction.utorid, type: transaction.type,
            spent: transaction.spent ?? undefined, amount: transaction.amount ?? transaction.earned ?? 0,
            promotionIds: transaction.promotions?.map(p => p.id) ?? [], suspicious: transaction.suspicious,
            remark: transaction.remark ?? "", createdBy: transaction.createdBy, relatedId: transaction.relatedId
        });
    },

    async setSuspicious(req, res) {
        const id = parseInt(req.params.transactionId, 10);
        if (Number.isNaN(id)) return res.status(400).json({ error: "invalid id" });

        const { suspicious } = req.body;
        if (typeof suspicious !== "boolean") return res.status(400).json({ error: "suspicious type error" });

        const transaction = await transactionService.getById(id);
        if (!transaction) return res.status(404).json({ error: "not found" });
        if (transaction.suspicious === suspicious) {
            return res.status(200).json({ ...transaction, promotionIds: transaction.promotions?.map(p => p.id) ?? [] });
        }

        const updated = await transactionService.updateSuspicious(id, suspicious);

        const base = transaction.amount ?? transaction.earned ?? 0;
        let delta;
        if (suspicious) {
            delta = -base;
        } else {
            delta = base;
        }

        await userRepository.updateUserByUtorid(transaction.utorid, { points: { increment: delta } });

        return res.status(200).json({ id: updated.id, utorid: updated.utorid, type: updated.type, spent: updated.spent ?? undefined,
            amount: updated.amount ?? updated.earned ?? 0, promotionIds: updated.promotions?.map(p => p.id) ?? [],
            suspicious: updated.suspicious, remark: updated.remark ?? "", createdBy: updated.createdBy
        });
    }

}

module.exports = transactionController;