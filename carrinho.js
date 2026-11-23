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
    items.innerHTML = cart.map(item => `
      <article class="carrinho-item">
        <img src="${esc(item.image || "")}" alt="" loading="lazy">
        <div>
          <div class="carrinho-item-nome">${esc(item.name)}</div>
          <div class="carrinho-item-preco">${money(item.price * item.qty)}</div>
          <div class="carrinho-qtd">
            <button type="button" data-carrinho-acao="menos" data-id="${esc(item.id)}" aria-label="Diminuir ${esc(item.name)}">−</button>
            <span>${item.qty}</span>
            <button type="button" data-carrinho-acao="mais" data-id="${esc(item.id)}" aria-label="Aumentar ${esc(item.name)}">+</button>
          </div>
        </div>
      </article>`).join("");
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
    else cart.push({ id, name, price, image: button.dataset.imagem || "", qty: 1 });
    save();
    updateCount();
    openDrawer();
  }

  document.addEventListener("click", event => {
    const add = event.target.closest("[data-carrinho-adicionar]");
    if (add) { event.preventDefault(); addProduct(add); return; }
    if (event.target.closest("[data-carrinho-abrir]")) { event.preventDefault(); openDrawer(); return; }
    if (event.target.closest("[data-carrinho-fechar]")) { event.preventDefault(); closeDrawer(); return; }
    const action = event.target.closest("[data-carrinho-acao]");
    if (action) {
      const item = cart.find(entry => entry.id === action.dataset.id);
      if (!item) return;
      if (action.dataset.carrinhoAcao === "mais") item.qty += 1;
      if (action.dataset.carrinhoAcao === "menos") item.qty -= 1;
      save(); updateCount(); renderDrawer();
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