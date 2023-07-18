const express = require("express");

const router = express.Router();
const mongoose = require("mongoose");
const uri =
  "mongodb+srv://giang:huNAGXZenvebYdgi@cluster0.r13gxca.mongodb.net/cp17301?retryWrites=true&w=majority";


const productModel = require("../model/productModel");

const bodyParser = require("body-parser");

// // parse requests of content-type - application/json
router.use(bodyParser.json());

const parser = bodyParser.urlencoded({ extended: true });

router.use(parser);

router.get("/", async function (req, res) {
  await mongoose.connect(uri);
  var arr = await productModel.find().lean();
  res.json(arr);
});

module.exports = router;
