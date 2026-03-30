// import jwt from 'jsonwebtoken';
// import cookie from 'cookie';

// export default async function handler(req, res) {
//   const cookies = cookie.parse(req.headers.cookie || '');
//   const token = cookies.token;

//   if (!token) {
//     return res.status(401).json({ loggedIn: false });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     return res.status(200).json({ loggedIn: true, user: decoded });
//   } catch (err) {
//     return res.status(401).json({ loggedIn: false });
//   }
// }

import jwt from 'jsonwebtoken';
import * as cookie from 'cookie'; 

export default async function handler(req, res) {
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.token;

  if (!token) {
    return res.status(401).json({ loggedIn: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json({ loggedIn: true, user: decoded });
  } catch (err) {
    return res.status(401).json({ loggedIn: false });
  }
}