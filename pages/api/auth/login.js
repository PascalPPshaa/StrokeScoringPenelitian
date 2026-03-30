import { query } from '../../../lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Missing credentials' });
  }

  try {
    const users = await query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    if (!user.password_hash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { sub: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.setHeader(
      'Set-Cookie',
      `token=${token}; HttpOnly; Path=/; Max-Age=3600`
    );

    return res.status(200).json({ message: 'Logged in' });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// import { query } from '../../../lib/db';
// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
// import cookie from 'cookie';

// export default async function handler(req, res) {
//   if (req.method !== 'POST') {
//     res.setHeader('Allow', ['POST']);
//     return res.status(405).end(`Method ${req.method} Not Allowed`);
//   }

//   const { username, password } = req.body;

//   const result = await query('SELECT * FROM users WHERE username = ?', [username]);
//   if (result.length === 0) {
//     return res.status(401).json({ error: 'Invalid username or password' });
//   }

//   const user = result[0];

//   const isMatch = await bcrypt.compare(password, user.password);
//   if (!isMatch) {
//     return res.status(401).json({ error: 'Invalid username or password' });
//   }

//   // buat token
//   const token = jwt.sign(
//     { id: user.id, username: user.username },
//     process.env.JWT_SECRET,
//     { expiresIn: '1d' }
//   );

//   // simpan token ke cookie
//   res.setHeader(
//     'Set-Cookie',
//     cookie.serialize('token', token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'strict',
//       path: '/',
//       maxAge: 86400,
//     })
//   );

//   return res.status(200).json({ message: 'Login successful' });
// }
