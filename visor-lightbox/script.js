const galleryItems = document.querySelectorAll(".gallery-item");

const lightbox = document.querySelector(".lightbox");

const lightboxImage = document.querySelector("#lightbox-image");

const closeBtn = document.querySelector("#close-btn");

galleryItems.forEach((item) => {
  item.addEventListener("click", () => {
    const fullImageSrc = item.src.replace("-thumbnail", "");

    lightboxImage.src = fullImageSrc;
    lightboxImage.alt = item.alt;

    lightbox.style.display = "flex";
  });
});

closeBtn.addEventListener("click", () => {
  lightbox.style.display = "none";
});

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    lightbox.style.display = "none";
  }
});