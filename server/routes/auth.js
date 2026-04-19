const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const supabase = require('../config/supabaseClient');

// Sync User from Firebase to Supabase
router.post('/sync', auth, async (req, res) => {
  try {
    const { uid, email, name } = req.user; // From Firebase token verified by middleware
    const userName = name || email.split('@')[0];

    // Upsert user into Supabase
    // On conflict with firebase_uid, update name and email
    const { data: user, error } = await supabase
      .from('users')
      .upsert(
        { 
          firebase_uid: uid, 
          email: email, 
          name: userName 
        }, 
        { onConflict: 'firebase_uid' }
      )
      .select()
      .single();

    if (error) throw error;

    console.log('User synced to Supabase:', email);
    res.json({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    console.error('Sync error:', err);
    res.status(500).json({ message: 'Sync failed: ' + err.message });
  }
});

module.exports = router;
