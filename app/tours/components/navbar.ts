document.addEventListener("DOMContentLoaded", () => {
  const username = (localStorage.getItem("username") || "").toLowerCase();
  const myToursItem = document.getElementById("myTours");
  if (!myToursItem) return;

  if (username.startsWith("vodic") || username.startsWith("vlasnik")) {
    myToursItem.classList.remove("hidden");
  } else {
    myToursItem.classList.add("hidden");
  }
});
