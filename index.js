require('dotenv').config();
const express = require("express");
const { Pool } = require('pg');
const multer = require("multer");
const bodyParser = require("body-parser");

const app = express();
const upload = multer();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 2
});

app.get("/", (req, res) => {
  const sql = "SELECT * FROM PRODUCT ORDER BY PROD_ID";
  pool.query(sql, [], (err, result) => {
    let message = "";
    let model = {};
    if (err) {
      message = `Error - ${err.message}`;
    } else {
      message = "success";
      model = result.rows;
    }
    res.render("index", { message: message, model: model });
  });
});

app.get("/input", (req, res) => {
  res.render("input");
});

app.post("/input", (req, res) => {
  const sql = "INSERT INTO PRODUCT(prod_id, prod_name, prod_desc, prod_price) VALUES ($1, $2, $3, $4)";
  const product = [req.body.prod_id, req.body.prod_name, req.body.prod_desc, req.body.prod_price];

  pool.query(sql, product, (err, result) => {
    if (err) {
      return res.send(err.message);
    }
    res.redirect("/");
  });
});

app.get("/output", (req, res) => {
  let message = "";
  res.render("output", { message: message });
});

app.post("/output", (req, res) => {
  const sql = "SELECT * FROM PRODUCT ORDER BY PROD_ID";
  pool.query(sql, [], (err, result) => {
    if (err) {
      let message = `Error - ${err.message}`;
      res.render("output", { message: message });
    } else {
      let output = "";
      result.rows.forEach(product => {
        output += `${product.prod_id},${product.prod_name},${product.prod_desc},${product.prod_price}\r\n`;
      });
      res.header("Content-Type", "text/csv");
      res.attachment("export.csv");
      return res.send(output);
    }
  });
});

app.get("/manage", (req, res) => {
  const sql = "SELECT * FROM PRODUCT ORDER BY PROD_ID";
  pool.query(sql, [], (err, result) => {
    let message = "";
    let model = {};
    if (err) {
      message = `Error - ${err.message}`;
    } else {
      message = "success";
      model = result.rows;
    }
    res.render("manage", { message: message, model: model });
  });
});

app.get("/add", (req, res) => {
  res.render("editor", { model: {} });
});

app.post("/add", (req, res) => {
  const sql = "INSERT INTO PRODUCT(prod_name, prod_desc, prod_price) VALUES ($1, $2, $3)";
  const product = [req.body.prod_name, req.body.prod_desc, req.body.prod_price];

  pool.query(sql, product, (err, result) => {
    if (err) {
      return res.send(err.message);
    }
    res.redirect("/manage");
  });
});

app.get("/edit/:id", (req, res) => {
  const sql = "SELECT * FROM PRODUCT WHERE PROD_ID = $1";
  const id = [req.params.id];

  pool.query(sql, id, (err, result) => {
    if (err) {
      return res.send(err.message);
    }
    res.render("editor", { model: result.rows[0] });
  });
});

app.post("/edit/:id", (req, res) => {
  const sql = "UPDATE PRODUCT SET prod_name = $1, prod_desc = $2, prod_price = $3 WHERE PROD_ID = $4";
  const product = [req.body.prod_name, req.body.prod_desc, req.body.prod_price, req.params.id];

  pool.query(sql, product, (err, result) => {
    if (err) {
      return res.send(err.message);
    }
    res.redirect("/manage");
  });
});

app.post("/delete/:id", (req, res) => {
  const sql = "DELETE FROM PRODUCT WHERE PROD_ID = $1";
  const id = req.params.id;

  pool.query(sql, [id], (err, result) => {
    if (err) {
      console.log(`Delete Error. Error message: ${err.message}`);
    }
    res.redirect("/");
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started (http://localhost:3000/) !");
});