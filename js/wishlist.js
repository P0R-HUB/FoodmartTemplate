(function () {
  'use strict';

  var WISHLIST_KEY = 'fm_wishlist';
  var wishlist = {};

  /* ── LocalStorage ── */
  function save() {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }

  function load() {
    try {
      var stored = localStorage.getItem(WISHLIST_KEY);
      if (stored) wishlist = JSON.parse(stored) || {};
    } catch (e) {
      wishlist = {};
    }
    updateNavBadge();
    syncButtons();
  }

  /* ── Toggle ── */
  function toggle(productId, name) {
    if (wishlist[productId]) {
      delete wishlist[productId];
    } else {
      wishlist[productId] = name || productId;
    }
    save();
    updateNavBadge();
    syncButtons();
  }

  /* ── Update navbar badge count ── */
  function updateNavBadge() {
    var count = Object.keys(wishlist).length;
    var badge = document.getElementById('wishlist-badge');
    if (!badge) return;
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-block' : 'none';
  }

  /* ── Sync all heart buttons on the page ── */
  function syncButtons() {
    document.querySelectorAll('.btn-wishlist[data-id]').forEach(function (btn) {
      var id = String(btn.dataset.id);
      if (wishlist[id]) {
        btn.classList.add('active');
        btn.style.color = '#dc3545';
      } else {
        btn.classList.remove('active');
        btn.style.color = '';
      }
    });
  }

  /* ── Event delegation — works for dynamically rendered cards too ── */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.btn-wishlist');
    if (!btn) return;
    e.preventDefault();

    var card = btn.closest('.product-item');
    var productId = btn.dataset.id || (card && card.querySelector('.add-to-cart') && card.querySelector('.add-to-cart').dataset.id) || '';
    var name = card && card.querySelector('h3') ? card.querySelector('h3').textContent.trim() : productId;

    if (!productId) return;
    btn.dataset.id = productId;

    toggle(productId, name);

    /* Pulse animation */
    btn.classList.add('wishlist-pulse');
    setTimeout(function () { btn.classList.remove('wishlist-pulse'); }, 400);
  });

  /* ── Public ── */
  window.FoodApp = window.FoodApp || {};
  window.FoodApp.wishlist = { load: load, syncButtons: syncButtons };

  document.addEventListener('DOMContentLoaded', load);
})();
