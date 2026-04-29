(function($) {

  "use strict";

  var initPreloader = function() {
    $(document).ready(function($) {
    var Body = $('body');
        Body.addClass('preloader-site');
    });
    $(window).load(function() {
        $('.preloader-wrapper').fadeOut();
        $('body').removeClass('preloader-site');
    });
  }

  // init Chocolat light box
	var initChocolat = function() {
		Chocolat(document.querySelectorAll('.image-link'), {
		  imageSize: 'contain',
		  loop: true,
		})
	}

  var initSwiper = function() {

    var swiper = new Swiper(".main-swiper", {
      speed: 500,
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
    });

    var category_swiper = new Swiper(".category-carousel", {
      slidesPerView: 6,
      spaceBetween: 30,
      speed: 500,
      navigation: {
        nextEl: ".category-carousel-next",
        prevEl: ".category-carousel-prev",
      },
      breakpoints: {
        0: {
          slidesPerView: 2,
        },
        768: {
          slidesPerView: 3,
        },
        991: {
          slidesPerView: 4,
        },
        1500: {
          slidesPerView: 6,
        },
      }
    });

    var brand_swiper = new Swiper(".brand-carousel", {
      slidesPerView: 4,
      spaceBetween: 30,
      speed: 500,
      navigation: {
        nextEl: ".brand-carousel-next",
        prevEl: ".brand-carousel-prev",
      },
      breakpoints: {
        0: {
          slidesPerView: 2,
        },
        768: {
          slidesPerView: 2,
        },
        991: {
          slidesPerView: 3,
        },
        1500: {
          slidesPerView: 4,
        },
      }
    });

    var products_swiper = new Swiper(".products-carousel", {
      slidesPerView: 5,
      spaceBetween: 30,
      speed: 500,
      navigation: {
        nextEl: ".products-carousel-next",
        prevEl: ".products-carousel-prev",
      },
      breakpoints: {
        0: {
          slidesPerView: 1,
        },
        768: {
          slidesPerView: 3,
        },
        991: {
          slidesPerView: 4,
        },
        1500: {
          slidesPerView: 6,
        },
      }
    });
  }

  var initProductQty = function(){

    $('.product-qty').each(function(){

      var $el_product = $(this);
      var quantity = 0;
      var $quantityInput = $el_product.find('input.quantity-input, input#quantity');

      $el_product.find('.quantity-right-plus').click(function(e){
          e.preventDefault();
          var quantity = parseInt($quantityInput.val(), 10) || 0;
          $quantityInput.val(quantity + 1);
      });

      $el_product.find('.quantity-left-minus').click(function(e){
          e.preventDefault();
          var quantity = parseInt($quantityInput.val(), 10) || 0;
          if(quantity > 0){
            $quantityInput.val(quantity - 1);
          }
      });

    });

  }

  // requestProducts() follows the sequence diagram:
  // 1. requestProducts() starts the data flow
  // 2. fetchProducts(path) fetches the JSON file from the server
  // 3. renderUI(products) updates the DOM with the fetched data
  var PRODUCTS_JSON_PATH = 'JSON/products.json';
  var allProducts = []; // Global storage for full product list

  var requestProducts = async function() {
    try {
      var productData = await fetchProducts(PRODUCTS_JSON_PATH);
      allProducts = productData.products || [];
      renderUI(allProducts);

      // After the UI is rendered, initialize carousel and quantity controls
      initSwiper();
      initProductQty();
    } catch (error) {
      console.error('Failed to load product data:', error);
    }
  }

  var fetchProducts = async function(path) {
    // fetch(path) performs the network request and returns parsed JSON
    var response = await fetch(path);
    if (!response.ok) {
      throw new Error('Unable to fetch product JSON: ' + response.status + ' ' + response.statusText);
    }
    return response.json();
  }

  var renderUI = function(products) {
    // renderUI converts the fetched product objects into DOM nodes
    // If no products provided, use allProducts
    if (!products) {
      products = allProducts;
    }
    var $wrapper = $('.products-carousel .swiper-wrapper');
    if ($wrapper.length === 0) {
      console.warn('No product carousel container found to render UI.');
      return;
    }

    $wrapper.empty();

    products.forEach(function(product) {
      var ratingStars = '';
      for (var i = 0; i < Math.floor(product.rating || 0); i++) {
        ratingStars += '<svg width="24" height="24" class="text-primary"><use xlink:href="#star-solid"></use></svg>';
      }

      var productHtml = '' +
        '<div class="product-item swiper-slide">' +
          '<a href="#" class="btn-wishlist"><svg width="24" height="24"><use xlink:href="#heart"></use></svg></a>' +
          '<figure>' +
            '<a href="index.html" title="' + product.name + '">' +
              '<img src="' + product.image + '" class="tab-image" alt="' + product.name + '">' +
            '</a>' +
          '</figure>' +
          '<h3>' + product.name + '</h3>' +
          '<span class="qty">' + (product.category || 'Product') + '</span>' +
          '<span class="rating">' + ratingStars + ' ' + (product.rating || 0).toFixed(1) + '</span>' +
          '<span class="price">$' + (product.price || 0).toFixed(2) + '</span>' +
          '<div class="d-flex align-items-center justify-content-between">' +
            '<div class="input-group product-qty">' +
              '<span class="input-group-btn">' +
                '<button type="button" class="quantity-left-minus btn btn-danger btn-number" data-type="minus">' +
                  '<svg width="16" height="16"><use xlink:href="#minus"></use></svg>' +
                '</button>' +
              '</span>' +
              '<input type="text" name="quantity" class="form-control input-number quantity-input" value="1">' +
              '<span class="input-group-btn">' +
                '<button type="button" class="quantity-right-plus btn btn-success btn-number" data-type="plus">' +
                  '<svg width="16" height="16"><use xlink:href="#plus"></use></svg>' +
                '</button>' +
              '</span>' +
            '</div>' +
            '<a href="#" class="nav-link">Add to Cart <iconify-icon icon="uil:shopping-cart"></iconify-icon></a>' +
          '</div>' +
        '</div>';

      $wrapper.append(productHtml);
    });
  }

  var filterProducts = function(searchTerm, category) {
    return allProducts.filter(function(product) {
      var matchesSearch = !searchTerm || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
      var matchesCategory = category === 'All Categories' || product.category === category;
      return matchesSearch && matchesCategory;
    });
  }

  // init jarallax parallax
  var initJarallax = function() {
    jarallax(document.querySelectorAll(".jarallax"));

    jarallax(document.querySelectorAll(".jarallax-keep-img"), {
      keepImg: true,
    });
  }

  // document ready
  $(document).ready(function() {
    
    initPreloader();
    requestProducts();
    initJarallax();
    initChocolat();

    // Handle search form submission for desktop and offcanvas search
    $('#search-form, #offcanvas-search-form').on('submit', function(e) {
      e.preventDefault();
      var searchTerm = $(this).find('input[name="query"]').val().trim();
      var category = $('.search-bar select').val() || 'All Categories';
      var filteredProducts = filterProducts(searchTerm, category);
      renderUI(filteredProducts);
      // Re-initialize swiper and qty after filtering
      initSwiper();
      initProductQty();

      var offcanvasEl = document.getElementById('offcanvasSearch');
      if (offcanvasEl) {
        var offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvasEl);
        if (offcanvasInstance) {
          offcanvasInstance.hide();
        }
      }
    });

    // Handle clear search
    $('#clear-search').on('click', function() {
      $('#desktop-search-input, #offcanvas-search-input').val('');
      $('.search-bar select').val('All Categories');
      renderUI(allProducts);
      initSwiper();
      initProductQty();
    });

  }); // End of a document

})(jQuery);