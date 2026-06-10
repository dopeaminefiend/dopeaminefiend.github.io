/* ============================================================
   REDTEAM — Main JS
   ============================================================ */

/* --- Cart State ------------------------------------------- */
const cart = {
  items: [],

  add(product) {
    const existing = this.items.find(i => i.id === product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      this.items.push({ ...product, qty: 1 });
    }
    this.render();
    CartDrawer.open();
  },

  remove(id) {
    this.items = this.items.filter(i => i.id !== id);
    this.render();
  },

  total() {
    return this.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  },

  count() {
    return this.items.reduce((sum, i) => sum + i.qty, 0);
  },

  render() {
    // Update count badge
    const badge = document.querySelector('.cart-count');
    if (badge) {
      const n = this.count();
      badge.textContent = n;
      badge.classList.toggle('visible', n > 0);
    }

    // Render cart items
    const itemsEl = document.querySelector('.cart-items');
    if (!itemsEl) return;

    if (this.items.length === 0) {
      itemsEl.innerHTML = `
        <div class="cart-empty">
          <p>Your cart is empty</p>
        </div>`;
    } else {
      itemsEl.innerHTML = this.items.map(item => `
        <div class="cart-item" data-id="${item.id}">
          <div class="cart-item-img"></div>
          <div>
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-variant">${item.variant || 'Standard'} · Qty ${item.qty}</div>
            <button class="cart-item-remove" onclick="cart.remove('${item.id}')">Remove</button>
          </div>
          <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
        </div>`).join('');
    }

    // Update total
    const totalEl = document.querySelector('.cart-total-price');
    if (totalEl) totalEl.textContent = `$${this.total().toFixed(2)} CAD`;

    // Show/hide checkout button
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.disabled = this.items.length === 0;
      checkoutBtn.style.opacity = this.items.length === 0 ? '0.4' : '1';
      checkoutBtn.style.pointerEvents = this.items.length === 0 ? 'none' : 'auto';
    }
  }
};

/* --- Cart Drawer ------------------------------------------ */
const CartDrawer = {
  el: null,
  overlay: null,

  init() {
    this.el = document.querySelector('.cart-drawer');
    this.overlay = document.querySelector('.cart-overlay');
    if (!this.el) return;

    document.querySelector('.cart-close')?.addEventListener('click', () => this.close());
    this.overlay?.addEventListener('click', () => this.close());
    document.addEventListener('keydown', e => e.key === 'Escape' && this.close());
  },

  open() {
    this.el?.classList.add('open');
    this.overlay?.classList.add('visible');
    document.body.style.overflow = 'hidden';
  },

  close() {
    this.el?.classList.remove('open');
    this.overlay?.classList.remove('visible');
    document.body.style.overflow = '';
  }
};

/* --- Nav -------------------------------------------------- */
const Nav = {
  init() {
    // Mobile hamburger
    const ham = document.querySelector('.nav-hamburger');
    const links = document.querySelector('.nav-links');
    if (ham && links) {
      ham.addEventListener('click', () => {
        const open = links.classList.toggle('mobile-open');
        ham.setAttribute('aria-expanded', open);
        document.body.style.overflow = open ? 'hidden' : '';
      });
    }

    // Cart open
    document.querySelectorAll('.nav-cart, [data-open-cart]').forEach(el => {
      el.addEventListener('click', e => {
        e.preventDefault();
        CartDrawer.open();
      });
    });

    // Sticky nav shadow on scroll
    const nav = document.querySelector('.site-nav');
    if (nav) {
      window.addEventListener('scroll', () => {
        nav.style.borderBottomColor = window.scrollY > 10
          ? 'rgba(255,255,255,0.08)'
          : 'var(--grey-mid)';
      }, { passive: true });
    }
  }
};

/* --- Shop Filters ----------------------------------------- */
const ShopFilters = {
  init() {
    const btns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.product-card');
    if (!btns.length) return;

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;
        cards.forEach(card => {
          if (filter === 'all' || card.dataset.type === filter) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }
};

/* --- Add to Cart buttons ---------------------------------- */
const ProductCards = {
  init() {
    document.querySelectorAll('.add-to-cart').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const card = btn.closest('.product-card, .issue-card');
        const id = card?.dataset.productId || Math.random().toString(36).slice(2);
        const name = card?.querySelector('.product-name, .issue-title')?.textContent || 'Item';
        const priceText = card?.querySelector('.product-price, .issue-price')?.textContent || '$0';
        const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;

        cart.add({ id, name, price });

        // Brief feedback on button
        const orig = btn.textContent;
        btn.textContent = 'Added ✓';
        setTimeout(() => { btn.textContent = orig; }, 1200);
      });
    });
  }
};

/* --- Newsletter ------------------------------------------- */
const Newsletter = {
  init() {
    const form = document.querySelector('.newsletter-form');
    if (!form) return;

    form.addEventListener('submit', e => {
      e.preventDefault();
      const input = form.querySelector('.newsletter-input');
      const btn = form.querySelector('.btn');
      if (!input?.value) return;

      const orig = btn.textContent;
      btn.textContent = 'Subscribed ✓';
      btn.disabled = true;
      input.value = '';

      setTimeout(() => {
        btn.textContent = orig;
        btn.disabled = false;
      }, 3000);

      /* TODO: Wire to email service (Mailchimp, Klaviyo, etc.) */
    });
  }
};

/* --- Ticker duplication for seamless loop ----------------- */
const Ticker = {
  init() {
    const track = document.querySelector('.ticker-track');
    if (!track) return;
    // Clone children for seamless loop
    const items = [...track.children];
    items.forEach(item => track.appendChild(item.cloneNode(true)));
  }
};

/* --- Lazy image placeholders ------------------------------ */
const Images = {
  init() {
    // In production, replace placeholder divs with real <img> tags
    // or hook up a lazy-load library here
  }
};

/* --- Checkout (API hook placeholder) --------------------- */
function handleCheckout() {
  /**
   * PAYMENT INTEGRATION HOOK
   *
   * Shopify Storefront API:
   *   POST /api/2024-01/graphql.json
   *   mutation { checkoutCreate(input: { lineItems: [...] }) { checkout { webUrl } } }
   *   Then redirect to checkout.webUrl
   *
   * Stripe:
   *   POST to your server endpoint → create Stripe Checkout Session
   *   Then redirect to session.url
   *
   * Uncomment and replace with real implementation when ready.
   */
  alert('Checkout coming soon — payment integration in progress.');
}

/* --- Init ------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  Nav.init();
  CartDrawer.init();
  ShopFilters.init();
  ProductCards.init();
  Newsletter.init();
  Ticker.init();
  cart.render();

  // Expose checkout globally for button onclick
  window.handleCheckout = handleCheckout;
});
