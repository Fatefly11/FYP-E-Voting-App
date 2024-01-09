import { withSession } from '../../lib/session';

const handler = async (req, res) => {
    await req.session.destroy();
    res.status(200).json({ success: true });
  }

export default withSession(handler);