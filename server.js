require('dotenv').config()
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./User");
const cookieParser = require("cookie-parser");
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const app = express();
let otpStorage = {}; 

app.use(cors({ origin: ["http://localhost:3000" , "http://localhost:3001"], credentials: true }));
app.use(express.json());
app.use(cookieParser()); 
app.use(bodyParser.json());


// MongoDB Connection
mongoose
    .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.error("MongoDB Connection Error: ", err.message));


// api page register
app.post("/api/auth/register", async (req, res) => {
    try {
        const { username, firstname, lastname, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password + "1234", 10);

        const newUser = await User.create({
            username,
            firstname,
            lastname,
            email,
            password: hashedPassword,
        });

        console.log("Registration Successfully: ");
        console.log(username, firstname, lastname, email, password);

        return res.status(201).json({ message: "User registered successfully", user: newUser });
    } catch (error) {
        console.error("Registration Error: ", error.message);
        return res.status(500).json({ message: "Error registering user" });
    }
});


app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            const errorMessage = "Email and Password are required";
            console.log(errorMessage);  
            return res.status(400).json({ message: errorMessage });
        }

        const user = await User.findOne({ email });
        if (!user) {
            const errorMessage = "Email not found";
            console.log(errorMessage);  
            return res.status(404).json({ message: errorMessage });
        }

        const validPassword = await bcrypt.compare(password + "1234" , user.password);
        if (!validPassword) {
            const errorMessage = "Incorrect Password";
            console.log(errorMessage);  
            return res.status(400).json({ message: errorMessage });
        }

        // const tokenData = { id: user._id, email: user.email };
        // const token = jwt.sign(tokenData, process.env.JWT_SECRETKEY, { expiresIn: "1m" });

        // res.cookie("token", token, { httpOnly: true });
        // console.log('Toekn name :', token);

        const successMessage = "Login successful";
        console.log(successMessage);  
        return res.status(200).json({ message: successMessage});
    } catch (error) {
        console.error("Login Error: ", error.message);  
        return res.status(500).json({ message: "Error logging in" });
    }
});


app.post("/api/auth/checkuser", async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email }).select("_id");

        return res.status(200).json({ user });
    } catch (error) {
        console.error("Check User Error: ", error.message);
        return res.status(500).json({ message: "Error checking user" });
    }
});

app.post("/api/user/userupdate", async (req, res) => {
  try {
    const { id, password, currentPassword } = req.body;
    console.log(id, password, currentPassword);


    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

      const isPasswordCorrect = await bcrypt.compare(currentPassword + "1234", user.password);
      if (!isPasswordCorrect) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }
    
    if (password) {

      const hashedPassword = await bcrypt.hash(password + "1234", 10);
      user.password = hashedPassword;
    }

    await user.save();
    res.status(200).json({ message: 'User updated successfully', user });

  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: 'Error updating user', error });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching users' });
  }
});


app.delete('/api/deleteusers/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    console.log(userId);
    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting user' });
  }
});

const sendEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent successfully to ${email}`);
  } catch (error) {
    console.error('Error sending email:', error); 
  }
};

app.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).send('Email is required.');

  const otp = Math.floor(100000 + Math.random() * 900000); // สร้าง OTP 6 หลัก
  otpStorage[email] = otp;

  try {
    await sendEmail(email, otp);
    res.status(200).json('OTP sent successfully.');
  } catch (error) {
    console.error('Error in send-otp endpoint:', error);
    res.status(500).json('Error sending OTP.');
  }
});



app.post('/verify-otp', async (req, res) => {
  const { email, otp, password } = req.body;

  try {

    if (!email || !otp || !password) {
      return res.status(400).json({ message: "Email, OTP, and Password are required." });
    }

    // ตรวจสอบ OTP
    if (otpStorage[email] && otpStorage[email] == otp) {
      delete otpStorage[email]; 
      let user = await User.findOne({ email });

      const tokenData = { id: user._id, email: user.email };
      const token = jwt.sign(tokenData, process.env.JWT_SECRETKEY, { expiresIn: "2m" });

      res.cookie("token", token, { httpOnly: true });
      
      return res.status(200).json({ message: "OTP verified successfully.", token });
    } else {

      return res.status(400).json({ message: "Invalid OTP." });
    }
  } catch (error) {
    console.error("Error verifying OTP: ", error);
    return res.status(500).json({ message: "Error verifying OTP." });
  }
});



// Start Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

