// Imports des packages :
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config(); // Pour pouvoir utiliser un ficher .env et récupérer les variables dessus.

const app = express();
app.use(express.json());

mongoose.connect(
  `mongodb+srv://${process.env.MONGOOSE_USR}:${process.env.MONGOOSE_PWD}@cluster0.fo874zg.mongodb.net/`
);

const userRoute = require("./routes/user");
const offerRoute = require("./routes/offer");

app.use(userRoute);
app.use(offerRoute);

app.all("*", async (req, res) => {
  res.json({ message: "Cette page n'existe pas" });
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Serveur started`);
});
