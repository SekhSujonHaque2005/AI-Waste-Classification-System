const admin = require('../config/firebaseAdmin');
const supabase = require('../config/supabaseClient');

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Fetch user from Supabase using firebase_uid
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('firebase_uid', decodedToken.uid)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
       console.error('Supabase user lookup error:', error);
    }

    req.user = decodedToken; // Firebase info (uid, email, name)
    req.dbUser = user;       // Supabase info (id, name, etc.)
    
    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
