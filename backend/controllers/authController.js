const User = require('../models/User');
const jwt = require('jsonwebtoken');

//handle user login
exports.login = async (req, res) => {
    try{
    const { username, password } = req.body;

    if(!username || !password){
        return res.status(400).json({ message: 'Please provide username and password' });
    }
    //find user by username
    const user = await User.findOne({ username });
    if(!user){
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    //verify password
    const isMatch = await new Promise((resolve, reject) => {
        user.comparePassword(password, (err, isMatch) => {
            if (err) reject(err);
            else resolve(isMatch);
        });
    });
    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    //create jwt token
    const token = jwt.sign(
        { id: user._id, username: user.username },
         process.env.JWT_SECRET, 
         { expiresIn: '1h' });
         
         res.json({token, user:{ id: user._id, username: user.username }});
    } catch(error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
   //handle initial user creation (seed) if needed
   exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;
        const exists = await User.findOne({username});
        if(exists){
            return res.status(400).json({ message: 'User already exists' });
        }
        const user = new User({ username, password });
        await user.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};