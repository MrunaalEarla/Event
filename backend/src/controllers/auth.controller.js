const { AuthService } = require('../services/auth.service');

exports.login = async (req, res) => {
  try {
    const result = await AuthService.login(req.body);
    res.json({ success: true, token: result.token, user: result.user });
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ success: false, message: error.message || 'Server error' });
  }
};

exports.me = async (req, res) => {
  try {
    const me = await AuthService.me(req.user);
    res.json({ success: true, user: me });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
