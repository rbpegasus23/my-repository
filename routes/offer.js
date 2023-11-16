const express = require("express");
const User = require("../models/User");
const Offer = require("../models/Offer");
const jwt = require("jsonwebtoken");
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

const isAuthenticated = async (req, res, next) => {
  const authUser = req.headers.authorization;
  const token = authUser.split(" ")[1];
  // const userSearched = await User.findOne({ token: token });
  jwt.verify(token, process.env.SECRET_ACCESS, (err, user) => {
    if (err) {
      return res.json({ message: "Unauthorized request" });
    }
    req.user = user;
    next();
  });

  // if (!userSearched) {
  //   return res.json({ message: "Please log in again" });
  // }
  // next();
};

router.post(
  "/offer/publish",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      const {
        title,
        price,
        description,
        marque,
        taille,
        color,
        etat,
        emplacement,
        userId,
      } = req.body;
      const { picture } = req.files;

      if (description.length > 500 || title.length > 50 || price > 100000) {
        return res.json({ message: "Thanks to verify entries" });
      }

      const result = await cloudinary.uploader.upload(convertToBase64(picture));
      const offer = new Offer({
        product_name: title,
        product_description: description,
        product_price: price,
        product_details: [
          {
            MARQUE: marque,
          },
          {
            TAILLE: taille,
          },
          {
            ÉTAT: etat,
          },
          {
            COULEUR: color,
          },
          {
            EMPLACEMENT: emplacement,
          },
        ],
        product_image: { secure_url: result.secure_url },
        owner: userId,
      });

      await offer.save();
      const offerSearched = await Offer.findOne({ _id: offer._id }).populate(
        "owner"
      );
      res.json(offerSearched);
    } catch (error) {
      console.log(error);
      res.json({ message: "Cannot publish your offer" });
    }
  }
);

module.exports = router;
