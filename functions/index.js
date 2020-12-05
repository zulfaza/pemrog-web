const functions = require("firebase-functions");
const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();
const algoliasearch = require("algoliasearch");

const APP_ID = "VC8WCMFUPU";
const ADMIN_KEY = "992f28c233e01c9e8c8c0a7c3b5d2056";

const client = algoliasearch(APP_ID, ADMIN_KEY);
const index = client.initIndex("resep");

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
      bio: "",
    })
    .then(() => {
      return res.json({ pesan: "berhasil membuat data" });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ pesan: "gagal" });
    });
});

app.get("/coba", async (req, res) => {
  return db
    .collection("resep")
    .get()
    .then((result) => {
      let arr = [];
      result.docs.forEach((doc) => {
        const data = doc.data();
        const objectID = doc.id;
        arr.push({
          bahan: data.bahan,
          cookLaterCount: data.cookLaterCount,
          jmlBahan: data.jmlBahan,
          judul: data.judul,
          pembuatResep: data.pembuatResep,
          thumbnail: data.thumbnail,
          timestamp: data.timestamp,
          objectID,
        });
      });
      return index
        .saveObjects(arr)
        .then(({ objectIDs }) => {
          console.log(objectIDs);
          return res.json(objectIDs);
        })
        .catch((err) => {
          return res.status(500).json(err);
        });
    });
});
app.post("/coba", (req, res) => {
  return res.json({ pesan: "ini post" });
});
exports.api = functions.region("asia-southeast2").https.onRequest(app);

exports.addToIndex = functions
  .region("asia-southeast2")
  .firestore.document("resep/{resepId}")
  .onCreate((snapshot) => {
    const data = snapshot.data();
    const objectID = snapshot.id;
    return index
      .saveObject({
        bahan: data.bahan,
        cookLaterCount: data.cookLaterCount,
        jmlBahan: data.jmlBahan,
        judul: data.judul,
        pembuatResep: data.pembuatResep,
        thumbnail: data.thumbnail,
        timestamp: data.timestamp,
        objectID,
      })
      .catch((err) => {
        console.log(err);
      });
  });

exports.updateIndex = functions
  .region("asia-southeast2")
  .firestore.document("resep/{resepId}")
  .onUpdate((change) => {
    const newData = change.after.data();
    const objectID = change.after.id;
    return index
      .saveObject({
        bahan: newData.bahan,
        cookLaterCount: newData.cookLaterCount,
        jmlBahan: newData.jmlBahan,
        judul: newData.judul,
        pembuatResep: newData.pembuatResep,
        thumbnail: newData.thumbnail,
        timestamp: newData.timestamp,
        objectID,
      })
      .catch((err) => {
        console.log(err);
      });
  });

exports.deleteFromIndex = functions
  .region("asia-southeast2")
  .firestore.document("resep/{resepId}")
  .onDelete((snapshot) => {
    return index.deleteObject(snapshot.id).catch((err) => {
      console.log(err);
    });
  });
