// Imports des packages :
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config(); // Pour pouvoir utiliser un ficher .env et récupérer les variables dessus.

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGOOSE_URL);

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
