(function($) {

  "use strict";

  /* ── Preloader ── */
  var initPreloader = function() {
    $(document).ready(function($) {
      $('body').addClass('preloader-site');
    });
    $(window).load(function() {
      $('.preloader-wrapper').fadeOut();
      $('body').removeClass('preloader-site');
    });
  };

  /* ── Chocolat lightbox ── */
  var initChocolat = function() {
    Chocolat(document.querySelectorAll('.image-link'), {
      imageSize: 'contain',
      loop: true,
    });
  };

  /* ── Swiper ── */
  var productSwiperInstances = [];

  var initSwiper = function() {
    new Swiper(".main-swiper", {
      speed: 500,
      pagination: { el: ".swiper-pagination", clickable: true },
    });

    new Swiper(".category-carousel", {
      slidesPerView: 6, spaceBetween: 30, speed: 500,
      navigation: { nextEl: ".category-carousel-next", prevEl: ".category-carousel-prev" },
      breakpoints: { 0:{slidesPerView:2}, 768:{slidesPerView:3}, 991:{slidesPerView:4}, 1500:{slidesPerView:6} }
    });

    new Swiper(".brand-carousel", {
      slidesPerView: 4, spaceBetween: 30, speed: 500,
      navigation: { nextEl: ".brand-carousel-next", prevEl: ".brand-carousel-prev" },
      breakpoints: { 0:{slidesPerView:2}, 768:{slidesPerView:2}, 991:{slidesPerView:3}, 1500:{slidesPerView:4} }
    });

    productSwiperInstances.forEach(function(s){ if(s && !s.destroyed) s.destroy(true,true); });
    productSwiperInstances = [];

    document.querySelectorAll('.products-carousel:not(#search-results-section .products-carousel)').forEach(function(el) {
      productSwiperInstances.push(new Swiper(el, {
        slidesPerView: 5, spaceBetween: 30, speed: 500,
        navigation: { nextEl: ".products-carousel-next", prevEl: ".products-carousel-prev" },
        breakpoints: { 0:{slidesPerView:1}, 768:{slidesPerView:3}, 991:{slidesPerView:4}, 1500:{slidesPerView:6} }
      }));
    });
  };

  /* ── Product qty +/- ── */
  var initProductQty = function() {
    $('.product-qty').each(function() {
      var $el = $(this);
      var $input = $el.find('input.quantity-input, input#quantity');
      $el.find('.quantity-right-plus').off('click').on('click', function(e) {
        e.preventDefault();
        $input.val((parseInt($input.val(),10)||0)+1);
      });
      $el.find('.quantity-left-minus').off('click').on('click', function(e) {
        e.preventDefault();
        var q = parseInt($input.val(),10)||0;
        if(q>0) $input.val(q-1);
      });
    });
  };

  /* ── Product data ── */
  var PRODUCTS_JSON_PATH = 'JSON/products.json';
  var allProducts = [];

  var fetchProducts = async function(path) {
    var response = await fetch(path);
    if (!response.ok) throw new Error('Fetch failed: ' + response.status + ' ' + response.statusText);
    return response.json();
  };

  var buildProductCard = function(product) {
    var stars = '';
    for (var i = 0; i < Math.floor(product.rating||0); i++) {
      stars += '<svg width="18" height="18" class="text-primary"><use xlink:href="#star-solid"></use></svg>';
    }
    return '<div class="product-item swiper-slide">' +
      '<a href="#" class="btn-wishlist"><svg width="24" height="24"><use xlink:href="#heart"></use></svg></a>' +
      '<figure><a href="index.html" title="'+product.name+'"><img src="'+product.image+'" class="tab-image" alt="'+product.name+'"></a></figure>' +
      '<h3>'+product.name+'</h3>' +
      '<span class="qty">'+(product.category||'Product')+'</span>' +
      '<span class="rating">'+stars+' '+(product.rating||0).toFixed(1)+'</span>' +
      '<span class="price">$'+(product.price||0).toFixed(2)+'</span>' +
      '<div class="d-flex align-items-center justify-content-between">' +
        '<div class="input-group product-qty">' +
          '<span class="input-group-btn"><button type="button" class="quantity-left-minus btn btn-danger btn-number"><svg width="16" height="16"><use xlink:href="#minus"></use></svg></button></span>' +
          '<input type="text" name="quantity" class="form-control input-number quantity-input" value="1">' +
          '<span class="input-group-btn"><button type="button" class="quantity-right-plus btn btn-success btn-number"><svg width="16" height="16"><use xlink:href="#plus"></use></svg></button></span>' +
        '</div>' +
        '<button class="add-to-cart btn btn-sm btn-outline-success" data-id="'+product.id+'">Add to Cart</button>' +
      '</div></div>';
  };

  /* ── renderUI ── */
  var renderUI = function(products) {
    var $section = $('#search-results-section');
    var $wrapper = $section.find('.swiper-wrapper');

    $section.show();

    if (!products || products.length === 0) {
      $wrapper.html('<div class="p-4 text-muted w-100">ไม่พบสินค้าที่ตรงกับการค้นหา</div>');
      $('#search-results-count').text('ไม่พบสินค้า');
      if (window._searchSwiper && !window._searchSwiper.destroyed) window._searchSwiper.destroy(true,true);
      return;
    }

    $wrapper.empty();
    products.forEach(function(p){ $wrapper.append(buildProductCard(p)); });
    $('#search-results-count').text('พบ ' + products.length + ' สินค้า');

    if (window._searchSwiper && !window._searchSwiper.destroyed) window._searchSwiper.destroy(true,true);
    window._searchSwiper = new Swiper('#search-results-section .products-carousel', {
      slidesPerView: 5, spaceBetween: 30, speed: 500,
      navigation: { nextEl: '#search-results-section .products-carousel-next', prevEl: '#search-results-section .products-carousel-prev' },
      breakpoints: { 0:{slidesPerView:1}, 768:{slidesPerView:3}, 991:{slidesPerView:4}, 1500:{slidesPerView:5} }
    });

    initProductQty();
    $('html,body').animate({ scrollTop: $section.offset().top - 80 }, 400);
  };

  /* ── Filter ── */
  var filterProducts = function(searchTerm, category) {
    console.log('filterProducts called. allProducts.length =', allProducts.length, '| term:', searchTerm, '| cat:', category);
    return allProducts.filter(function(p) {
      var matchName = !searchTerm ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
      var matchCat = !category || category === 'All Categories' || p.category === category;
      return matchName && matchCat;
    });
  };

  /* ── Load products on start ── */
  var requestProducts = async function() {
    try {
      console.log('Fetching products from:', PRODUCTS_JSON_PATH);
      var data = await fetchProducts(PRODUCTS_JSON_PATH);
      allProducts = data.products || [];
      console.log('Loaded', allProducts.length, 'products');
      initSwiper();
      initProductQty();
      syncStaticPrices();
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  };

  /* ── Sync prices/ratings on static HTML product cards ── */
  var syncStaticPrices = function() {
    // วนทุก .product-item ที่ไม่ได้ render โดย JS (ไม่มี data-synced)
    $('.product-item').not('[data-synced]').each(function() {
      var $card = $(this);
      var name = $card.find('h3').text().trim();
      var product = allProducts.find(function(p) {
        return p.name.toLowerCase() === name.toLowerCase();
      });
      if (!product) return;

      // อัปเดตราคา
      $card.find('.price').text('$' + product.price.toFixed(2));

      // อัปเดต rating
      var stars = '';
      for (var i = 0; i < Math.floor(product.rating || 0); i++) {
        stars += '<svg width="18" height="18" class="text-primary"><use xlink:href="#star-solid"></use></svg>';
      }
      $card.find('.rating').html(stars + ' ' + (product.rating || 0).toFixed(1));

      // ใส่ data-id บน add-to-cart button ด้วย
      $card.find('.add-to-cart').attr('data-id', product.id);

      $card.attr('data-synced', '1');
    });
  };

  var initJarallax = function() {
    jarallax(document.querySelectorAll(".jarallax"));
    jarallax(document.querySelectorAll(".jarallax-keep-img"), { keepImg: true });
  };


  /* ── Cart (Event Delegation) ── */
  var cart = {}; // { key: { qty, name, price } }

  var initCart = function() {

    $(document).on('click', '.add-to-cart', function(e) {
      e.preventDefault();

      var $card = $(this).closest('.product-item');

      // ใช้ data-id ถ้ามี ไม่งั้นใช้ชื่อสินค้าเป็น key
      var productId = String($(this).attr('data-id') || '');
      if (!productId || productId === 'undefined') {
        productId = $card.find('h3').text().trim().toLowerCase().replace(/\s+/g, '-');
      }
      if (!productId) return;

      // ดึงชื่อและราคาจาก DOM โดยตรง ไม่ต้องรอ JSON
      var name  = $card.find('h3').text().trim();
      var price = parseFloat($card.find('.price').text().replace(/[^0-9.]/g, '')) || 0;
      var qty   = parseInt($(this).closest('.d-flex').find('.quantity-input, .input-number').val(), 10) || 1;

      if (cart[productId]) {
        cart[productId].qty += qty;
      } else {
        cart[productId] = { qty: qty, name: name, price: price };
      }

      updateCartUI();

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
    });

    $(document).on('click', '.cart-qty-btn', function() {
      var id    = String($(this).data('id'));
      var delta = parseInt($(this).data('delta'), 10);
      if (cart[id]) {
        cart[id].qty += delta;
        if (cart[id].qty <= 0) delete cart[id];
      }
      updateCartUI();
    });
  };

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

  /* ── Document ready ── */
  $(document).ready(function() {
    initPreloader();
    requestProducts();
    initCart();
    initJarallax();
    initChocolat();

    /* Search */
    $('#search-form, #offcanvas-search-form').on('submit', function(e) {
      e.preventDefault();
      var term = $(this).find('input[name="query"]').val().trim();
      var cat  = $('.search-bar select').val() || 'All Categories';
      console.log('Search submitted. term:', term, '| cat:', cat, '| allProducts:', allProducts.length);
      renderUI(filterProducts(term, cat));

      var offEl = document.getElementById('offcanvasSearch');
      if (offEl) { var inst = bootstrap.Offcanvas.getInstance(offEl); if(inst) inst.hide(); }
    });

    /* Close search results */
    $(document).on('click', '#close-search-results', function() {
      $('#search-results-section').hide();
      $('#desktop-search-input, #offcanvas-search-input').val('');
      $('.search-bar select').val('All Categories');
      $('#search-results-count').text('');
    });

    /* Clear */
    $('#clear-search').on('click', function() {
      $('#desktop-search-input, #offcanvas-search-input').val('');
      $('.search-bar select').val('All Categories');
      $('#search-results-section').hide();
      $('#search-results-count').text('');
    });
  });

})(jQuery);