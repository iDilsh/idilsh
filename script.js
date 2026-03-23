const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");
const header = document.getElementById("siteHeader");

menuToggle.addEventListener("click", () => {
  navMenu.classList.toggle("show");
});

navMenu.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => navMenu.classList.remove("show"));
});

window.addEventListener("scroll", () => {
  if (window.scrollY > 10) {
    header.style.boxShadow = "0 10px 30px rgba(0,0,0,0.35)";
  } else {
    header.style.boxShadow = "none";
  }
});

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
