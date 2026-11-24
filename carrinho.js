(() => {
  "use strict";
  const STORAGE_KEY = "brasaBurgerCarrinho";
  const money = value => Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const readCart = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(saved) ? saved.filter(item => item && item.id && Number(item.price) >= 0 && Number(item.qty) > 0) : [];
    } catch { return []; }
  };
  let cart = readCart();
  const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  const totalQty = () => cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = () => cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const esc = value => String(value).replace(/[&<>"']/g, ch => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[ch]));
  const countEls = () => document.querySelectorAll("[data-carrinho-contador]");
  const updateCount = () => countEls().forEach(el => el.textContent = totalQty());
  const COMPLEMENTS = [
    { id: "extra-coca-cola", name: "Coca-Cola lata 350 ml", price: 6.90, kind: "complemento", category: "bebida", icon: "🥤", description: "Lata geladinha" },
    { id: "extra-guarana", name: "Guaraná Antarctica 350 ml", price: 6.50, kind: "complemento", category: "bebida", icon: "🥤", description: "Refrescante" },
    { id: "extra-agua", name: "Água mineral 500 ml", price: 4.00, kind: "complemento", category: "bebida", icon: "💧", description: "Com ou sem gás" },
    { id: "extra-maionese-alho", name: "Maionese de alho", price: 2.50, kind: "complemento", category: "molho", icon: "🧄", description: "Pote de 30 ml" },
    { id: "extra-bbq-casa", name: "BBQ da casa", price: 2.50, kind: "complemento", category: "molho", icon: "🍯", description: "Pote de 30 ml" },
    { id: "extra-molho-picante", name: "Molho picante", price: 2.50, kind: "complemento", category: "molho", icon: "🌶️", description: "Pote de 30 ml" }
  ];

  function setupDrawer() {
    if (document.querySelector(".carrinho-gaveta")) return;
    const overlay = document.createElement("div");
    overlay.className = "carrinho-overlay";
    overlay.setAttribute("data-carrinho-fechar", "");
    overlay.setAttribute("aria-hidden", "true");
    const drawer = document.createElement("aside");
        drawer.className = "carrinho-gaveta";
        drawer.setAttribute("aria-label", "Seu carrinho de compras");
        drawer.setAttribute("aria-hidden", "true");
        drawer.innerHTML = `
        <header class="carrinho-topo">
            <div><h2>Seu carrinho</h2><p><span data-carrinho-total-qtd>0</span> item(ns) selecionados</p></div>
            <button type="button" class="carrinho-fechar" data-carrinho-fechar aria-label="Fechar carrinho">×</button>
        </header>
        <div class="carrinho-itens" data-carrinho-itens></div>
        <footer class="carrinho-rodape">
            <div class="carrinho-subtotal">
            <span>Subtotal</span>
            <strong data-carrinho-subtotal>R$ 0,00</strong>
            </div>
            <a class="carrinho-checkout" data-carrinho-checkout href="pagamento.html">Continuar para pagamento
            </a>
            <button type="button" class="carrinho-continuar" data-carrinho-fechar>Continuar comprando
            </button>
        </footer>`;
    document.body.append(overlay, drawer);
    renderDrawer();
  }

function renderComplementSuggestions() {
  return `<section class="carrinho-complementos" aria-label="Bebidas e molhos para complementar">
    <div class="carrinho-complementos-cabecalho">
      <span>COMBINA COM SEU PEDIDO</span>
      <h3>Vai querer algo a mais?</h3>
      <p>Escolha uma bebida ou um molho especial.</p>
    </div>
    <div class="carrinho-complementos-lista">
      ${COMPLEMENTS.map(product => `<article class="carrinho-complemento">
        <span class="carrinho-complemento-icone" aria-hidden="true">${product.icon}</span>
        <div class="carrinho-complemento-info">
          <strong>${esc(product.name)}</strong>
          <small>${esc(product.description)}</small>
          <span class="carrinho-complemento-preco">${money(product.price)}</span>
        </div>
        <button type="button" data-complemento-adicionar="${esc(product.id)}" aria-label="Adicionar ${esc(product.name)}">+</button>
      </article>`).join("")}
    </div>
  </section>`;
}

function renderDrawer() {
  const drawer = document.querySelector(".carrinho-gaveta");
  if (!drawer) return;
  const items = drawer.querySelector("[data-carrinho-itens]");
  drawer.querySelector("[data-carrinho-total-qtd]").textContent = totalQty();
  drawer.querySelector("[data-carrinho-subtotal]").textContent = money(totalPrice());
  const checkout = drawer.querySelector("[data-carrinho-checkout]");
  checkout.setAttribute("aria-disabled", cart.length ? "false" : "true");
  checkout.classList.toggle("checkout-desativado", !cart.length);
  if (!cart.length) {
    items.innerHTML = '<div class="carrinho-vazio"><strong>Seu carrinho está vazio</strong><span>Escolha seu favorito no cardápio e ele aparece aqui.</span></div>';
    return;
  }
  const hasMainProduct = cart.some(item => item.kind !== "complemento");
  items.innerHTML = cart.map(item => `
    <article class="carrinho-item ${item.kind === "complemento" ? "carrinho-item-extra" : ""}">
      ${item.image ? `<img src="${esc(item.image)}" alt="" loading="lazy">` : `<div class="carrinho-item-icone" aria-hidden="true">${esc(item.icon || "🍽️")}</div>`}
      <div>
        <div class="carrinho-item-nome">${esc(item.name)}</div>
        <div class="carrinho-item-preco">${money(item.price * item.qty)}</div>
        <div class="carrinho-qtd">
          <button type="button" data-carrinho-acao="menos" data-id="${esc(item.id)}" aria-label="Diminuir ${esc(item.name)}">−</button>
          <span>${item.qty}</span>
          <button type="button" data-carrinho-acao="mais" data-id="${esc(item.id)}" aria-label="Aumentar ${esc(item.name)}">+</button>
        </div>
      </div>
    </article>`).join("") + (hasMainProduct ? newRenderComplementSuggestions() : "");
}
function addComplement(id) {
  const product = COMPLEMENTS.find(item => item.id === id);
  if (!product) return;
  const existing = cart.find(item => item.id === product.id);
  if (existing) existing.qty += 1;
  else cart.push({ ...product, image: "", qty: 1 });
  save();
  updateCount();
  renderDrawer();
}

  function openDrawer() {
    setupDrawer();
    const overlay = document.querySelector(".carrinho-overlay");
    const drawer = document.querySelector(".carrinho-gaveta");
    overlay.classList.add("aberto");
    drawer.classList.add("aberto");
    overlay.setAttribute("aria-hidden", "false");
    drawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("carrinho-travado");
    drawer.querySelector(".carrinho-fechar").focus();
    renderDrawer();
  }
  function closeDrawer() {
    document.querySelector(".carrinho-overlay")?.classList.remove("aberto");
    const drawer = document.querySelector(".carrinho-gaveta");
    drawer?.classList.remove("aberto");
    document.querySelector(".carrinho-overlay")?.setAttribute("aria-hidden", "true");
    drawer?.setAttribute("aria-hidden", "true");
    document.body.classList.remove("carrinho-travado");
  }

  function addProduct(button) {
    const name = button.dataset.produto;
    const price = Number(button.dataset.preco);
    if (!name || !Number.isFinite(price) || price < 0) return;
    const id = name.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-");
    const existing = cart.find(item => item.id === id);
    if (existing) existing.qty += 1;
    else cart.push({ id, name, price, image: button.dataset.imagem || "", qty: 1, kind: "principal" });
    save();
    updateCount();
    openDrawer();
  }

  document.addEventListener("click", event => {
    const complement = event.target.closest("[data-complemento-adicionar]");
    if (complement) { event.preventDefault(); addComplement(complement.dataset.complementoAdicionar); return; }
    const add = event.target.closest("[data-carrinho-adicionar]");
    if (add) { event.preventDefault(); addProduct(add); return; }
    if (event.target.closest("[data-carrinho-abrir]")) { event.preventDefault(); openDrawer(); return; }
    if (event.target.closest("[data-carrinho-fechar]")) { event.preventDefault(); closeDrawer(); return; }
    const action = event.target.closest("[data-carrinho-acao]");
    if (action) {
      const item = cart.find(entry => entry.id === action.dataset.id);
      if (!item) return;
      if (action.dataset.carrinhoAcao === "mais") {
        item.qty += 1;
      }
      if (action.dataset.carrinhoAcao === "menos") {
        if (item.qty <= 1) {
          cart = cart.filter(entry => entry.id !== item.id);
        } else {
          item.qty -= 1;
        }
      }
      if (!cart.some(entry => entry.kind !== "complemento")) {
        cart = cart.filter(entry => entry.kind !== "complemento");
      }
      save();
      updateCount();
      renderDrawer();
    }
    const checkout = event.target.closest("[data-carrinho-checkout]");
    if (checkout && !cart.length) { event.preventDefault(); }
  });
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeDrawer(); });
  window.addEventListener("storage", event => {
    if (event.key === STORAGE_KEY) { cart = readCart(); updateCount(); renderDrawer(); }
  });

  function renderPaymentSummary() {
    const host = document.querySelector("[data-resumo-carrinho]");
    if (!host) return;
    const hiddenItems = document.querySelector("[name='itens_pedido']");
    const hiddenTotal = document.querySelector("[name='total_pedido']");
    if (hiddenItems) hiddenItems.value = JSON.stringify(cart.map(({id,name,price,qty}) => ({id,name,price,qty})));
    if (hiddenTotal) hiddenTotal.value = totalPrice().toFixed(2);
    host.innerHTML = `<h2>Resumo do pedido</h2>` +
      (cart.length ? cart.map(item => `<div class="resumo-linha"><span>${item.qty}× ${esc(item.name)}</span><strong>${money(item.price*item.qty)}</strong></div>`).join("") : '<p class="resumo-linha">Nenhum produto no carrinho. Volte ao cardápio para escolher seus lanches.</p>') +
      `<div class="resumo-linha resumo-total"><span>Total dos produtos</span><strong>${money(totalPrice())}</strong></div>`;
  }

  document.addEventListener("DOMContentLoaded", () => {
    updateCount();
    if (document.querySelector("[data-carrinho-adicionar]")) setupDrawer();
    renderPaymentSummary();
  });
  if (document.readyState !== "loading") {
    updateCount();
    if (document.querySelector("[data-carrinho-adicionar]")) setupDrawer();
    renderPaymentSummary();
  }
})();

