"use strict";

const products = [
  { id: "tee-001", name: "The Oversized Essential", detail: "A better sort of basic. Much better.", price: 48, category: ["New Arrivals", "Oversized T-Shirts", "Men's Fashion", "Premium Streetwear"], label: "JUST LANDED", color: "Ink", colors: ["#292824", "#d9d4cc", "#b1a0bb"], colorNames: ["Ink", "Stone", "Lilac"], sizes: ["XS", "S", "M", "L", "XL"], image: "photo-1521572163474-6864f9cf17ab", imageAlt: "The soft, easy-fitting oversized essential tee" },
  { id: "denim-002", name: "The Good Jeans", detail: "Your search for the one is over.", price: 88, category: ["New Arrivals", "Denim Jeans", "Bootcut Jeans", "Women's Fashion"], label: "COMMUNITY FAVE", color: "Vintage blue", colors: ["#536b7c", "#34383d", "#cbbda7"], colorNames: ["Vintage blue", "Midnight", "Sand"], sizes: ["24", "26", "28", "30", "32"], image: "photo-1541099649105-f69ad21f3246", imageAlt: "Vintage-blue jeans with an effortlessly good fit" },
  { id: "hoodie-003", name: "The Off-Duty Hoodie", detail: "Cancel plans. Keep the hoodie.", price: 92, category: ["New Arrivals", "Hoodies and Sweatshirts", "Men's Fashion", "Premium Streetwear"], label: "LOW-KEY LEGEND", color: "Oat milk", colors: ["#dad2c5", "#41403e", "#66705f"], colorNames: ["Oat milk", "Ink", "Moss"], sizes: ["S", "M", "L", "XL", "XXL"], image: "photo-1556821840-3a63f95609a7", imageAlt: "Comfort-first everyday hoodie in a soft neutral color" },
  { id: "shirt-004", name: "The Not-A-Basic Polo", detail: "The old classic with new energy.", price: 64, salePrice: 49, category: ["Polo Shirts", "Men's Fashion", "New Arrivals", "Luxury Fashion"], label: "A LITTLE BIT POLISHED", color: "Off-white", colors: ["#ede8df", "#292a2b", "#8d9583"], colorNames: ["Off-white", "Ink", "Sage"], sizes: ["S", "M", "L", "XL"], image: "photo-1618354691373-d851c5c3a990", imageAlt: "Contemporary soft-textured polo shirt" },
  { id: "street-005", name: "The Sunday State Of Mind", detail: "Weekend energy, every single day.", price: 72, category: ["Premium Streetwear", "Women's Fashion", "Oversized T-Shirts"], label: "MOOD: UNBOTHERED", color: "Warm sand", colors: ["#d7c5b1", "#383533", "#9cabb1"], colorNames: ["Warm sand", "Ink", "Blue grey"], sizes: ["XS", "S", "M", "L", "XL"], image: "photo-1525507119028-ed4c629a60a3", imageAlt: "Easy, expressive contemporary streetwear" },
  { id: "denim-006", name: "The Almost-Vintage Jacket", detail: "The good old days. In brand-new condition.", price: 110, salePrice: 85, category: ["Denim Jeans", "Men's Fashion", "Luxury Fashion"], label: "BETTER WITH TIME", color: "Classic wash", colors: ["#586c7c", "#3e4549"], colorNames: ["Classic wash", "Ink"], sizes: ["S", "M", "L", "XL"], image: "photo-1543076447-215ad9ba6923", imageAlt: "The easy-fitting denim jacket that already feels like yours" },
  { id: "knit-007", name: "A Very Good Knit", detail: "One less reason to check the weather.", price: 98, salePrice: 68, category: ["Women's Fashion", "Luxury Fashion", "New Arrivals"], label: "SOFT-SPOT WARNING", color: "Butter", colors: ["#d6c393", "#bbb1ab", "#737d70"], colorNames: ["Butter", "Stone", "Moss"], sizes: ["XS", "S", "M", "L"], image: "photo-1434389677669-e08b4cac3105", imageAlt: "A relaxed, soft-feeling knit for everyday" },
  { id: "shirt-008", name: "The Going-Out-Everywhere Shirt", detail: "Looks like a plan. Feels like a no-brainer.", price: 76, category: ["Women's Fashion", "Luxury Fashion", "Bootcut Jeans"], label: "YOU KNOW THE ONE", color: "Silver blue", colors: ["#a9b6bb", "#e3ddd2", "#5a514e"], colorNames: ["Silver blue", "Stone", "Espresso"], sizes: ["XS", "S", "M", "L", "XL"], image: "photo-1483985988355-763728e1935b", imageAlt: "A versatile going-out look with a modern silhouette" }
];

