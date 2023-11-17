const express = require("express");
const User = require("../models/User");
const SHA256 = require("crypto-js/sha256");
const uid2 = require("uid2");
const encBase64 = require("crypto-js/enc-base64");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const fileUpload = require("express-fileupload");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const convertToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};

router.post("/signup", fileUpload(), async (req, res) => {
  const { username, email, password, newsletter } = req.body;
  const { picture } = req.files;

  try {
    const salt = uid2(26);
    const hash = SHA256(password + salt).toString(encBase64);
    const token = uid2(16);
    const userSearched = await User.findOne({ email: email });
    const result = await cloudinary.uploader.upload(convertToBase64(picture));
    const secureUrl = result.secure_url;
    if (!username) {
      return res.json({ message: "Username is required!" });
    } else if (!userSearched) {
      const user = new User({
        email: email,
        account: {
          username: username,
          avatar: { secure_url: secureUrl },
        },
        newsletter: newsletter,
        token: token,
        hash: hash,
        salt: salt,
      });
      await user.save();
      console.log(user);
      return res.json(user);
    } else {
      return res.json({ message: "User already exist!" });
    }
  } catch (error) {
    res.json({ message: "User cannot be created" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const userSearched = await User.findOne({ email: email });
    const hash = SHA256(password + userSearched.salt).toString(encBase64);

    if (hash === userSearched.hash) {
      const userAuthorized = { name: email };
      const accessToken = jwt.sign(userAuthorized, process.env.SECRET_ACCESS);
      userSearched.token = accessToken;
      await userSearched.save();
      return res.json(userSearched);
    } else {
      return res.json({ message: "Password unknown" });
    }
  } catch (error) {
    console.log(error);
    res.json({
      message: "We cannot verifiy your password, please retry later",
    });
  }
});

module.exports = router;
