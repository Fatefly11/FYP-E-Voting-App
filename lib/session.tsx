import { withIronSession } from 'next-iron-session';

const sessionConfig = {
    password: 'vR3KmN1oXsLgWpZuT9QeA8jH6YbEcF7D',
    cookieName: 'chocolate-chip',
    cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
        },
};

export const withSession = (handler) => withIronSession(handler, sessionConfig);