/* Carrossel da galeria de fotos: setas, paginação e gesto de arrastar */
(() => {
  const initGallery = () => {
    document.querySelectorAll("[data-galeria-carrossel]").forEach(gallery => {
      if (gallery.dataset.iniciado) return;
      gallery.dataset.iniciado = "true";
      const track = gallery.querySelector("[data-galeria-trilho]");
      const prev = gallery.querySelector("[data-galeria-anterior]");
      const next = gallery.querySelector("[data-galeria-proxima]");
      const pagination = gallery.querySelector("[data-galeria-paginacao]");
      const images = Array.from(track.querySelectorAll("img"));
      if (!track || !images.length) return;

      const dots = images.map((image, index) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "galeria-ponto";
        dot.setAttribute("aria-label", "Ir para imagem " + (index + 1));
        dot.addEventListener("click", () => {
          const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
          track.scrollTo({ left: maxScroll * (images.length > 1 ? index / (images.length - 1) : 0), behavior: "smooth" });
        });
        pagination.append(dot);
        return dot;
      });
      const move = direction => {
        const step = images[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || 0);
        track.scrollBy({ left: direction * step, behavior: "smooth" });
      };
      prev.addEventListener("click", () => move(-1));
      next.addEventListener("click", () => move(1));

      let raf = 0;
      const update = () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
          const progress = maxScroll ? track.scrollLeft / maxScroll : 0;
          const nearest = Math.round(progress * (images.length - 1));
          dots.forEach((dot, i) => {
            dot.classList.toggle("ativo", i === nearest);
            if (i === nearest) dot.setAttribute("aria-current", "true");
            else dot.removeAttribute("aria-current");
          });
          prev.disabled = track.scrollLeft <= 2;
          next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
        });
      };
      let autoplay = null;
      const startAutoplay = () => {
        stopAutoplay();
        autoplay = window.setInterval(() => {
          if (document.hidden || gallery.matches(":hover") || gallery.contains(document.activeElement)) return;
          const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
          if (atEnd) track.scrollTo({ left: 0, behavior: "smooth" });
          else move(1);
        }, 4500);
      };
      const stopAutoplay = () => {
        if (autoplay !== null) window.clearInterval(autoplay);
        autoplay = null;
      };
      gallery.addEventListener("mouseenter", stopAutoplay);
      gallery.addEventListener("mouseleave", startAutoplay);
      gallery.addEventListener("focusin", stopAutoplay);
      gallery.addEventListener("focusout", startAutoplay);
      gallery.addEventListener("touchstart", stopAutoplay, { passive: true });
      gallery.addEventListener("touchend", startAutoplay, { passive: true });
      startAutoplay();
      track.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", update);
      update();
    });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initGallery);
  else initGallery();
})();
/* Alternância de tema claro/escuro */
(() => {
  "use strict";
  const KEY = "brasaBurgerTema";
  const body = document.body;
  const buttons = () => document.querySelectorAll("[data-tema-toggle]");
  const getSavedTheme = () => {
    try {
      const saved = localStorage.getItem(KEY);
      return saved === "claro" || saved === "escuro" ? saved : "escuro";
    } catch {
      return "escuro";
    }
  };
  const applyTheme = theme => {
    const light = theme === "claro";
    body.classList.toggle("tema-claro", light);
    buttons().forEach(button => {
      const icon = button.querySelector("[data-tema-icone]");
      if (icon) icon.textContent = light ? "☀" : "☾";
      const label = light ? "Ativar modo escuro" : "Ativar modo claro";
      button.setAttribute("aria-label", label);
      button.setAttribute("title", label);
    });
  };
  let theme = getSavedTheme();
  applyTheme(theme);
  buttons().forEach(button => button.addEventListener("click", () => {
    theme = theme === "claro" ? "escuro" : "claro";
    applyTheme(theme);
    try { localStorage.setItem(KEY, theme); } catch {}
  }));
})();