const imageUrl = (image, width = 720) =>
  `https://images.unsplash.com/${image}?auto=format&fit=crop&w=${width}&q=78`;
const money = (amount) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
const cart = new Map();
const wishlist = new Set();
let activeFilter = "All";
let searchTerm = "";
let sortOrder = "featured";
let saleOnly = false;
let toastTimeout;
let lastFocusedElement;

const productGrid = document.getElementById("product-grid");
const resultsMessage = document.getElementById("results-message");
const emptyState = document.getElementById("empty-state");
const cartDrawer = document.getElementById("cart-drawer");
const wishlistDrawer = document.getElementById("wishlist-drawer");
const overlay = document.getElementById("overlay");

function matchingProducts() {
  let result = products.filter((product) => {
    const matchesCategory = activeFilter === "All" || product.category.includes(activeFilter);
    const query = searchTerm.trim().toLocaleLowerCase();
    const matchesSearch = !query || [product.name, product.detail, product.color, ...product.category]
      .some((value) => value.toLocaleLowerCase().includes(query));
    return matchesCategory && (!saleOnly || product.salePrice !== undefined) && matchesSearch;
  });
  if (sortOrder === "price-low") result = [...result].sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
  if (sortOrder === "price-high") result = [...result].sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
  if (sortOrder === "name") result = [...result].sort((a, b) => a.name.localeCompare(b.name));
  return result;
}

