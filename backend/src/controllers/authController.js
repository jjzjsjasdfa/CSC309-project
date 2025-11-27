const authService = require("../services/authService");
const userService = require("../services/userService");
const emailService = require("../services/emailService");

const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/userRepository");
const SECRET_KEY = process.env.JWT_SECRET;
const { v4: uuid } = require('uuid');
const bcrypt = require("bcrypt");

const rateLimitMap = new Map();

const authController = {
  async authenticate(req, res) {
    const { utorid, password } = req.body;
    const r = await authService.authenticate(utorid, password);
    if(r.result === false){
      return res.status(401).json({ error: r.message });
    }

    const user = r.user;
    const payload = { id: user.id, role: user.role };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '7d' });
    return res.status(200).json({ token: token, expiresAt: user.expiresAt });
  },

  async generateResetToken(req, res) {
    // check if user exists
    const { utorid } = req.body;
    let user = await userService.getUserByUtorid(utorid);

    if(!user){
      return res.status(404).json({ error: `User with utorid ${utorid} not found` });
    }

    // rate limit
    const ip = req.ip;
    const now = new Date(Date.now());
    const lastRequest = rateLimitMap.get(ip);

    if (lastRequest && now - lastRequest < 60 * 1000) { // 60 seconds
      return res.status(429).json({ error: "Too many requests from this IP" });
    }

    // reset token
    const resetToken = uuid();
    const expiresAt = new Date(now.getTime() + 60 * 60 * 1000);

    user = await userService.updateUserByUtorid(utorid, { resetToken, expiresAt });
    rateLimitMap.set(ip, now);

    try {
      if (!user.email) {
         return res.status(400).json({ error: "This account has no email address linked." });
      }

      await emailService.sendResetLink(user.email, resetToken);

      return res.status(200).json({ message: "Reset link has been sent to your email." });

    } catch (error) {
      console.error("Email error:", error);
      return res.status(500).json({ error: "Failed to send email. Please try again later." });
    }
  },

  async resetPassword(req, res) {
    const { utorid, password } = req.body;
    const { resetToken } = req.params;

    let user = await userService.getUserByResetToken(resetToken);
    const now = new Date(Date.now());

    if(!user){
      return res.status(404).json({ error: `User with resetToken ${resetToken} not found` });
    }else if (user.utorid !== utorid) {
      return res.status(401).json({ error: "Utorid does not match" });
    }else if (user.expiresAt < now) {
      return res.status(410).json({ error: "Reset token has expired" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user = await userService.updateUserByUtorid(utorid, { password: hashedPassword, expiresAt: now });
    return res.status(200).json({ message: "Password reset successfully" });
  }
}

module.exports = authController;

