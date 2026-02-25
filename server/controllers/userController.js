// controllers/userController.js
const User = require('../models/User');
const UniversityRepresentative = require('../models/UniversityRepresentative');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Disable or enable a user
const disableUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (typeof req.body.disabled !== 'boolean') {
      return res.status(400).json({ message: 'Missing or invalid disabled value' });
    }
    user.disabled = req.body.disabled;
    await user.save();
    res.json({ message: `User ${req.body.disabled ? 'disabled' : 'enabled'} successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// Get user stats (total, by role)
const getUserStats = async (req, res) => {
  try {
    const total = await User.countDocuments();
    const admin = await User.countDocuments({ role: 'admin' });
    const formateur = await User.countDocuments({ role: 'odc_mentor' });
    const partenaire = await User.countDocuments({ role: 'prestataire' });
    const representant = await User.countDocuments({ role: 'university_representative' });
    res.json({ total, admin, formateur, partenaire, representant });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du chargement des statistiques', error: error.message });
  }
};

// Utility: load logo once for embedding in emails
let _emailLogoCache = null; // { buffer, filename, cid }
function loadEmailLogo() {
  if (_emailLogoCache) return _emailLogoCache;
  const logoFilePathEnv = process.env.EMAIL_LOGO_PATH; // optional explicit path
  const candidatePaths = [
    logoFilePathEnv,
    path.resolve(__dirname, '../../client/public/certif_logo.png'),
    path.resolve(__dirname, '../../client/public/logo_orange_certif.png')
  ].filter(Boolean);
  for (const p of candidatePaths) {
    try {
      if (fs.existsSync(p)) {
        _emailLogoCache = { buffer: fs.readFileSync(p), filename: path.basename(p), cid: 'odc_certif_logo' };
        break;
      }
    } catch { /* ignore */ }
  }
  if (!_emailLogoCache && process.env.EMAIL_LOGO_URL) {
    // External URL fallback (not embedded, so no attachment buffer)
    _emailLogoCache = { externalUrl: process.env.EMAIL_LOGO_URL, cid: 'odc_certif_logo' };
  }
  return _emailLogoCache || { cid: 'odc_certif_logo' };
}

function buildSimpleBrandedEmail({ title, userName, paragraphs, button }) {
  const brandColor = '#ff7900';
  const logoInfo = loadEmailLogo();
  const logoTag = logoInfo.buffer || logoInfo.externalUrl
    ? `<img src="${logoInfo.buffer ? 'cid:' + logoInfo.cid : logoInfo.externalUrl}" alt="ODC Certif" style="height:48px;display:block;" />`
    : '';
  const paraHtml = paragraphs.map(p => `<p style=\"margin:0 0 16px 0;font-size:14px;line-height:1.5;\">${p}</p>`).join('');
  const buttonHtml = button && button.url && button.label ? `\n<table role=\"presentation\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"margin:32px 0 8px 0;\"><tr><td bgcolor=\"${brandColor}\" style=\"border-radius:2px;\"><a href=\"${button.url}\" style=\"display:inline-block;padding:12px 24px;font-size:14px;color:#fff;text-decoration:none;font-weight:500;background:${brandColor};\">${button.label}</a></td></tr></table>` : '';
  const year = new Date().getFullYear();
  return `<!DOCTYPE html><html lang="fr"><head><meta charSet="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" /><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f8f8f8;font-family:Arial,Helvetica,sans-serif;color:#111;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f8f8f8;"><tr><td align="center">
<table role="presentation" width="650" cellspacing="0" cellpadding="0" border="0" style="background:#fff;border:1px solid #000000;border-bottom:0;">
<tr><td style="padding:34px 64px 48px 64px;">
<div style="font-size:0;line-height:0;">${logoTag}</div>
<h1 style="margin:24px 0 32px 0;font-size:32px;line-height:1.2;font-weight:700;">${title}</h1>
<p style="margin:0 0 16px 0;font-size:14px;">Bonjour <strong>${userName || 'Utilisateur'}</strong>!</p>
${paraHtml}
<p style="margin:32px 0 0 0;font-size:14px;">Merci,<br/>Équipe Orange Digital Center</p>
</td></tr></table>
<table role="presentation" width="650" cellspacing="0" cellpadding="0" border="0" style="background:${brandColor};"><tr><td style="padding:16px 64px;text-align:center;color:#fff;font-size:11px;">© ${year} Orange Digital Center</td></tr></table>
</td></tr></table></body></html>`;
}

// Register User (sends welcome email with credentials)
const registerUser = async (req, res) => {
  const { name, email, password, phone_number, role, university } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    function generatePassword(length = 12) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~{}[]<>?";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    password += chars[randomIndex];
  }
  return password;
}



    const rawPassword = generatePassword(); // keep plaintext for email BEFORE hashing
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    let createdUser;
    if (role === 'university_representative') {
      if (!university) {
        return res.status(400).json({ message: 'university is required for role university_representative' });
      }
      createdUser = await UniversityRepresentative.create({
        name,
        email,
        password: hashedPassword,
        phone_number,
        role,
        university
      });
    } else {
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        phone_number,
        role
      });
      createdUser = await newUser.save();
    }

    // Send welcome email asynchronously (fire-and-forget)
    (async () => {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: process.env.EMAIL_USERNAME, pass: process.env.EMAIL_PASSWORD }
        });
        const logoInfo = loadEmailLogo();
        const frontendBase = process.env.FRONTEND_URL || 'http://localhost:5173';
        const dashboardUrl = `${frontendBase.replace(/\/$/, '')}/login`;
        const html = buildSimpleBrandedEmail({
          title: 'Votre compte a été créé!',
          userName: name,
          paragraphs: [
            'Nous avons le plaisir de vous informer que votre compte sur la plateforme ODC Certif a été créé avec succès.',
            'Vous pouvez dès maintenant accéder à votre espace personnel pour :',
            '<ul style="margin:0 0 16px 16px;padding:0;font-size:14px;line-height:1.5;">\n<li>Consulter le catalogue de formations disponibles</li>\n<li>Planifier des sessions</li>\n<li>Suivre vos participants</li>\n</ul>',
            '<strong>Identifiants de connexion :</strong>',
            `Email : <strong>${email}</strong><br/>Mot de passe : <strong>${rawPassword}</strong>`,
            "Si vous avez des questions ou besoin d’assistance, n’hésitez pas à nous envoyer un e‑mail!",
            '<span style="font-size:11px;color:#555;display:block;margin-top:24px;">Si vous n\'êtes pas à l\'origine de cette demande, vous pouvez ignorer cet e‑mail.</span>'
          ],
          button: { label: 'Accéder à votre Dashboard', url: dashboardUrl }
        });
        const mailOptions = {
          from: process.env.EMAIL_USERNAME,
          to: email,
          subject: 'Bienvenue sur ODC Certif',
          html,
          attachments: logoInfo.buffer ? [{ filename: logoInfo.filename, content: logoInfo.buffer, cid: logoInfo.cid }] : undefined
        };
        await transporter.sendMail(mailOptions);
      } catch (e) { console.error('Failed to send welcome email', e); }
    })();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

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
  // 15 minutes validity to match requested email wording
  user.resetPasswordExpire = Date.now() + (15 * 60 * 1000);
  await user.save();

  // Frontend base URL (allow override via env)
  const frontendBase = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl = `${frontendBase.replace(/\/$/, '')}/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail', // You can use other services like SendGrid, Mailgun, etc.
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const brandColor = '#ff7900';
    // Attempt to load local logo file for CID embedding (preferred for email clients)
    const logoFilePathEnv = process.env.EMAIL_LOGO_PATH; // optional explicit path
    const candidatePaths = [
      logoFilePathEnv,
      path.resolve(__dirname, '../../client/public/certif_logo.png'),
      path.resolve(__dirname, '../../client/public/logo_orange_certif.png')
    ].filter(Boolean);
    let logoBuffer = null;
    let logoFilename = 'logo.png';
    for (const p of candidatePaths) {
      try {
        if (fs.existsSync(p)) {
          logoBuffer = fs.readFileSync(p);
          logoFilename = path.basename(p);
          break;
        }
      } catch { /* ignore */ }
    }
    const hasLogo = !!logoBuffer;
    const logoCid = 'odc_certif_logo';
    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: user.email,
      subject: 'Réinitialisation de votre mot de passe',
      attachments: hasLogo ? [{ filename: logoFilename, content: logoBuffer, cid: logoCid }] : undefined,
      html: `<!DOCTYPE html>
