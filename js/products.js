(function($) {
  'use strict';

  window.FoodApp = window.FoodApp || {};

  /* ── State ── */
  var allProducts    = [];
  var currentCategory = 'all';
  var currentSort     = '';
  var currentSearch   = '';

  var PRODUCTS_JSON_PATH = 'http://localhost:3000/api/products';

  /* ── Swiper ── */
  var productSwiperInstances = [];

  var initSwiper = function() {
    new Swiper('.main-swiper', {
      speed: 500,
      pagination: { el: '.swiper-pagination', clickable: true },
    });

    new Swiper('.category-carousel', {
      slidesPerView: 6, spaceBetween: 30, speed: 500,
      navigation: { nextEl: '.category-carousel-next', prevEl: '.category-carousel-prev' },
      breakpoints: { 0:{slidesPerView:2}, 768:{slidesPerView:3}, 991:{slidesPerView:4}, 1500:{slidesPerView:6} }
    });

    new Swiper('.brand-carousel', {
      slidesPerView: 4, spaceBetween: 30, speed: 500,
      navigation: { nextEl: '.brand-carousel-next', prevEl: '.brand-carousel-prev' },
      breakpoints: { 0:{slidesPerView:2}, 768:{slidesPerView:2}, 991:{slidesPerView:3}, 1500:{slidesPerView:4} }
    });

    productSwiperInstances.forEach(function(s) { if (s && !s.destroyed) s.destroy(true, true); });
    productSwiperInstances = [];

    document.querySelectorAll('.products-carousel:not(#search-results-section .products-carousel)').forEach(function(el) {
      productSwiperInstances.push(new Swiper(el, {
        slidesPerView: 5, spaceBetween: 30, speed: 500,
        navigation: { nextEl: '.products-carousel-next', prevEl: '.products-carousel-prev' },
        breakpoints: { 0:{slidesPerView:1}, 768:{slidesPerView:3}, 991:{slidesPerView:4}, 1500:{slidesPerView:6} }
      }));
    });
  };

  /* ── Product qty +/- ── */
  var initProductQty = function() {
    $('.product-qty').each(function() {
      var $el    = $(this);
      var $input = $el.find('input.quantity-input, input#quantity');
      $el.find('.quantity-right-plus').off('click').on('click', function(e) {
        e.preventDefault();
        $input.val((parseInt($input.val(), 10) || 0) + 1);
      });
      $el.find('.quantity-left-minus').off('click').on('click', function(e) {
        e.preventDefault();
        var q = parseInt($input.val(), 10) || 0;
        if (q > 0) $input.val(q - 1);
      });
    });
  };

  /* ── Fetch ── */
  var fetchProducts = async function(path) {
    var response = await fetch(path);
    if (!response.ok) throw new Error('Fetch failed: ' + response.status + ' ' + response.statusText);
    return response.json();
  };

  /* ── Build card (Swiper/search result) ── */
  var buildProductCard = function(product) {
    var stars = '';
    for (var i = 0; i < Math.floor(product.rating || 0); i++) {
      stars += '<svg width="18" height="18" class="text-primary"><use xlink:href="#star-solid"></use></svg>';
    }
    return '<div class="product-item swiper-slide">' +
      '<a href="#" class="btn-wishlist"><svg width="24" height="24"><use xlink:href="#heart"></use></svg></a>' +
      '<figure><a href="index.html" title="' + product.name + '">' +
        '<img src="' + product.image + '" class="tab-image" alt="' + product.name + '">' +
      '</a></figure>' +
      '<h3>' + product.name + '</h3>' +
      '<span class="qty">' + (product.category || 'Product') + '</span>' +
      '<span class="rating">' + stars + ' ' + (product.rating || 0).toFixed(1) + '</span>' +
      '<span class="price">$' + (product.price || 0).toFixed(2) + '</span>' +
      '<div class="d-flex align-items-center justify-content-between">' +
        '<div class="input-group product-qty">' +
          '<span class="input-group-btn"><button type="button" class="quantity-left-minus btn btn-danger btn-number"><svg width="16" height="16"><use xlink:href="#minus"></use></svg></button></span>' +
          '<input type="text" name="quantity" class="form-control input-number quantity-input" value="1">' +
          '<span class="input-group-btn"><button type="button" class="quantity-right-plus btn btn-success btn-number"><svg width="16" height="16"><use xlink:href="#plus"></use></svg></button></span>' +
        '</div>' +
        '<button class="add-to-cart btn btn-sm btn-outline-success" data-id="' + product.id + '">Add to Cart</button>' +
      '</div></div>';
  };

  /* ── Build card (main grid) ── */
  var buildProductGridCard = function(product) {
    var badge = product.price < 25
      ? '<span class="badge bg-success position-absolute m-3">Sale</span>'
      : '';
    var stars = '';
    for (var i = 0; i < Math.floor(product.rating || 0); i++) {
      stars += '<svg width="18" height="18" class="text-warning"><use xlink:href="#star-solid"></use></svg>';
    }
    return '<div class="col">' +
      '<div class="product-item h-100 d-flex flex-column">' +
        badge +
        '<a href="#" class="btn-wishlist"><svg width="24" height="24"><use xlink:href="#heart"></use></svg></a>' +
        '<figure><a href="index.html" title="' + product.name + '">' +
          '<img src="' + product.image + '" class="tab-image" alt="' + product.name + '" onerror="this.src=\'images/thumb-bananas.png\'">' +
        '</a></figure>' +
        '<h3 class="flex-grow-1">' + product.name + '</h3>' +
        '<span class="badge bg-light text-secondary border mb-1">' + product.category + '</span>' +
        '<span class="rating d-block mb-1">' + stars + ' <small class="text-muted">' + (product.rating || 0).toFixed(1) + '</small></span>' +
        '<span class="price d-block mb-2">$' + (product.price || 0).toFixed(2) + '</span>' +
        '<div class="d-flex align-items-center justify-content-between mt-auto">' +
          '<div class="input-group product-qty" style="max-width:110px">' +
            '<span class="input-group-btn"><button type="button" class="quantity-left-minus btn btn-danger btn-sm btn-number"><svg width="14" height="14"><use xlink:href="#minus"></use></svg></button></span>' +
            '<input type="text" name="quantity" class="form-control form-control-sm input-number quantity-input text-center" value="1">' +
            '<span class="input-group-btn"><button type="button" class="quantity-right-plus btn btn-success btn-sm btn-number"><svg width="14" height="14"><use xlink:href="#plus"></use></svg></button></span>' +
          '</div>' +
          '<button class="add-to-cart btn btn-sm btn-outline-success" data-id="' + product.id + '">Add to Cart</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  };

  /* ── renderUI (search results swiper) ── */
  var renderUI = function(products) {
    var $section = $('#search-results-section');
    var $wrapper = $section.find('.swiper-wrapper');

    $section.show();

    if (!products || products.length === 0) {
      $wrapper.html('<div class="p-4 text-muted w-100">ไม่พบสินค้าที่ตรงกับการค้นหา</div>');
      $('#search-results-count').text('ไม่พบสินค้า');
      if (window._searchSwiper && !window._searchSwiper.destroyed) window._searchSwiper.destroy(true, true);
      return;
    }

    $wrapper.empty();
    products.forEach(function(p) { $wrapper.append(buildProductCard(p)); });
    $('#search-results-count').text('พบ ' + products.length + ' สินค้า');

    if (window._searchSwiper && !window._searchSwiper.destroyed) window._searchSwiper.destroy(true, true);
    window._searchSwiper = new Swiper('#search-results-section .products-carousel', {
      slidesPerView: 5, spaceBetween: 30, speed: 500,
      navigation: { nextEl: '#search-results-section .products-carousel-next', prevEl: '#search-results-section .products-carousel-prev' },
      breakpoints: { 0:{slidesPerView:1}, 768:{slidesPerView:3}, 991:{slidesPerView:4}, 1500:{slidesPerView:5} }
    });

    initProductQty();
    $('html,body').animate({ scrollTop: $section.offset().top - 80 }, 400);
  };

  /* ── filterProducts ── */
  var filterProducts = function(searchTerm, category) {
    return allProducts.filter(function(p) {
      var matchName = !searchTerm ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
      var matchCat = !category || category === 'All Categories' || p.category === category;
      return matchName && matchCat;
    });
  };

  /* ── renderAllProducts (main grid) ── */
  var renderAllProducts = function() {
    var list = allProducts.slice();

    if (currentSearch) {
      var term = currentSearch.toLowerCase();
      list = list.filter(function(p) {
        return p.name.toLowerCase().includes(term) ||
               (p.description && p.description.toLowerCase().includes(term)) ||
               p.category.toLowerCase().includes(term);
      });
    }

    if (currentCategory !== 'all') {
      list = list.filter(function(p) { return p.category === currentCategory; });
    }

    if (currentSort === 'price_asc')  list.sort(function(a, b) { return a.price - b.price; });
    if (currentSort === 'price_desc') list.sort(function(a, b) { return b.price - a.price; });
    if (currentSort === 'rating')     list.sort(function(a, b) { return b.rating - a.rating; });

    var $grid = $('#all-products-grid');
    $grid.empty();

    if (list.length === 0) {
      $grid.html('<div class="col-12 text-center py-5 text-muted"><h5>ไม่พบสินค้าที่ตรงกับการค้นหา</h5></div>');
    } else {
      list.forEach(function(p) { $grid.append(buildProductGridCard(p)); });
    }

    var label = currentSearch
      ? 'ค้นหา "' + currentSearch + '" พบ ' + list.length + ' สินค้า'
      : 'แสดง ' + list.length + ' จาก ' + allProducts.length + ' สินค้า';
    $('#product-count').text(label);
    initProductQty();
  };

  /* ── syncCarouselPrices ── */
  var syncCarouselPrices = function() {
    $('.product-item').not('[data-synced]').each(function() {
      var $card   = $(this);
      var name    = $card.find('h3').text().trim();
      var product = allProducts.find(function(p) {
        return p.name.toLowerCase() === name.toLowerCase();
      });
      if (!product) return;
      $card.find('.price').text('$' + product.price.toFixed(2));
      $card.find('.add-to-cart').attr('data-id', product.id);
      $card.attr('data-synced', '1');
    });
  };

  /* ── buildCategoryFilters ── */
  var buildCategoryFilters = function() {
    var categories = [...new Set(allProducts.map(function(p) { return p.category; }))].sort();
    var $filters = $('#category-filters');
    categories.forEach(function(cat) {
      $filters.append(
        '<button class="btn btn-sm btn-outline-secondary filter-btn" data-cat="' + cat + '">' + cat + '</button>'
      );
    });
  };

  /* ── requestProducts ── */
  var requestProducts = async function() {
    var $grid = $('#all-products-grid');
    var skeletonHTML = '';
    for (var s = 0; s < 8; s++) {
      skeletonHTML +=
        '<div class="col">' +
          '<div class="skeleton-card">' +
            '<div class="skeleton-img"></div>' +
            '<div class="skeleton-line"></div>' +
            '<div class="skeleton-line short"></div>' +
            '<div class="skeleton-line xshort"></div>' +
          '</div>' +
        '</div>';
    }
    $grid.html(skeletonHTML);
    try {
      var data = await fetchProducts(PRODUCTS_JSON_PATH);
      allProducts = data.data || data.products || [];
      buildCategoryFilters();
      renderAllProducts();
      syncCarouselPrices();
      initSwiper();
      initProductQty();
    } catch (err) {
      console.error('Failed to load products:', err);
      $grid.html(
        '<div class="col-12 text-center py-5 text-danger">' +
          '<h5>โหลดสินค้าไม่สำเร็จ กรุณาลองใหม่อีกครั้ง</h5>' +
        '</div>'
      );
    }
  };

  /* ── Public API ── */
  FoodApp.products = {
    requestProducts: requestProducts,
    render:          renderAllProducts,
    renderUI:        renderUI,
    filter:          filterProducts,
    setCategory:     function(cat) { currentCategory = cat; },
    setSort:         function(s)   { currentSort = s; },
    setSearch:       function(s)   { currentSearch = s; },
    getSearch:       function()    { return currentSearch; },
  };

})(jQuery);
