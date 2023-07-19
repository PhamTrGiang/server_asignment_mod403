const express = require("express");

const router = express.Router();
const mongoose = require("mongoose");
const uri =
  "mongodb://127.0.0.1:27017/assignment";


const productModel = require("../model/productModel");

const bodyParser = require("body-parser");

const path = require('path');
const multer = require("multer");
const { response } = require("../server");

const storageEngine = multer.diskStorage({
    destination: "./images",
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}--${file.originalname}`);
    },
  });

const upload = multer({
    storage: storageEngine,
    limits: { fileSize: 10000000 },
    fileFilter: (req, file, cb) => {
      checkFileType(file, cb);
    },
  });
  
  const checkFileType = function (file, cb) {
    //Allowed file extensions
    const fileTypes = /jpeg|jpg|png|gif|svg/; //check extension names
  
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
  
    const mimeType = fileTypes.test(file.mimetype);
  
    if (mimeType && extName) {
      return cb(null, true);
    } else {
      cb("Error: You can Only Upload Images!!");
    }
  };

// // parse requests of content-type - application/json
router.use(bodyParser.json());

const parser = bodyParser.urlencoded({ extended: true });

router.use(parser);

router.get("/", async function (req, res) {
  await mongoose.connect(uri);
  var arr = await productModel.find().lean();
  return res.json(arr);
});

router.post("/add", async (req, res) => {
    await mongoose.connect(uri);
  
    var newItem = {
      name: req.body.name,
      price: req.body.price,
      quantity: req.body.quantity,
      type: req.body.type,
      image: req.body.image,
    };
    var arr = await productModel.insertMany(newItem);
    return res.json(arr);
});

router.get("/delete/:id", async (req, res) => {
    await mongoose.connect(uri);
    var arr = await productModel.deleteOne({ _id: req.params.id });
    return res.json(arr);
});

router.post("/update/:id", async (req, res) => {
    await mongoose.connect(uri);
    var newItem = {
        name: req.body.name,
        price: req.body.price,
        quantity: req.body.quantity,
        type: req.body.type,
        image: req.body.image,
      };
    var arr = await productModel.updateOne({ _id: req.params.id }, newItem);
    return res.json(arr);
  });

module.exports = router;
