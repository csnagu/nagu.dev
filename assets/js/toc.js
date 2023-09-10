window.addEventListener("load", () => {
  const tocSpace = document.getElementById("toc");
  if (!tocSpace) return;

  window.addEventListener("scroll", () => {
    if (window.outerWidth >= 1250 && window.scrollY > 80) {
      tocSpace.style.top = "0";
    } else {
      tocSpace.style.top = "10rem";
    }
  });
});