function renderProducts() {
  const visible = matchingProducts();
  resultsMessage.textContent = `${visible.length} ${visible.length === 1 ? "very good pick" : "very good picks"}${saleOnly ? " on sale" : ""}${activeFilter !== "All" ? ` in ${activeFilter}` : ""}${searchTerm ? ` for “${searchTerm.trim()}”` : ""}.`;
  emptyState.hidden = visible.length > 0;
  document.querySelectorAll(".collection-pill").forEach((button) => {
    const selected = button.dataset.category === activeFilter;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  productGrid.innerHTML = visible.map((product, index) => `
    <article class="product-card" style="--card-index:${index}" data-product-id="${product.id}">
      <div class="product-image-wrap">
        <img class="product-image" src="${imageUrl(product.image)}" alt="${product.imageAlt}" loading="lazy">
        <span class="product-badge">${product.salePrice !== undefined ? "A VERY GOOD DEAL" : product.label}</span>
        <button class="wishlist-button${wishlist.has(product.id) ? " is-saved" : ""}" type="button" data-wishlist="${product.id}" aria-label="${wishlist.has(product.id) ? "Remove" : "Add"} ${product.name} ${wishlist.has(product.id) ? "from" : "to"} wishlist" aria-pressed="${wishlist.has(product.id)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 8.6c0 4.3-8.2 10-8.2 10s-8.2-5.7-8.2-10a4.3 4.3 0 0 1 8.2-1.9 4.3 4.3 0 0 1 8.2 1.9Z"/></svg></button>
        <button class="quick-view-button" type="button" data-quick-view="${product.id}">Take a closer look <span aria-hidden="true">↗</span></button>
      </div>
      <div class="product-details">
        <div class="product-title-row"><div><h3>${product.name}</h3><p>${product.detail}</p></div><span class="product-price">${product.salePrice !== undefined ? `<span class="original-price">${money(product.price)}</span>${money(product.salePrice)}` : money(product.price)}</span></div>
        <div class="product-options"><span class="option-label">THE COLOUR: <span class="chosen-color" data-colour-label="${product.id}">${product.color}</span></span><div class="swatch-row" role="group" aria-label="${product.name} available colours">${product.colors.map((color, colorIndex) => `<button class="color-swatch${colorIndex === 0 ? " selected" : ""}" type="button" data-colour="${product.id}" data-name="${product.colorNames[colorIndex]}" aria-label="${product.colorNames[colorIndex]}" aria-pressed="${colorIndex === 0}" style="--swatch:${color}"${color.toLowerCase() === "#ede8df" || color.toLowerCase() === "#d9d4cc" ? ' data-light="true"' : ""}></button>`).join("")}</div></div>
        <div class="size-row"><span class="option-label">PICK YOUR SIZE</span><div class="size-options" role="group" aria-label="${product.name} available sizes">${product.sizes.map((size) => `<button class="size-option" type="button" data-size="${product.id}" data-value="${size}" aria-label="Size ${size}" aria-pressed="false">${size}</button>`).join("")}</div></div>
        <button class="add-to-cart" type="button" data-add-to-cart="${product.id}">Add to your bag <span aria-hidden="true">↗</span></button>
      </div>
    </article>`).join("");
}

function updateCart() {
  let count = 0;
  let subtotal = 0;
  const items = [];
  for (const [key, entry] of cart) {
    const product = products.find((item) => item.id === entry.id);
    if (!product) continue;
    count += entry.quantity;
    subtotal += (product.salePrice ?? product.price) * entry.quantity;
    items.push({ ...entry, product, key });
  }
  document.getElementById("cart-count").textContent = String(count);
  document.getElementById("open-cart").setAttribute("aria-label", `Open shopping bag, ${count} ${count === 1 ? "item" : "items"}`);
  document.getElementById("drawer-count").textContent = `(${count})`;
  document.getElementById("cart-subtotal").textContent = money(subtotal);
  document.getElementById("cart-empty").hidden = items.length > 0;
  document.getElementById("cart-footer").hidden = items.length === 0;
  const remaining = Math.max(0, 100 - subtotal);
  document.getElementById("shipping-message").textContent = remaining > 0
    ? `You’re ${money(remaining)} away from complimentary shipping.`
    : "Complimentary shipping is yours. Excellent choice.";
  document.getElementById("progress-fill").style.width = `${Math.min(100, subtotal / 100 * 100)}%`;
  document.getElementById("cart-items").innerHTML = items.map(({ product, quantity, size, color, key }) => `
    <article class="drawer-item">
      <img src="${imageUrl(product.image, 180)}" alt="${product.imageAlt}" loading="lazy">
      <div class="drawer-item-copy"><h3>${product.name}</h3><p>${color} · Size ${size}</p><div class="quantity-control" aria-label="${product.name} quantity"><button type="button" data-quantity="${key}" data-delta="-1" aria-label="Remove one ${product.name}">−</button><span>${quantity}</span><button type="button" data-quantity="${key}" data-delta="1" aria-label="Add one ${product.name}">+</button></div></div>
      <div class="drawer-item-end"><span>${money((product.salePrice ?? product.price) * quantity)}</span><button type="button" data-remove-cart="${key}" aria-label="Remove ${product.name} from bag">Remove</button></div>
    </article>`).join("");
}

function updateWishlist() {
  const saved = products.filter((product) => wishlist.has(product.id));
  document.getElementById("wishlist-count").textContent = `(${saved.length})`;
  document.getElementById("wishlist-empty").hidden = saved.length > 0;
  document.getElementById("wishlist-items").innerHTML = saved.map((product) => `
    <article class="wishlist-item"><img src="${imageUrl(product.image, 180)}" alt="${product.imageAlt}" loading="lazy"><div><h3>${product.name}</h3><p>${money(product.salePrice ?? product.price)} · ${product.color}</p><button class="wishlist-add" type="button" data-quick-view="${product.id}">Find my size <span aria-hidden="true">↗</span></button></div><button class="wishlist-remove" type="button" data-wishlist="${product.id}" aria-label="Remove ${product.name} from wishlist">×</button></article>`).join("");
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("is-visible"), 2700);
}

function openDrawer(drawer) {
  lastFocusedElement = document.activeElement;
  cartDrawer.hidden = true;
  wishlistDrawer.hidden = true;
  drawer.hidden = false;
  overlay.hidden = false;
  document.body.classList.add("drawer-open");
  drawer.querySelector(".close-drawer").focus();
}

function closeDrawer() {
  if (cartDrawer.hidden && wishlistDrawer.hidden) return;
  cartDrawer.hidden = true;
  wishlistDrawer.hidden = true;
  overlay.hidden = true;
  document.body.classList.remove("drawer-open");
  if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
}

function addToCart(productId, card) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;
  const selectedSize = card?.querySelector(`[data-size="${productId}"][aria-pressed="true"]`);
  if (!selectedSize) {
    card?.querySelector(`[data-size="${productId}"]`)?.focus();
    showToast("Choose your size first. We want to get this right.");
    return;
  }
  const colour = card.querySelector(`[data-colour-label="${productId}"]`)?.textContent || product.color;
  const key = `${productId}:${selectedSize.dataset.value}:${colour}`;
  const current = cart.get(key);
  cart.set(key, { id: productId, size: selectedSize.dataset.value, color: colour, quantity: (current?.quantity || 0) + 1 });
  updateCart();
  showToast(`${product.name}, meet your bag. Excellent choice.`);
}