/* Carrossel do cardápio — navegação horizontal sem mover a página */
(() => {
  "use strict";

  const initMenuCarousel = () => {
    document.querySelectorAll("[data-cardapio-carrossel]").forEach(carousel => {
      if (carousel.dataset.iniciado === "true") return;
      carousel.dataset.iniciado = "true";

      const track = carousel.querySelector("[data-cardapio-trilho]");
      const previous = carousel.querySelector("[data-cardapio-anterior]");
      const next = carousel.querySelector("[data-cardapio-proxima]");
      const pagination = carousel.parentElement.querySelector("[data-cardapio-paginacao]");

      if (!track || !previous || !next || !pagination) return;

      const cards = Array.from(track.querySelectorAll(".ind-card"));
      if (!cards.length) return;

      const dots = cards.map((card, index) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "cardapio-ponto";
        dot.setAttribute("aria-label", "Mostrar hambúrguer " + (index + 1));
        dot.addEventListener("click", event => {
          event.preventDefault();
          const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
          const targetProgress = cards.length > 1 ? index / (cards.length - 1) : 0;
          track.scrollTo({ left: maxScroll * targetProgress, behavior: "smooth" });
        });
        pagination.append(dot);
        return dot;
      });

      const getProgress = () => {
        const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
        return maxScroll ? Math.min(1, Math.max(0, track.scrollLeft / maxScroll)) : 0;
      };

      let raf = 0;
      const update = () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const progress = getProgress();
          const activeIndex = Math.round(progress * (dots.length - 1));

          dots.forEach((dot, index) => {
            const active = index === activeIndex;
            dot.classList.toggle("ativo", active);
            if (active) dot.setAttribute("aria-current", "true");
            else dot.removeAttribute("aria-current");
          });

          previous.disabled = track.scrollLeft <= 2;
          next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
        });
      };

      const move = direction => {
        const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
        const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || "0") || 0;
        const cardStep = cards[0].getBoundingClientRect().width + gap;
        const targetLeft = Math.max(0, Math.min(maxScroll, track.scrollLeft + direction * cardStep));
        track.scrollTo({ left: targetLeft, behavior: "smooth" });
      };

      previous.addEventListener("click", event => {
        event.preventDefault();
        move(-1);
      });
      next.addEventListener("click", event => {
        event.preventDefault();
        move(1);
      });

      track.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", update);
      update();
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMenuCarousel);
  } else {
    initMenuCarousel();
  }
})();
