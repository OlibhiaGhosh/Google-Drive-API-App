const express = require("express");
const { google } = require("googleapis");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

dotenv.config();

const app = express();

const port = process.env.PORT || 8000;

app.get("/", (req, res) => {
  res.send("Hello World");
});

scopes = ["https://www.googleapis.com/auth/drive"];

// OAuth 2 configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URL
);
app.get("/auth", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
  });
  res.redirect(url);
});
app.get("/auth/redirect", async (req, res) => {
  try {
    const { tokens } = await oauth2Client.getToken(req.query.code);
    oauth2Client.setCredentials(tokens);
    res.send("Authentication successful! Please return to the console.");
    console.log(tokens);
  } catch (error) {
    console.log("error");
  }
});

const drive = google.drive({
  version: "v3",
  auth: oauth2Client,
});

const filepath = path.join(__dirname, "pic.png");

async function uploadfile() {
  try {
    const response = await drive.files.create({
      requestBody: {
        name: "pic.png",
        mimeType: "image/png",
      },
      media: {
        mimeType: "image/png",
        body: fs.createReadStream(filepath),
      },
    });
    console.log(response.data);
  } catch (err) {
    console.log(err);
  }
}

app.get("/upload", (req, res) => {
  uploadfile();
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
