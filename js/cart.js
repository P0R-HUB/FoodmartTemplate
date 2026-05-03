(function($) {
  'use strict';

  window.FoodApp = window.FoodApp || {};

  /* ── Toast ── */
  var showToast = function(message, type) {
    type = type || 'success';
    var icon = type === 'success' ? '🛒' : '❌';
    var $toast = $(
      '<div class="toast-msg ' + type + '">' +
        '<span class="toast-icon">' + icon + '</span>' +
        '<span>' + message + '</span>' +
      '</div>'
    );
    $('#toast-container').append($toast);
    setTimeout(function() { $toast.addClass('show'); }, 10);
    setTimeout(function() {
      $toast.removeClass('show');
      setTimeout(function() { $toast.remove(); }, 300);
    }, 2500);
  };

  /* ── State ── */
  var CART_KEY = 'shopping_cart';
  var cart     = {};

  /* ── LocalStorage ── */
  var saveToLocalStorage = function() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  };

  var loadCart = function() {
    try {
      var stored = localStorage.getItem(CART_KEY);
      if (stored) {
        var parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          cart = parsed;
        }
      }
    } catch (e) {
      console.warn('Cart data corrupted, resetting.', e);
      localStorage.removeItem(CART_KEY);
    }
    updateCartUI();
  };

  /* ── updateCartUI ── */
  var updateCartUI = function() {
    var $list        = $('#cart-item-list');
    var $emptyMsg    = $('#cart-empty-msg');
    var $count       = $('#cart-item-count');
    var $total       = $('#cart-total-price');
    var $headerTotal = $('.cart-total');
    var $checkoutBtn = $('#checkout-btn');

    var ids        = Object.keys(cart);
    var totalQty   = 0;
    var totalPrice = 0;

    $list.find('.cart-real-item').remove();

    if (ids.length === 0) {
      $emptyMsg.show();
      $checkoutBtn.prop('disabled', true);
    } else {
      $emptyMsg.hide();
      $checkoutBtn.prop('disabled', false);

      ids.forEach(function(id) {
        var item = cart[id];
        if (!item) return;

        var subtotal = item.price * item.qty;
        totalQty    += item.qty;
        totalPrice  += subtotal;

        var row = '<li class="cart-real-item list-group-item">' +
          '<div class="d-flex justify-content-between align-items-start gap-2">' +
            '<div class="flex-grow-1">' +
              '<h6 class="mb-1">' + item.name + '</h6>' +
              '<small class="text-muted">$' + item.price.toFixed(2) + ' / ชิ้น</small>' +
            '</div>' +
            '<div class="d-flex align-items-center gap-1">' +
              '<button class="cart-qty-btn btn btn-sm btn-outline-secondary px-2 py-0" data-id="' + id + '" data-delta="-1">−</button>' +
              '<span class="px-2 fw-bold">' + item.qty + '</span>' +
              '<button class="cart-qty-btn btn btn-sm btn-outline-secondary px-2 py-0" data-id="' + id + '" data-delta="1">+</button>' +
            '</div>' +
            '<div class="text-end ms-2">' +
              '<span class="fw-bold">$' + subtotal.toFixed(2) + '</span><br>' +
              '<button class="cart-remove-btn btn btn-link btn-sm text-danger p-0" data-id="' + id + '">ลบ</button>' +
            '</div>' +
          '</div>' +
        '</li>';

        $list.append(row);
      });
    }

    $count.text(totalQty);
    $total.text('$' + totalPrice.toFixed(2));
    $headerTotal.text('$' + totalPrice.toFixed(2));
    $('.cart-badge').text(totalQty).toggle(totalQty > 0);
  };

  /* ── initCart (Event Delegation) ── */
  var initCart = function() {

    $(document).on('click', '.add-to-cart', function(e) {
      e.preventDefault();

      var $card     = $(this).closest('.product-item');
      var productId = String($(this).attr('data-id') || '');

      if (!productId || productId === 'undefined') {
        productId = $card.find('h3').text().trim().toLowerCase().replace(/\s+/g, '-');
      }
      if (!productId) return;

      var name  = $card.find('h3').text().trim();
      var price = parseFloat($card.find('.price').text().replace(/[^0-9.]/g, '')) || 0;
      var qty   = parseInt($(this).closest('.d-flex').find('.quantity-input, .input-number').val(), 10) || 1;

      if (cart[productId]) {
        cart[productId].qty += qty;
      } else {
        cart[productId] = { qty: qty, name: name, price: price };
      }

      updateCartUI();
      saveToLocalStorage();
      showToast(name + ' added to cart');

      var $badge = $('.cart-badge');
      $badge.addClass('pulse');
      setTimeout(function() { $badge.removeClass('pulse'); }, 400);

      var $btn = $(this);
      $btn.text('✓ Added').addClass('btn-success').removeClass('btn-outline-success');
      setTimeout(function() {
        $btn.text('Add to Cart').removeClass('btn-success').addClass('btn-outline-success');
      }, 1000);
    });

    $(document).on('click', '.cart-remove-btn', function() {
      var id = String($(this).data('id'));
      delete cart[id];
      updateCartUI();
      saveToLocalStorage();
    });

    $(document).on('click', '.cart-qty-btn', function() {
      var id    = String($(this).data('id'));
      var delta = parseInt($(this).data('delta'), 10);
      if (cart[id]) {
        cart[id].qty += delta;
        if (cart[id].qty <= 0) delete cart[id];
      }
      updateCartUI();
      saveToLocalStorage();
    });
  };

  /* ── Public API ── */
  FoodApp.cart = {
    init: initCart,
    load: loadCart,
  };

})(jQuery);