<html lang="fr"><head><meta charSet="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Réinitialisez votre mot de passe</title></head>
<body style="margin:0;padding:0;background:#f8f8f8;font-family:Arial,Helvetica,sans-serif;color:#111;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f8f8f8;">
    <tr><td align="center">
      <table role="presentation" width="650" cellspacing="0" cellpadding="0" border="0" style="background:#fff;border:1px solid #000000;border-bottom:0;">
        <tr>
          <td style="padding:34px 64px 8px 64px;">
            <div style="font-size:0;line-height:0;">
              <img src="${hasLogo ? 'cid:' + logoCid : (process.env.EMAIL_LOGO_URL || '')}" alt="ODC Certif" style="height:48px;display:block;${hasLogo || process.env.EMAIL_LOGO_URL ? '' : 'display:none;'}" />
            </div>
            <h1 style="margin:24px 0 32px 0;font-size:32px;line-height:1.2;font-weight:700;">Réinitialisez votre mot de passe.</h1>
            <p style="margin:0 0 16px 0;font-size:14px;">Bonjour <strong>${user.name || 'Utilisateur'}</strong>!</p>
            <p style="margin:0 0 12px 0;font-size:14px;">Vous avez demandé à réinitialiser votre mot de passe.<br/>Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe</p>
            <p style="margin:16px 0 18px 0;font-size:13px;font-weight:600;">Ce lien est valide pendant <strong>15 minutes</strong></p>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:32px 0 8px 0;">
              <tr>
                <td bgcolor="${brandColor}" style="border-radius:2px;">
                  <a href="${resetUrl}" style="display:inline-block;padding:12px 16px;font-size:14px;color:#fff;text-decoration:none;font-weight:500;background:${brandColor};">Réinitialisez votre mot de passe</a>
                </td>
              </tr>
            </table>
            <p style="margin:24px 0 0 0;font-size:11px;color:#555;line-height:1.4;">Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e‑mail.</p>
            <p style="margin:32px 0 0 0;font-size:14px;">Merci,<br/>Équipe Orange Digital Center</p>
          </td>
        </tr>
      </table>
      <table role="presentation" width="650" cellspacing="0" cellpadding="0" border="0" style="background:${brandColor};">
        <tr>
          <td style="padding:16px 64px;text-align:center;color:#fff;font-size:11px;">© ${(new Date()).getFullYear()} Orange Digital Center</td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>`
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
    if (!token) {
      console.error('Reset password error: No token provided.');
      return res.status(400).json({ message: 'No reset token provided.' });
    }

    if (!password || password.length < 6) {
      console.error('Reset password error: Password missing or too short.', { password });
      return res.status(400).json({ message: 'Password is required and must be at least 6 characters.' });
    }

  const user = await User.findOne({ resetPasswordToken: token }).select('+password');
    if (!user) {
      console.error('Reset password error: No user found for token.', { token });
      return res.status(400).json({ message: 'Invalid reset token.' });
    }

    if (!user.resetPasswordExpire || user.resetPasswordExpire < Date.now()) {
      console.error('Reset password error: Token expired.', { token, expire: user.resetPasswordExpire });
      return res.status(400).json({ message: 'Reset token has expired.' });
    }

    // Optional: Prevent using the same password as before
    const isSame = await bcrypt.compare(password, user.password);
    if (isSame) {
      console.error('Reset password error: New password is the same as the old password.');
      return res.status(400).json({ message: 'New password must be different from the old password.' });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    console.log('Password reset successful for user:', user.email);

    // Fire-and-forget confirmation email
    (async () => {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: process.env.EMAIL_USERNAME, pass: process.env.EMAIL_PASSWORD }
        });
        const logoInfo = loadEmailLogo();
        const html = buildSimpleBrandedEmail({
          title: 'Votre mot de passe a été modifié.',
          userName: user.name,
          paragraphs: [
            "Cet email confirme que vous avez modifié avec succès le mot de passe de votre compte ODC Certif. Aucune autre action n'est requise.",
            "Veuillez nous contacter si vous n'êtes pas à l'origine de cette modification."
          ]
        });
        const mailOptions = {
          from: process.env.EMAIL_USERNAME,
          to: user.email,
          subject: 'Confirmation de modification du mot de passe',
          html,
          attachments: logoInfo.buffer ? [{ filename: logoInfo.filename, content: logoInfo.buffer, cid: logoInfo.cid }] : undefined
        };
        await transporter.sendMail(mailOptions);
      } catch (e) { console.error('Failed to send password reset confirmation email', e); }
    })();

    res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error('Reset password error:', error, { token, password });
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

    // Fire-and-forget confirmation email
    (async () => {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: process.env.EMAIL_USERNAME, pass: process.env.EMAIL_PASSWORD }
        });
        const logoInfo = loadEmailLogo();
        const html = buildSimpleBrandedEmail({
          title: 'Votre mot de passe a été modifié.',
          userName: user.name,
          paragraphs: [
            "Cet email confirme que vous avez modifié avec succès le mot de passe de votre compte ODC Certif. Aucune autre action n'est requise.",
            "Veuillez nous contacter si vous n'êtes pas à l'origine de cette modification."
          ]
        });
        const mailOptions = {
          from: process.env.EMAIL_USERNAME,
          to: user.email,
          subject: 'Confirmation de modification du mot de passe',
          html,
          attachments: logoInfo.buffer ? [{ filename: logoInfo.filename, content: logoInfo.buffer, cid: logoInfo.cid }] : undefined
        };
        await transporter.sendMail(mailOptions);
      } catch (e) { console.error('Failed to send change password confirmation email', e); }
    })();

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
  try {
    const userId = req.params.id;
    // Load as base model; discriminators share collection so this finds any role
  // Need password when recreating doc across discriminator boundary; select('+password')
  let existing = await User.findById(userId).select('+password');
    if (!existing) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentRole = existing.role;
    const newRole = req.body.role ?? currentRole;
    const existingHashedPassword = existing.password; // keep hashed password for doc recreation
    const changingToRep = newRole === 'university_representative' && currentRole !== 'university_representative';
    const changingFromRep = currentRole === 'university_representative' && newRole !== 'university_representative';

    // Validation when becoming representative
    if (changingToRep && !req.body.university) {
      return res.status(400).json({ message: 'university is required when changing role to university_representative' });
    }

    // We'll replace the document only if switching discriminator type, else modify in place
    let workingDoc = existing;

    if (changingToRep) {
      // Delete old doc then recreate as discriminator to avoid mixed schema validation issues
      await User.findByIdAndDelete(userId);
      workingDoc = new UniversityRepresentative({
        _id: userId,
        name: req.body.name ?? existing.name,
        email: req.body.email ?? existing.email,
        phone_number: req.body.phone_number ?? existing.phone_number,
        role: 'university_representative',
        university: req.body.university,
        password: existingHashedPassword
      });
    } else if (changingFromRep) {
      // Remove old discriminator doc then recreate as plain user
      await User.findByIdAndDelete(userId);
      workingDoc = new User({
        _id: userId,
        name: req.body.name ?? existing.name,
        email: req.body.email ?? existing.email,
        phone_number: req.body.phone_number ?? existing.phone_number,
        role: newRole,
        password: existingHashedPassword
      });
    } else {
      // In-place updates
      if (req.body.university !== undefined && newRole === 'university_representative') {
        workingDoc.university = req.body.university; // only meaningful for reps
      }
      if (newRole) workingDoc.role = newRole; // allow role rename among non-rep roles
      if (req.body.name !== undefined) workingDoc.name = req.body.name;
      if (req.body.email !== undefined) workingDoc.email = req.body.email;
      if (req.body.phone_number !== undefined) workingDoc.phone_number = req.body.phone_number;
    }

    try {
      const saved = await workingDoc.save();
      return res.json({
        id: saved._id,
        name: saved.name,
        email: saved.email,
        phone_number: saved.phone_number,
        role: saved.role,
        university: saved.university || undefined
      });
    } catch (saveErr) {
      // Provide more diagnostic info client-side (safe subset)
      return res.status(500).json({ message: 'Failed to save user update', error: saveErr.message });
    }
  } catch (error) {
    console.error('updateUser unexpected error', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin: Delete user
const deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user' });
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
  getEmailByResetToken,
  getUserStats,
  disableUser
}
