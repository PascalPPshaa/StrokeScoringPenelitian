import * as cookie from 'cookie'; 

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    res.setHeader('Set-Cookie', cookie.serialize('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        maxAge: -1,
        expires: new Date(0),
        path: '/', 
        sameSite: 'strict', 
    }));

    return res.status(200).json({ success: true, message: 'Logout berhasil.' });
}