function productPreview(product) {
  return `<div class="quick-view-image"><img src="${imageUrl(product.image, 850)}" alt="${product.imageAlt}"></div><div class="quick-view-details"><p class="eyebrow">${product.label}</p><h2 id="quick-view-title">${product.name}</h2><p>${product.detail}</p><strong class="quick-view-price">${product.salePrice !== undefined ? `<span class="original-price">${money(product.price)}</span>${money(product.salePrice)}` : money(product.price)}</strong><label for="quick-view-size">YOUR SIZE</label><select id="quick-view-size"><option value="">Choose a size</option>${product.sizes.map((size) => `<option value="${size}">${size}</option>`).join("")}</select><label for="quick-view-color">YOUR COLOUR</label><select id="quick-view-color">${product.colorNames.map((name) => `<option value="${name}">${name}</option>`).join("")}</select><button class="button button-dark preview-add" data-add-to-cart="${product.id}" type="button">Add to your bag <span aria-hidden="true">↗</span></button><span class="preview-note">Thoughtful fabrics. Easy returns. You being you.</span></div>`;
}

productGrid.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const sizeButton = target.closest("[data-size]");
  if (sizeButton) {
    const card = sizeButton.closest(".product-card");
    card?.querySelectorAll(`[data-size="${sizeButton.dataset.size}"]`).forEach((button) => {
      const selected = button === sizeButton;
      button.classList.toggle("selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    return;
  }
  const colourButton = target.closest("[data-colour]");
  if (colourButton) {
    const card = colourButton.closest(".product-card");
    card?.querySelectorAll(`[data-colour="${colourButton.dataset.colour}"]`).forEach((button) => {
      const selected = button === colourButton;
      button.classList.toggle("selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    const label = card?.querySelector(`[data-colour-label="${colourButton.dataset.colour}"]`);
    if (label) label.textContent = colourButton.dataset.name;
    return;
  }
  const addButton = target.closest("[data-add-to-cart]");
  if (addButton) {
    addToCart(addButton.dataset.addToCart, addButton.closest(".product-card"));
    return;
  }
});

document.getElementById("sort-select").addEventListener("change", (event) => {
  sortOrder = event.target.value;
  renderProducts();
});

document.querySelector(".filter-list").addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;
  activeFilter = button.dataset.filter;
  saleOnly = false;
  document.querySelectorAll("[data-filter]").forEach((filter) => {
    const selected = filter === button;
    filter.classList.toggle("active", selected);
    filter.setAttribute("aria-pressed", String(selected));
  });
  renderProducts();
});

document.getElementById("search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const searchInput = document.getElementById("search-input");
  if (window.matchMedia("(max-width: 700px)").matches && document.activeElement !== searchInput) {
    searchInput.focus();
    return;
  }
  searchTerm = searchInput.value;
  renderProducts();
  document.getElementById("shop").scrollIntoView({ behavior: "smooth" });
});

document.getElementById("search-input").addEventListener("input", (event) => {
  searchTerm = event.target.value;
  renderProducts();
});

document.getElementById("view-all-products").addEventListener("click", () => {
  activeFilter = "All";
  searchTerm = "";
  document.getElementById("search-input").value = "";
  document.querySelector('[data-filter="All"]').click();
});

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const collectionLink = target.closest("[data-category]");
  if (collectionLink) {
    const category = collectionLink.dataset.category;
    const matchingFilter = [...document.querySelectorAll("[data-filter]")].find((button) => button.dataset.filter === category);
    saleOnly = false;
    searchTerm = "";
    document.getElementById("search-input").value = "";
    if (matchingFilter) {
      activeFilter = category;
      document.querySelectorAll("[data-filter]").forEach((button) => {
        const selected = button === matchingFilter;
        button.classList.toggle("active", selected);
        button.setAttribute("aria-pressed", String(selected));
      });
      renderProducts();
      if (collectionLink instanceof HTMLButtonElement) {
        document.getElementById("shop").scrollIntoView({ behavior: "smooth" });
      }
    } else if (category) {
      activeFilter = category;
      document.querySelectorAll("[data-filter]").forEach((button) => {
        const selected = button.dataset.filter === "All";
        button.classList.toggle("active", selected);
        button.setAttribute("aria-pressed", String(selected));
      });
      renderProducts();
      if (collectionLink instanceof HTMLButtonElement) {
        document.getElementById("shop").scrollIntoView({ behavior: "smooth" });
      }
    }
  }

  const cartAdd = target.closest("[data-add-to-cart]");
  if (cartAdd && !cartAdd.closest("#product-grid")) {
    const product = products.find((item) => item.id === cartAdd.dataset.addToCart);
    if (product) {
      let card = productGrid.querySelector(`[data-product-id="${product.id}"]`);
      if (!card) {
        activeFilter = "All";
        searchTerm = "";
        document.getElementById("search-input").value = "";
        renderProducts();
        card = productGrid.querySelector(`[data-product-id="${product.id}"]`);
      }
      const size = document.getElementById("quick-view-size")?.value;
      const color = document.getElementById("quick-view-color")?.value || product.color;
      if (!size) {
        document.getElementById("quick-view-size")?.focus();
        showToast("Choose your size first. We want to get this right.");
        return;
      }
      const key = `${product.id}:${size}:${color}`;
      const existing = cart.get(key);
      cart.set(key, { id: product.id, size, color, quantity: (existing?.quantity || 0) + 1 });
      updateCart();
      document.getElementById("quick-view").close();
      showToast(`${product.name}, meet your bag. Excellent choice.`);
      return;
    }
  }

  const wishlistButton = target.closest("[data-wishlist]");
  if (wishlistButton) {
    const isWishlistOpen = !wishlistDrawer.hidden;
    const id = wishlistButton.dataset.wishlist;
    if (wishlist.has(id)) wishlist.delete(id);
    else wishlist.add(id);
    renderProducts();
    updateWishlist();
    if (isWishlistOpen) wishlistDrawer.querySelector(".wishlist-remove, .wishlist-continue")?.focus();
    showToast(wishlist.has(id) ? "One for later. A very good choice." : "Removed. Making room for the next good thing.");
    return;
  }

  const quickViewButton = target.closest("[data-quick-view]");
  if (quickViewButton) {
    const product = products.find((item) => item.id === quickViewButton.dataset.quickView);
    if (product) {
      document.getElementById("quick-view-content").innerHTML = productPreview(product);
      const dialog = document.getElementById("quick-view");
      if (!dialog.open) dialog.showModal();
      dialog.querySelector(".quick-view-close").focus();
    }
    return;
  }

  const quantityButton = target.closest("[data-quantity]");
  if (quantityButton) {
    const entry = cart.get(quantityButton.dataset.quantity);
    if (entry) {
      entry.quantity += Number(quantityButton.dataset.delta);
      if (entry.quantity <= 0) cart.delete(quantityButton.dataset.quantity);
      updateCart();
    }
    return;
  }

  const removeButton = target.closest("[data-remove-cart]");
  if (removeButton) {
    cart.delete(removeButton.dataset.removeCart);
    updateCart();
    return;
  }

  if (target.closest(".continue-shopping, .wishlist-continue")) closeDrawer();

  if (target.closest(".checkout-button")) {
    showToast("This checkout demo doesn’t process payments or collect card details.");
  }

  if (target.closest("[data-sale]")) {
    event.preventDefault();
    activeFilter = "All";
    searchTerm = "";
    saleOnly = true;
    document.getElementById("search-input").value = "";
    document.querySelectorAll("[data-filter]").forEach((button) => {
      const selected = button.dataset.filter === "All";
      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    renderProducts();
    document.getElementById("shop").scrollIntoView({ behavior: "smooth" });
  }
});

document.getElementById("open-cart").addEventListener("click", () => openDrawer(cartDrawer));
document.getElementById("open-wishlist").addEventListener("click", () => {
  updateWishlist();
  openDrawer(wishlistDrawer);
});
document.querySelectorAll(".close-drawer").forEach((button) => button.addEventListener("click", closeDrawer));
overlay.addEventListener("click", closeDrawer);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeDrawer();
  if (event.key === "Tab") {
    const drawer = cartDrawer.hidden ? (wishlistDrawer.hidden ? null : wishlistDrawer) : cartDrawer;
    if (!drawer) return;
    const focusable = [...drawer.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled])')]
      .filter((element) => element.getClientRects().length > 0);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});

document.getElementById("quick-view").addEventListener("click", (event) => {
  const dialog = event.currentTarget;
  if (event.target === dialog) dialog.close();
  if (event.target.closest(".quick-view-close")) dialog.close();
});

document.getElementById("newsletter-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const email = document.getElementById("newsletter-email");
  if (!email.reportValidity()) return;
  document.getElementById("newsletter-message").textContent = "You’re on the list. First dibs are officially yours. ✳";
  email.value = "";
  showToast("Welcome to your world. Your inbox has something to look forward to.");
});

const menuToggle = document.querySelector(".menu-toggle");
menuToggle.addEventListener("click", () => {
  const isOpen = document.body.classList.toggle("nav-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
});

document.querySelectorAll(".main-nav a").forEach((link) => link.addEventListener("click", () => {
  document.body.classList.remove("nav-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation");
}));

document.querySelector(".clear-filters").addEventListener("click", () => {
  activeFilter = "All";
  searchTerm = "";
  saleOnly = false;
  document.getElementById("search-input").value = "";
  const allFilter = document.querySelector('[data-filter="All"]');
  document.querySelectorAll("[data-filter]").forEach((button) => {
    const selected = button === allFilter;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  renderProducts();
});

renderProducts();
updateCart();
updateWishlist();
