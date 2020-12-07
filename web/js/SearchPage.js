$(document).scroll(function () {
  $(".navbar").toggleClass(
    "bg-transparant",
    $(this).scrollTop() < $(".navbar").height()
  );
});

document.addEventListener("DOMContentLoaded", function () {
  const db = firebase.firestore();
  const dropdownWrapper = document.getElementById("dropdownWrapper");
  const params = new URLSearchParams(window.location.search);
  const judulResep = params.get("resep");
  const client = algoliasearch(
    "VC8WCMFUPU",
    "71f394aa7d0003076acb0364cbed31c8"
  );
  const index = client.initIndex("resep");

  firebase.auth().onAuthStateChanged(async function (user) {
    let BahanFilter = [];

    function addListener() {
      $(".btn-TambahCookLater").click((e) => {
        const idResep = e.target.dataset.id;
        db.collection("Users")
          .doc(user.uid)
          .update({
            listCookLater: firebase.firestore.FieldValue.arrayUnion(idResep),
          })
          .then(() => {
            console.log("Berhasil disimpan");
            db.collection("resep")
              .doc(idResep)
              .update({
                cookLaterCount: firebase.firestore.FieldValue.increment(1),
              })
              .then(() => {
                console.log("berhasil");
              })
              .catch((err) => {
                console.log(err);
              });
          })
          .catch((err) => {
            console.log(err);
          });
      });
      $(".btn-hapusCookLater").click((e) => {
        const idResep = e.target.dataset.id;
        db.collection("Users")
          .doc(user.uid)
          .update({
            listCookLater: firebase.firestore.FieldValue.arrayRemove(idResep),
          })
          .then(() => {
            console.log("Berhasil disimpan");
            db.collection("resep")
              .doc(idResep)
              .update({
                cookLaterCount: firebase.firestore.FieldValue.increment(-1),
              })
              .then(() => {
                console.log("berhasil");
              })
              .catch((err) => {
                console.log(err);
              });
          })
          .catch((err) => {
            console.log(err);
          });
      });
    }

    function RenderReseps(data, arrCookLaterList, type) {
      let listCard = "";
      data.forEach((doc) => {
        let item = "";
        let id = "";
        if (type === "algolia") {
          item = doc;
          id = doc.objectID;
        } else {
          item = doc.data();
          id = doc.id;
        }

        let varButton = "";
        if (!user) {
          varButton = `
                <button type="button" class="btn btn-BelumLogin" data-id=${id} data-toggle="modal" data-target="#ModalLogin">
                    <span class="far fa-bookmark" data-id=${id}></span>
                </button>
                `;
        } else if (arrCookLaterList.includes(id)) {
          varButton = `
                <button type="button" class="btn btn-hapusCookLater" data-id=${id}>
                    <span class="fas fa-bookmark" data-id=${id}></span>
                </button>
                `;
        } else {
          varButton = `
                <button type="button" class="btn btn-TambahCookLater" data-id=${id}>
                    <span class="far fa-bookmark" data-id=${id}></span>
                </button>
                `;
        }
        const { thumbnail, judul, pembuatResep, bahan } = item;
        listCard += `
                <div class="card mb-3 p-4">
                    <div class="row">
                        <div class="col-md-4 mb-md-0 mb-3">
                            <div class="imgThumb">
                              <a href="./Resep.html?resep=${judul.replace(
                                " ",
                                "-"
                              )}" >
                                <img src="${thumbnail}" alt="${judul}">
                              </a>    
                            </div>
                        </div>
                        <div class="col-md-8 text-left">
                            <a href="./Resep.html?resep=${judul.replace(
                              " ",
                              "-"
                            )}" >
                              <h3 class="font-weight-bold text-dark">${judul}</h3>
                            </a> 
                            <h5>Oleh ${pembuatResep.nama}</h5>
                            <hr />
                            <br />
                            <p><b>Bahan</b> : ${
                              bahan.length > 0 ? bahan.join(",") : bahan[0]
                            }</p>
                            <div class="btnWrapper">    
                                <a href="./Resep.html?resep=${judul.replace(
                                  " ",
                                  "-"
                                )}" class="btn">
                                <span class="far fa-comment"></span>
                                </a>
                                ${varButton}
                            </div>
                        </div>
                    </div>
                </div>
                `;
      });
      document.getElementById("hits").innerHTML = listCard;
      addListener();
    }

    function Search(query, arrCookLaterList = []) {
      index
        .search(query, {
          facetFilters: [BahanFilter],
        })
        .then((res) => {
          const { hits } = res;
          RenderReseps(hits, arrCookLaterList, "algolia");
        });
    }

    if (!user) {
      dropdownWrapper.innerHTML = `
            <a class="dropdown-item" href = "./Login.html" > Login</a >
            <a class="dropdown-item" href="./Register.html">Regis</a>
          `;
      await db
        .collection("Data")
        .doc("BuatSearch")
        .get()
        .then((doc) => {
          const data = doc.data();
          var instance = $("#ListBahan").magicSuggest({
            data: data.listBahan,
            allowFreeEntries: false,
          });

          $(instance).on("selectionchange", function (e, m) {
            BahanFilter = instance.getValue().map((data) => {
              return `bahan:${data}`;
            });
            Search("");
          });
        });
      if (judulResep) {
        Search(judulResep.replace("+", " "), userDB.listCookLater);
      } else {
        Search("");
      }
    } else {
      dropdownWrapper.innerHTML = `
            <a class="dropdown-item" href = "./dashboard.html" >Dashboard</a >
            <a class="dropdown-item" href="./update.html">Update Profile</a>
            <button class="btn dropdown-item" id="logout">
                Signout
            </button>
          `;
      document.getElementById("logout").addEventListener("click", (e) => {
        e.preventDefault();
        return firebase
          .auth()
          .signOut()
          .then(function () {
            window.location.href = "./Login.html";
          })
          .catch(function (error) {
            console.log(error);
          });
      });
      db.collection("Users")
        .doc(user.uid)
        .onSnapshot(async (snap) => {
          const userDB = snap.data();
          await db
            .collection("Data")
            .doc("BuatSearch")
            .get()
            .then((doc) => {
              const data = doc.data();
              let ListBahan = "";
              var instance = $("#ListBahan").magicSuggest({
                data: data.listBahan,
                allowFreeEntries: false,
              });

              $(instance).on("selectionchange", function (e, m) {
                BahanFilter = instance.getValue().map((data) => {
                  return `bahan:${data}`;
                });
                Search("", userDB.listCookLater);
              });
            });
          if (judulResep) {
            Search(judulResep.replace("+", " "), userDB.listCookLater);
          } else {
            db.collection("resep")
              .limit(5)
              .get()
              .then((snap) => {
                RenderReseps(snap.docs, userDB.listCookLater, "firebase");
              });
          }

          document
            .getElementById("searchbox")
            .addEventListener("change", (e) => {
              Search(e.target.value, userDB.listCookLater);
            });
        });
    }
  });
});
