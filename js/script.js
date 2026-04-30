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
  var PRODUCTS_JSON_PATH = 'products.json';
  var allProducts = [];

  var fetchProducts = async function(path) {
    var response = await fetch(path);
    if (!response.ok) throw new Error('Fetch failed: ' + response.status);
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
        '<a href="#" class="nav-link">Add to Cart</a>' +
      '</div></div>';
  };

  /* ── renderUI: writes into #search-results-section only ── */
  var renderUI = function(products) {
    if (!products) products = allProducts;
    var $section = $('#search-results-section');
    var $wrapper = $section.find('.swiper-wrapper');

    $section.show();

    if (products.length === 0) {
      $wrapper.html('<div class="p-4 text-muted">ไม่พบสินค้าที่ตรงกับการค้นหา</div>');
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
      var data = await fetchProducts(PRODUCTS_JSON_PATH);
      allProducts = data.products || [];
      initSwiper();
      initProductQty();
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  };

  var initJarallax = function() {
    jarallax(document.querySelectorAll(".jarallax"));
    jarallax(document.querySelectorAll(".jarallax-keep-img"), { keepImg: true });
  };

  /* ── Document ready ── */
  $(document).ready(function() {
    initPreloader();
    requestProducts();
    initJarallax();
    initChocolat();

    /* Search */
    $('#search-form, #offcanvas-search-form').on('submit', function(e) {
      e.preventDefault();
      var term = $(this).find('input[name="query"]').val().trim();
      var cat  = $('.search-bar select').val() || 'All Categories';
      renderUI(filterProducts(term, cat));

      var offEl = document.getElementById('offcanvasSearch');
      if (offEl) { var inst = bootstrap.Offcanvas.getInstance(offEl); if(inst) inst.hide(); }
    });

    /* Close search results section */
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
