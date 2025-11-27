const userService = require("../services/userService");
const bcrypt = require('bcrypt');
const transactionService = require("../services/transactionService");

const userController = {
  async register(req, res) {
    try {
      const { utorid: u, name: n, email: e } = req.body;
      const newUser = await userService.registerRegularUser(u, n, e);
      const { id, utorid, name, email, verified, expiresAt, resetToken } = newUser;

      return res.status(201).json({ id, utorid, name, email, verified, expiresAt, resetToken });
    } catch (error) {
      return res.status(409).json({ error: error.message });
    }
  },

  async getUsers(req, res){
    let page, limit;
    let where = {};

    for(const key in req.query){
      switch(key){
        case "name":
        case "role":
          where[key] = req.query[key];
          break;
        case "verified":
        case "activated":
          where[key] = req.query[key] === "true";
          break;
        case "page":
          page = parseInt(req.query[key], 10);
          break;
        case "limit":
          limit = parseInt(req.query[key], 10);
          break;
      }
    }

    if(page === undefined){
      page = 1;
    }

    if(limit === undefined){
      limit = 10;
    }

    if(page < 1 || limit < 1){
      return res.status(400).json({ error: "page and limit must be positive integers" });
    }

    let users = await userService.getUsers(where);
    const count = users.length;
    if(!users){
      return res.status(200).json({ count: count, results: [], message: "no users found with this condition" });
    }

    const skip = (page - 1) * limit;
    users = await userService.getUsersWithSkipAndLimit(where, skip, limit);
    if(!users){
      return res.status(200).json({ count: count, results: [], message: "no users in this page" });
    }

    const results = users.map(
      ({id, utorid, name, email, birthday, role, points, createdAt, lastLogin, verified, avatarUrl}) =>
        ({id, utorid, name, email, birthday, role, points, createdAt, lastLogin, verified, avatarUrl}
      )
    );
    return res.status(200).json({
      count: count,
      results: results,
    });
  },

  async getUser(req, res) {
    const id = parseInt(req.params.userId, 10);
    let user;

    // cashier
    if(req.user.role === "cashier"){
      user = await userService.getUserWithAvailablePromo(id);
      const { utorid, name, points, verified, promotions } = user;
      return res.status(200).json({ id, utorid, name, points, verified, promotions });
    }
    // manager or higher
    else{
      user = await userService.getUserWithAllPromo(id);
      const { utorid, name, email, birthday, role, points, createdAt, lastLogin, verified, avatarUrl, promotions } = user;
      return res.status(200).json({ id, utorid, name, email, birthday, role, points, createdAt, lastLogin, verified, avatarUrl, promotions });
    }
  },

  async updateUser(req, res) {
    const id = parseInt(req.params.userId, 10);
    const user = await userService.getUserById(id);
    let updateData = {};

    if(req.body.email !== undefined){
      updateData.email = req.body.email;
    }

    // don't care when verified === false
    if (req.body.verified !== undefined) {
      if (!/^(true)$/.test(req.body.verified)) {
        return res.status(400).json({ error: "verified field should always be true" });
      }
      updateData.verified = req.body.verified;
    }

    if (req.body.suspicious !== undefined) {
      updateData.suspicious = req.body.suspicious;
    }

    if (req.body.role !== undefined) {
      // suspicious user cannot be promoted to cashier
      if (req.body.role === "cashier" && user.suspicious === true) {
        return res.status(400).json({ error: "A suspicious user cannot be promoted to cashier" });
      }

      let allowedRoles;
      if(req.user.role === "manager"){
        allowedRoles = ["regular", "cashier"];
      }
      // superuser can promote anyone
      else{
        allowedRoles = ["regular", "cashier", "manager", "superuser"];
      }

      if (!allowedRoles.includes(req.body.role)) {
        return res.status(403).json({ error: `You are not allowed to promote someone to ${req.body.role}` });
      }

      updateData.role = req.body.role;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No update fields provided" });
    }

    const updatedUser = await userService.updateUserById(id, updateData);
    const response = { id: updatedUser.id, utorid: updatedUser.utorid, name: updatedUser.name };
    for (const key of Object.keys(updateData)) {
      response[key] = updatedUser[key];
    }

    return res.status(200).json(response);
  },

  async updateMyself(req, res){
    let updateData = {};

    if(req.body.name !== undefined){
      updateData.name = req.body.name;
    }

    if(req.body.email !== undefined){
      updateData.email = req.body.email;
    }

    if(req.body.birthday !== undefined){
      const [y, m, d] = req.body.birthday.split('-').map(Number);
      updateData.birthday = new Date(y, m - 1, d);
    }

    if (req.file !== undefined) {
      updateData.avatarUrl = '/uploads/avatars/' + req.file.filename;
    }

    if(Object.keys(updateData).length === 0){
      return res.status(400).json({ error: "No update fields provided" });
    }

    updateData.verified = true;

    const updatedUser = await userService.updateUserById(req.user.id, updateData);
    const response = {
      id: updatedUser.id,
      utorid: updatedUser.utorid,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      points: updatedUser.points,
      createdAt: updatedUser.createdAt,
      lastLogin: updatedUser.lastLogin,
      verified: updatedUser.verified,
      avatarUrl: updatedUser.avatarUrl
    };

    const birthday = updatedUser.birthday;

    let year = birthday.getFullYear().toString();
    year = "0".repeat(4 - year.length) + year;

    let month = (birthday.getMonth() + 1).toString();
    month = "0".repeat(2 - month.length) + month;

    let day = birthday.getDate().toString();
    day = "0".repeat(2 - day.length) + day;

    response.birthday = year + '-' + month + '-' + day;
    return res.status(200).json(response);
  },

  async getMyself(req, res){
    const myself = await userService.getUserWithAllPromo(req.user.id);
    const { id, utorid, name, email, birthday, role, points, createdAt, lastLogin, verified, avatarUrl, promotions } = myself
    return res.status(200).json({ id, utorid, name, email, birthday, role, points, createdAt, lastLogin, verified, avatarUrl, promotions });
  },

  async updateMyPassword(req, res){
    const myself = await userService.getUserWithAllPromo(req.user.id);

    // see if old matches
    const isMatch = await bcrypt.compare(req.body.old, myself.password);
    if(!isMatch){
      return res.status(403).json({ error: "the provided current password is incorrect" })
    }

    const hashedPassword = await bcrypt.hash(req.body["new"], 10);
    const updated = await userService.updateUserById(req.user.id, { password: hashedPassword });
    return res.status(200).json({ message: "password updated" });
  },

  async transferPoints(req, res){
    const { type, amount, remark } = req.body;
    const userId = parseInt(req.params.userId, 10);
    let senderData = {};
    let receiverData = {};

    // validate the payloads
    if(type !== "transfer"){
      return res.status(400).json({ error: "type should be 'transfer'" });
    }
    senderData.type = "transfer";
    receiverData.type = "transfer";

    if(typeof amount !== "number" || amount < 0){
      return res.status(400).json({ error: "amount should be a positive integer" });
    }
    senderData.amount = 0 - amount;
    receiverData.amount = amount;

    if(remark === undefined){
      senderData.remark = "";
      receiverData.remark = "";
    } else{
      senderData.remark = remark;
      receiverData.remark = remark;
    }

    const targetUser = await userService.getUserById(userId);
    if(!targetUser){
      return res.status(404).json({ error: "target user not found" });
    }
    senderData.relatedId = targetUser.id;
    receiverData.utorid = targetUser.utorid;


    const sourceUser = await userService.getUserById(req.user.id);
    if(sourceUser.points < amount){
      return res.status(400).json({ error: "insufficient points" });
    }else if(!sourceUser.verified){
      return res.status(403).json({ error: "you need to verify your account before transferring points" });
    }else if(sourceUser.id === targetUser.id){
      return res.status(400).json({ error: "you cannot transfer points to yourself" });
    }
    senderData.utorid = sourceUser.utorid;
    receiverData.relatedId = sourceUser.id;

    senderData.createdBy = sourceUser.utorid;
    receiverData.createdBy = sourceUser.utorid;

    // create two transactions
    const t1 = await transactionService.createRedemption(senderData);
    const t2 = await transactionService.createRedemption(receiverData);

    // update points
    const updatedSrc = await userService.updateUserById(sourceUser.id, { points: sourceUser.points - amount });
    const updatedTar = await userService.updateUserById(targetUser.id, { points: targetUser.points + amount });

    return res.status(201).json({
      id: t1.id,
      sender: sourceUser.utorid,
      recipient: targetUser.utorid,
      type: "transfer",
      sent: amount,
      remark,
      createdBy: sourceUser.utorid
    });
  },

  async redeemPoints(req, res){
    const { type, amount, remark } = req.body;
    let data = {};

    // validate the payloads
    if(type !== "redemption"){
      return res.status(400).json({ error: "type should be 'redemption'" });
    }
    data.type = "redemption";

    if(typeof amount !== "number" || amount < 0){
      return res.status(400).json({ error: "amount should be a positive integer" });
    }
    data.amount = amount;

    if(remark === undefined){
      data.remark = "";
    } else{
      data.remark = remark;
    }

    const user = await userService.getUserById(req.user.id);
    if(user.points < amount){
      return res.status(400).json({ error: "insufficient points" });
    }else if(!user.verified){
      return res.status(403).json({ error: "you need to verify your account before transferring points" });
    }
    data.utorid = user.utorid;
    data.createdBy = user.utorid;

    data.processedBy = null;

    // create transaction
    const t = await transactionService.createTransfer(data);

    return res.status(201).json({
      id: t.id,
      utorid: user.utorid,
      type: "redemption",
      processedBy: null,
      amount,
      remark,
      createdBy: user.utorid
    });
  },

  async getMyTransactions(req, res){
    let page, limit;
    let where = {};

    const user = await userService.getUserById(req.user.id);
    where["utorid"] = user.utorid;

    if(req.query.amount !== undefined && req.query.operator !== undefined){
      where["amount"] = {};
      where["amount"][req.query.operator] = parseInt(req.query.amount, 10);
    }

    for(const key in req.query){
      const value = req.query[key];
      if(value !== undefined){
        switch(key){
          case "type":
            where[key] = req.query[key];
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
  }

};

module.exports = userController;