/**
 * Auth routes — register, login, refresh, logout.
 * Validation middleware runs before controllers.
 * Logout requires authentication (needs req.user).
 */
const { Router } = require('express');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const { registerSchema, loginSchema } = require('../schemas/auth.schema');
const {
  registerHandler,
  loginHandler,
  refreshHandler,
  logoutHandler,
} = require('../controllers/auth.controller');

const router = Router();

router.post('/register', validate(registerSchema), registerHandler);
router.post('/login', validate(loginSchema), loginHandler);
router.post('/refresh', refreshHandler);
router.post('/logout', authenticate, logoutHandler);

module.exports = router;
