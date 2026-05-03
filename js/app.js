(function($) {
  'use strict';

  /* ── UI helpers (ไม่เกี่ยวกับ product หรือ cart โดยตรง) ── */
  var initPreloader = function() {
    $(document).ready(function($) {
      $('body').addClass('preloader-site');
    });
    $(window).load(function() {
      $('.preloader-wrapper').fadeOut();
      $('body').removeClass('preloader-site');
    });
  };

  var initChocolat = function() {
    Chocolat(document.querySelectorAll('.image-link'), {
      imageSize: 'contain',
      loop: true,
    });
  };

  var initJarallax = function() {
    jarallax(document.querySelectorAll('.jarallax'));
    jarallax(document.querySelectorAll('.jarallax-keep-img'), { keepImg: true });
  };

  /* ── Document ready ── */
  $(document).ready(function() {
    initPreloader();
    initJarallax();
    initChocolat();

    FoodApp.products.requestProducts();
    FoodApp.cart.init();
    FoodApp.cart.load();

    /* Category filter buttons */
    $(document).on('click', '.filter-btn', function() {
      $('.filter-btn').removeClass('btn-primary active').addClass('btn-outline-secondary');
      $(this).removeClass('btn-outline-secondary').addClass('btn-primary active');
      FoodApp.products.setCategory($(this).data('cat'));
      FoodApp.products.render();
    });

    /* Sort */
    $('#sort-select').on('change', function() {
      FoodApp.products.setSort($(this).val());
      FoodApp.products.render();
    });

    /* Search submit */
    $('#search-form, #offcanvas-search-form').on('submit', function(e) {
      e.preventDefault();
      FoodApp.products.setSearch($(this).find('input[name="query"]').val().trim());
      FoodApp.products.setCategory('all');
      FoodApp.products.setSort('');
      $('.filter-btn').removeClass('btn-primary active').addClass('btn-outline-secondary');
      $('.filter-btn[data-cat="all"]').removeClass('btn-outline-secondary').addClass('btn-primary active');
      $('#sort-select').val('');
      FoodApp.products.render();
      $('html,body').animate({ scrollTop: $('#all-products').offset().top - 80 }, 400);

      var offEl = document.getElementById('offcanvasSearch');
      if (offEl) {
        var inst = bootstrap.Offcanvas.getInstance(offEl);
        if (inst) inst.hide();
      }
    });

    /* Real-time search (debounce 300ms) */
    var searchDebounceTimer;
    $('#desktop-search-input, #offcanvas-search-input').on('input', function() {
      var term = $(this).val().trim();
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(function() {
        FoodApp.products.setSearch(term);
        FoodApp.products.render();
        if (term) {
          $('html,body').animate({ scrollTop: $('#all-products').offset().top - 80 }, 300);
        }
      }, 300);
    });

    /* Clear search */
    $('#clear-search').on('click', function() {
      $('#desktop-search-input, #offcanvas-search-input').val('');
      FoodApp.products.setSearch('');
      FoodApp.products.render();
    });
  });

})(jQuery);
