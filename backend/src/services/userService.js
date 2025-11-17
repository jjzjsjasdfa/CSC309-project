const userRepository = require("../repositories/userRepository");
const { v4: uuid } = require('uuid');

const userService = {
  async registerRegularUser(utorid, name, email) {
    let existing = await userRepository.findByUtorid(utorid);
    if (existing) throw new Error(`User with utorid ${utorid} already exists.`);

    existing = await userRepository.findByEmail(email);
    if (existing) throw new Error(`User with email ${email} already exists.`);

    const resetToken = uuid();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    return await userRepository.createRegularUser(utorid, name, email, resetToken, expiresAt);
  },

  async getUsersWithSkipAndLimit(where, skip, limit){
    return await userRepository.findManyWithSkipAndLimit(where, skip, limit);
  },

  async getUsers(where){
    return await userRepository.findMany(where);
  },

  async getUserById(id){
    return await userRepository.findById(id);
  },

  async getUserByUtorid(utorid){
    return await userRepository.findByUtorid(utorid);
  },

  async getUserByResetToken(token){
    return await userRepository.findByResetToken(token);
  },

  async getUserWithAvailablePromo(id){
    return await userRepository.findByIdIncludeAvailablePromo(id);
  },

  async getUserWithAllPromo(id){
    return await userRepository.findByIdIncludeAllPromo(id);
  },

  async updateUserById(id, data){
    return await userRepository.updateUserById(id, data);
  },

  async updateUserByUtorid(utorid, data){
    return await userRepository.updateUserByUtorid(utorid, data);
  },
};

module.exports = userService;