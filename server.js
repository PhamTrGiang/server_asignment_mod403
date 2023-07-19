const express = require('express')
const expressHbs = require('express-handlebars');
const path = require('path');
const multer = require("multer");
const app = express()
const port = 3000

const mongoose = require("mongoose");

const uri =
  "mongodb://127.0.0.1:27017/assignment";

const accountModel = require("./model/accountModel");
const productModel = require("./model/productModel");

const apiRouter = require("./router/api");
app.use("/api", apiRouter);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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

app.engine(
  "hbs",
  expressHbs.engine({
    extname: ".hbs",
  })
);

app.set("view engine", "hbs");
app.set("views", "./views");
app.set("views", path.join(__dirname, "views"));

app.get("/info", async (req, res) => {
  await mongoose.connect(uri);
  var account = await accountModel.findOne({ _id: userId }).lean();
  res.render("info", { layout: "change" ,account:account});
});
app.post("/info", (req, res) => {
  res.redirect("/info");
});

app.get("/", (req, res) => {
  isAdmin = false;
  userId = "";
  res.render("login", { layout: "welcome" });
});

function checkAccount(array, email) {
  for (var i = 0; i < array.length; i++) {
    if (array[i].email == email) {
      return i;
    }
  }
}

app.post("/", async (req, res) => {
  await mongoose.connect(uri);
  var arr = await accountModel.find().lean();
  console.log(arr);
  var email = req.body.email;
  var password = req.body.password;
  var error;
  var i = checkAccount(arr, email);

  if (email != arr[i].email || password != arr[i].password) {
    error = "Email or password incorrect";
    return res.render("login", { layout: "welcome", error });
  }
  isAdmin = arr[i].status;
  userId = arr[i]._id;
  return res.redirect("/user");
});

app.get("/register", (req, res) => {
  res.render("register", { layout: "welcome" });
});

app.post("/register", upload.single("image"), async (req, res) => {
  await mongoose.connect(uri);
  var arr = await accountModel.find().lean();
  var fullname = req.body.fullname;
  var email = req.body.email;
  var password = req.body.password;
  var error;
  var i = checkAccount(arr, email);
  if (i != null) {
    error = "Account already exists";
    return res.render("register", { layout: "welcome", error });
  }
  if (!req.file) {
    error = "Account already exists";
    return res.render("register", { layout: "welcome", error });
  }
  const newAccount = {
    name: fullname,
    email: email,
    password: password,
    image: req.file.path,
  };
  await accountModel.insertMany(newAccount);
  return res.redirect("/user");
});

app.get("/user", async (req, res) => {
  await mongoose.connect(uri);
  var arr = await accountModel.find().lean();
  var account = await accountModel.findOne({ _id: userId }).lean();
  console.log(account);
  res.render("index", { arr: arr, admin: isAdmin, account: account });
});

app.get("/user/add", async (req, res) => {
  res.render("addUser", { layout: "change", title: "Add" });
});

app.post("/user/add", upload.single("image"), async (req, res) => {
  await mongoose.connect(uri);
  var arr = await accountModel.find().lean();
  var name = req.body.name;
  var email = req.body.email;
  var password = req.body.password;
  var error;

  var i = checkAccount(arr, email);
  var status = false;
  if (req.body.admin == "on") {
    var status = true;
  }
  if (!req.file) {
    error = "Please enter image";
    return res.render("addUser", {
      layout: "change",
      error: error,
      title: "Add",
    });
  }
  if (i != null) {
    error = "Account already exists";
    return res.render("addUser", {
      layout: "change",
      error: error,
      title: "Add",
    });
  }
  console.log(req.body.admin);
  const newAccount = {
    name: name,
    email: email,
    password: password,
    image: req.file.path,
    status: status,
  };
  await accountModel.insertMany(newAccount);
  return res.redirect("/user");
});

app.get("/user/delete/:id", async (req, res) => {
  await mongoose.connect(uri);
  var arr = await accountModel.deleteOne({ _id: req.params.id });
  return res.redirect("back");
});

app.get("/user/update/:id", async (req, res) => {
  await mongoose.connect(uri);
  var account = await accountModel.findOne({ _id: req.params.id }).lean();
  return res.render("addUser", {
    layout: "change",
    title: "Edit",
    account: account,
  });
});

app.post("/user/update/:id", upload.single("image"), async (req, res) => {
  await mongoose.connect(uri);
  var status = false;
  if (req.body.admin == "on") {
    var status = true;
  }
  const newAccount = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    status: status,
  };
  if (req.file) {
    var arr = await accountModel.updateOne(
      { _id: req.params.id },
      { image: req.file.path }
    );
  }
  var arr = await accountModel.updateOne({ _id: req.params.id }, newAccount);

  return res.redirect("/user");
});

app.get("/product", async (req, res) => {
  await mongoose.connect(uri);
  var arr = await productModel.find().lean();
  var account = await accountModel.findOne({ _id: userId }).lean();
  res.render("product", { arr: arr, account: account });
});

app.get("/product/add", async (req, res) => {
  res.render("addProduct", { layout: "change", title: "Add" });
});

app.post("/product/add", upload.single("image"), async (req, res) => {
  await mongoose.connect(uri);
  if (!req.file) {
    error = "Please enter image";
    return res.render("addProduct", {
      layout: "change",
      error: error,
      title: "Add",
    });
  }

  var newItem = {
    name: req.body.name,
    price: req.body.price,
    quantity: req.body.quantity,
    type: req.body.type,
    image: req.file.path,
  };
  await productModel.insertMany(newItem);
  res.redirect("/product");
});

app.get("/product/delete/:id", async (req, res) => {
  await mongoose.connect(uri);
  var arr = await productModel.deleteOne({ _id: req.params.id });
  return res.redirect("back");
});

app.get("/product/update/:id", async (req, res) => {
  await mongoose.connect(uri);
  var item = await productModel.findOne({ _id: req.params.id }).lean();
  return res.render("addProduct", {
    layout: "change",
    title: "Edit",
    item: item,
  });
});

app.post("/product/update/:id", upload.single("image"), async (req, res) => {
  await mongoose.connect(uri);
  if (req.file) {
    await productModel.updateOne(
      { _id: req.params.id },
      { image: req.file.path }
    );
  }
  await productModel.updateOne({ _id: req.params.id }, req.body);
  return res.redirect("/product");
});

app.get("/productType", (req, res) => {
  res.render("productType");
});

app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname + "../../../")));
app.use(express.static(path.join("node_modules", "bootstrap", "dist")));

module.exports = app;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});