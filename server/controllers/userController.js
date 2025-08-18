const User = require('../models/User')
const UniversityRepresentative = require('../models/UniversityRepresentative')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto'); // For generating tokens
const nodemailer = require('nodemailer'); // For sending emails

// Register User
const registerUser = async (req, res) => {
  const { name, email, password, phone_number, role, university } = req.body

  try {
    const userExists = await User.findOne({ email })
    if (userExists) return res.status(400).json({ message: 'User already exists' })

    const hashedPassword = await bcrypt.hash(password, 10)

    // Special handling for university representatives
    if (role === 'university_representative') {
      if (!university) {
        return res.status(400).json({ message: 'university is required for role university_representative' })
      }
      await UniversityRepresentative.create({
        name,
        email,
        password: hashedPassword,
        phone_number,
        role,
        university
      })
    } else {
      // Use new User() and .save() instead of User.create()
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        phone_number,
        role
      })
      await newUser.save()
    }

    res.status(201).json({ message: 'User registered successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.findOne({ email }).select('+password')
    if (!user) return res.status(400).json({ message: 'Invalid credentials' })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' })

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })
    user.last_login = new Date()
    await user.save()

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

// Get user email by reset token
const getEmailByResetToken = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    res.status(200).json({ email: user.email });
  } catch (error) {
    console.error('Error fetching email by reset token:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Forgot Password (send reset link)
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User with that email does not exist.' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send email with reset link
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail', // You can use other services like SendGrid, Mailgun, etc.
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: user.email,
      subject: 'Password Reset Request',
      html: `<p>You requested a password reset</p><p>Click this <a href="${resetUrl}">link</a> to reset your password.</p>`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Password reset link sent to your email.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error, could not send reset email.' });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error, could not reset password.' });
  }
};

// Change Password for logged-in user
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id).select('+password'); // req.user.id from protect middleware

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password.' });
    }

    // Hash and update new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error, could not change password.' });
  }
};

// Get current user (via token)
const getCurrentUser = async (req, res) => {
  res.json(req.user)
}

// Admin: Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password')
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

// Admin: Get users by role
const getUserByRole = async (req, res) => {
  try {
    const roleParam = String(req.params.role || '').trim()
    const allowedRoles = User.schema.path('role').enumValues
    if (!allowedRoles.includes(roleParam)) {
      return res.status(400).json({ message: 'Invalid role', allowedRoles })
    }

    const users = await User.find({ role: roleParam }).select('-password')
    return res.json(users)
  } catch (error) {
    return res.status(500).json({ message: 'Server error' })
  }
}

// Update user profile
const updateUser = async (req, res) => {
  const { name, email, phone_number } = req.body;
  try {
    const user = await User.findById(req.user.id); // req.user.id comes from protect middleware

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only allow update of name, email, phone_number for simplicity
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone_number = phone_number || user.phone_number;

    const updatedUser = await user.save();

    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone_number: updatedUser.phone_number,
      role: updatedUser.role,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin: Delete user
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    res.json({ message: 'User deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user' })
  }
}

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  getAllUsers,
  getUserByRole,
  deleteUser,
  updateUser,
  changePassword,
  forgotPassword,
  resetPassword,
  getEmailByResetToken
}
