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
