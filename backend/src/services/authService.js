const userRepository = require("../repositories/userRepository");
const bcrypt = require('bcrypt');

const authService = {
  async authenticate(utorid, password) {
    let user = await userRepository.findByUtorid(utorid);

    // user not found
    if (!user) return { result: false, message: "User not found" };

    // no password
    if (!user.password) return { result: false, message: "User has no password" };

    // password incorrect
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return { result: false, message: "password incorrect" };

    // update lastLogin and expiresAt
    const now = new Date(Date.now());
    const expiresAt = new Date();
    expiresAt.setDate(now.getDate() + 7);
    user = await userRepository.updateUserByUtorid(utorid, { lastLogin: now, expiresAt, activated: true });
    return { result: true, user: user };
  },
}


module.exports = authService;