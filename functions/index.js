const functions = require("firebase-functions");
const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

app.post("/regis", async (req, res) => {
  const { uid, displayName } = req.body;
  if (!uid || !displayName) {
    console.log("params ga lengkap");
    return res.status(400).json({ pesan: "Params ga lengkap" });
  }
  return await db
    .collection("Users")
    .doc(uid)
    .set({
      displayName: displayName,
      ListResep: [],
      listCookLater: [],
      uid: uid,
    })
    .then(() => {
      return res.json({ pesan: "berhasil membuat data" });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ pesan: "gagal" });
    });
});

app.get("/coba", (req, res) => {
  return res.json({ pesan: "ini get" });
});
app.post("/coba", (req, res) => {
  return res.json({ pesan: "ini post" });
});
exports.api = functions.region("asia-southeast2").https.onRequest(app);
