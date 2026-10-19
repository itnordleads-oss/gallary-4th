(() => {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isPhone = window.matchMedia("(max-width: 980px)").matches;
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const nav = document.querySelector(".nav");
  const menuBtn = document.querySelector(".menu-btn");
  const letterForm = document.getElementById("letterForm");
  const productGrid = document.getElementById("productGrid");
  const bagCount = document.getElementById("bagCount");
  const savedCount = document.getElementById("savedCount");
  const bagList = document.getElementById("bagList");
  const savedList = document.getElementById("savedList");
  const searchInput = document.getElementById("searchInput");
  const catBar = document.querySelector(".cat-bar");
  const catList = document.querySelector(".cat-list");
  const catLeft = document.querySelector(".cat-left");
  const catRight = document.querySelector(".cat-right");
  const required = {
    nav, menuBtn, letterForm, productGrid, bagCount, savedCount,
    bagList, savedList, searchInput, catBar, catList, catLeft, catRight,
  };
  const missing = Object.entries(required).filter(([, node]) => !node).map(([name]) => name);
  if (missing.length) {
    throw new Error(`Site 04 required markup is missing: ${missing.join(", ")}`);
  }

  const bag = [];
  const saved = new Set();

  const renderList = (list, items, emptyText) => {
    const empty = list.previousElementSibling;
    list.innerHTML = "";
    if (!items.length) {
      empty.classList.remove("is-hidden");
      empty.textContent = emptyText;
      return;
    }
    empty.classList.add("is-hidden");
    items.forEach((item) => {
      const li = document.createElement("li");
      const name = document.createElement("span");
      const price = document.createElement("span");
      name.textContent = item.name;
      price.textContent = item.price;
      li.append(name, price);
      list.append(li);
    });
  };

  const setMenu = (open) => {
    nav.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("nav-lock", open && isPhone);
  };

  menuBtn.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  document.querySelectorAll("[data-panel]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = `${button.dataset.panel}Panel`;
      document.querySelectorAll(".panel").forEach((panel) => {
        if (panel.id !== id) panel.hidden = true;
      });
      const panel = document.getElementById(id);
      if (!panel) throw new Error(`Panel ${id} is missing.`);
      panel.hidden = !panel.hidden;
      if (button.dataset.panel === "search" && !panel.hidden) searchInput.focus();
    });
  });

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    productGrid.querySelectorAll(".card").forEach((card) => {
      const name = (card.dataset.name || "").toLowerCase();
      const filter = document.querySelector(".filters button.is-on")?.dataset.filter || "all";
      const catOk = filter === "all" || card.dataset.cat === filter;
      card.classList.toggle("is-hidden", !catOk || (query && !name.includes(query)));
    });
  });

  document.querySelectorAll(".filters button").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".filters button").forEach((item) => item.classList.remove("is-on"));
      button.classList.add("is-on");
      searchInput.dispatchEvent(new Event("input"));
    });
  });

  productGrid.addEventListener("click", (event) => {
    const heart = event.target.closest(".heart");
    const add = event.target.closest(".add");
    const card = event.target.closest(".card");
    if (!card) return;
    const name = card.dataset.name;
    const price = card.dataset.price;
    if (!name || !price) throw new Error("Product card is missing a name or price.");
    if (heart) {
      heart.classList.toggle("is-on");
      heart.textContent = heart.classList.contains("is-on") ? "♥" : "♡";
      if (heart.classList.contains("is-on")) saved.add(name);
      else saved.delete(name);
      savedCount.textContent = String(saved.size);
      renderList(savedList, [...saved].map((item) => ({ name: item, price: "Saved" })), "Nothing saved yet.");
    }
    if (add) {
      bag.push({ name, price: `£${Number(price).toLocaleString("en-GB")}` });
      bagCount.textContent = String(bag.length);
      renderList(bagList, bag, "Your bag is empty.");
      add.textContent = "Added";
    }
  });

  letterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const note = letterForm.parentElement.querySelector(".form-note");
    if (!note) throw new Error("Newsletter note is missing.");
    const email = String(new FormData(letterForm).get("email") || "").trim();
    if (!email) throw new Error("Newsletter submitted without an email.");
    note.className = "form-ok";
    note.textContent = `${email} is on the list. Four letters a year, none of them sales.`;
    letterForm.reset();
  });

  const buttons = [...catList.querySelectorAll("button")];
  const placeBar = (button, animate) => {
    buttons.forEach((item) => item.classList.remove("is-on"));
    button.classList.add("is-on");
    const y = catList.offsetTop + button.offsetTop;
    const vars = { y, height: button.offsetHeight, duration: animate ? 0.35 : 0, ease: "power3.out" };
    if (typeof gsap !== "undefined" && animate && !prefersReduced) gsap.to(catBar, vars);
    else {
      catBar.style.transform = `translateY(${y}px)`;
      catBar.style.height = `${button.offsetHeight}px`;
    }
    const left = button.dataset.left;
    const right = button.dataset.right;
    if (!left || !right) throw new Error("Catalogue item is missing side images.");
    if (catLeft.getAttribute("src") !== left) catLeft.src = left;
    if (catRight.getAttribute("src") !== right) catRight.src = right;
  };

  buttons.forEach((button) => {
    button.addEventListener("pointerenter", () => { if (canHover) placeBar(button, true); });
    button.addEventListener("click", () => placeBar(button, true));
  });
  placeBar(buttons.find((button) => button.classList.contains("is-on")) || buttons[0], false);

  const room = document.querySelector(".room");
  if (!room) throw new Error("Room scene is missing.");
  const spots = [
    [".hs-a", "is-a"],
    [".hs-b", "is-b"],
    [".hs-c", "is-c"],
    [".hs-d", "is-d"],
  ];
  spots.forEach(([sel, name]) => {
    const button = room.querySelector(sel);
    if (!button) throw new Error(`Hotspot ${sel} is missing.`);
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const next = !room.classList.contains(name);
      room.classList.remove("is-a", "is-b", "is-c", "is-d");
      if (next) room.classList.add(name);
    });
  });
  document.addEventListener("click", (event) => {
    if (!room.contains(event.target)) room.classList.remove("is-a", "is-b", "is-c", "is-d");
  });

  const setNavTheme = () => {
    if (nav.classList.contains("open")) {
      nav.dataset.theme = "red";
      return;
    }
    const probe = 70;
    const red = [...document.querySelectorAll("[data-nav='red']")].some((section) => {
      const rect = section.getBoundingClientRect();
      return rect.top <= probe && rect.bottom > probe;
    });
    nav.dataset.theme = red ? "red" : "cream";
    const y = window.scrollY + 80;
    document.querySelectorAll(".links a").forEach((link) => {
      const id = link.getAttribute("href");
      if (!id || !id.startsWith("#")) return;
      const section = document.querySelector(id);
      if (!section) return;
      const top = section.offsetTop;
      link.classList.toggle("is-active", y >= top && y < top + section.offsetHeight);
    });
  };

  if (prefersReduced || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    if (!prefersReduced && (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined")) {
      throw new Error("GSAP or ScrollTrigger failed to load.");
    }
    window.addEventListener("scroll", setNavTheme, { passive: true });
    setNavTheme();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  if (!isPhone && typeof Lenis !== "undefined") {
    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      smoothWheel: true,
      syncTouch: false,
    });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        const id = link.getAttribute("href");
        if (!id || id === "#") return;
        const target = document.querySelector(id);
        if (!target) return;
        event.preventDefault();
        lenis.scrollTo(target, { offset: -58 });
      });
    });
  }

  const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
  intro.from(".hero h1 span", { y: 80, opacity: 0, duration: 0.9, stagger: 0.08 });
  intro.from(".welcome, .explore", { y: 16, opacity: 0, duration: 0.5, stagger: 0.06 }, "-=0.4");
  intro.from(".float", { y: 30, opacity: 0, duration: 0.6, stagger: 0.08 }, "-=0.45");

  if (!isPhone) {
    document.querySelectorAll(".float").forEach((card) => {
      gsap.to(card, {
        y: -10,
        duration: 2.4 + Math.random(),
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(card, {
        yPercent: -card.dataset.speed || -12,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6 },
      });
    });
  }

  gsap.from(".manifesto-copy", {
    scrollTrigger: { trigger: ".manifesto", start: "top 75%" },
    y: 40,
    opacity: 0,
    duration: 0.8,
  });
  gsap.from(".manifesto-copy img", {
    scrollTrigger: { trigger: ".manifesto", start: "top 70%" },
    scale: 0.6,
    opacity: 0,
    duration: 0.6,
    stagger: 0.12,
  });

  const catButtons = buttons;
  ScrollTrigger.create({
    trigger: ".catalogue",
    start: "top 60%",
    end: "bottom 40%",
    onUpdate: (self) => {
      const index = Math.min(catButtons.length - 1, Math.floor(self.progress * catButtons.length));
      if (!catButtons[index].classList.contains("is-on")) placeBar(catButtons[index], true);
    },
  });

  gsap.from(".card", {
    scrollTrigger: { trigger: ".grid", start: "top 80%" },
    y: 36,
    opacity: 0,
    duration: 0.6,
    stagger: 0.08,
  });
  gsap.from(".room", {
    scrollTrigger: { trigger: ".lives", start: "top 75%" },
    clipPath: "inset(8% 6% 8% 6%)",
    duration: 0.9,
    ease: "power3.out",
  });
  gsap.from(".wordmark span", {
    scrollTrigger: { trigger: ".wordmark", start: "top 90%" },
    y: (i) => (i % 2 === 0 ? 80 : 40),
    opacity: 0,
    rotate: (i) => (i % 2 === 0 ? -8 : 8),
    duration: 0.7,
    stagger: 0.06,
    ease: "power3.out",
  });

  ScrollTrigger.create({ start: 0, end: "max", onUpdate: setNavTheme });
  setNavTheme();
  ScrollTrigger.config({ ignoreMobileResize: true });
  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
