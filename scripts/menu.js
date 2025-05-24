document.addEventListener("DOMContentLoaded", function () {
  lucide.createIcons();

  const mobileMenuButton = document.querySelector(".mobile-menu-button");
  const mobileSidebar = document.querySelector(".mobile-sidebar");
  const overlay = document.createElement("div");
  overlay.className = "mobile-menu-overlay";
  document.body.appendChild(overlay);

  function toggleMenu() {
    const isActive = mobileSidebar.classList.toggle("active");
    mobileSidebar.style.transform = isActive
      ? "translateX(0)"
      : "translateX(-100%)";
    overlay.style.opacity = isActive ? "0.5" : "0";
    overlay.style.pointerEvents = isActive ? "auto" : "none";
    document.body.style.overflow = isActive ? "hidden" : "";

    const menuIcon = mobileMenuButton.querySelector("i");
    if (menuIcon) {
      menuIcon.setAttribute("data-lucide", isActive ? "x" : "menu");
      lucide.createIcons();
    }
  }

  mobileMenuButton.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  overlay.addEventListener("click", toggleMenu);

  document.addEventListener("click", (e) => {
    if (
      mobileSidebar.classList.contains("active") &&
      !mobileSidebar.contains(e.target) &&
      e.target !== mobileMenuButton
    ) {
      toggleMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768 && mobileSidebar.classList.contains("active")) {
      toggleMenu();
    }
  });
});
