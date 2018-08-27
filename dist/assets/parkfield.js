class Parkfield {
  constructor(){
    this.initGlobal = this.initGlobal.bind(this);
    this.initHomepage = this.initHomepage.bind(this);
    this.initCollectionpage = this.initCollectionpage.bind(this);
    this.initProductpage = this.initProductpage.bind(this);
  }
  initGlobal(){
    this.initHeader();
    this.initMobileMenu();
    this.initSideCart();
    this.initQuickAdd();
    this.initQuickView();
  }
  //Homepage
  initHomepage(){
    this.initHomepageHero();
    this.initHomepageAbout();
    this.initHomepageFormulaSlider();
  }
  initHomepageHero(){
    $('.js-heroSlider').slick({
      arrows: false,
      dots: true,
      appendDots:'.js-heroDots',
      touch: true
    });
  }
  initHomepageAbout(){
    var rellax = new Rellax('.rellax');
  }
  initHomepageFormulaSlider(){
    $('.js-formulaSlider').slick({
      slidesToShow:4,
      prevArrow:'.js-formulaArrow--left',
      nextArrow:'.js-formulaArrow--right',
      rows: 0,
      responsive:[
        {
          breakpoint:1000,
          settings:{
            slidesToShow: 3
          }
        },
        {
          breakpoint:800,
          settings:{
            slidesToShow: 2
          }
        }
      ]
    });
    
    $('.js-formulaControl').click(function(){
      var formula = $(this).data('formula');
      $('.js-formulaIngredient[data-formula!="'+formula+'"], .js-formulaDescription[data-formula!="'+formula+'"]').addClass('hidden');
      $('.js-formulaIngredient[data-formula="'+formula+'"], .js-formulaDescription[data-formula="'+formula+'"]').removeClass('hidden');
      $('.js-formulaSlider').slick('slickUnfilter');
      $('.js-formulaSlider').slick('slickFilter','[data-formula="'+formula+'"]');
    
      $('.js-formulaControl').removeClass('active');
      $(this).addClass('active');

      var collectionURL = $(this).data('url');
      $('.js-formulaMobileLink').attr('href', '/collections/' + collectionURL);
    });
    
    $('.js-formulaControl').first().trigger('click');
  }
  //Collection
  initCollectionpage(){
    this.initCollectionFilter();
  }
  initCollectionFilter(){
    var filterSelects = $('.js-filterSelect');

    filterSelects.change(function(){
      var rootUrl = '{{shop.url}}'+'{{collection.url}}';
      if('{{collection.url}}' == ''){
        rootUrl = '{{shop.url}}'+'/collections/all'
      }
      var urlSegment = '';
      filterSelects.each(function() {
        var currentValue = $(this).val();
        if(urlSegment == ''){
          if(currentValue != ''){
            urlSegment+='/'+currentValue;
          }
        }else{
          if(currentValue != ''){
            urlSegment+='+'+currentValue;
          }
        }
      });
      window.location = rootUrl+urlSegment;
    });
  }
  //Product Page
  initProductpage(){
    this.initProductpageImageSlider();
    this.initProductpageForm();
    this.initProductPageSubscribeForm();
  }
  initProductpageImageSlider(){
    $('.js-photoSlider').slick({
      arrows: false,
      dots: true,
      appendDots:'.js-photoDots',
      touch: true
    });
  }
  initProductpageForm(){
    //Form Tabs
    $('.js-formContentControl').click(function(){
      var index = $(this).data('tab');
      $('.js-formContent').hide();
      $('.js-formContent[data-content="'+index+'"]').show();

      $('.js-formContentControl').removeClass('active');
      $(this).addClass('active');
    });

    //Quantity Change Buttons
    $('.js-quantityChange').click(function(){
      var changeAmount = $(this).data('change');
      var currentAmount = parseInt($('.js-quantity').val());
      if(changeAmount + currentAmount >= 1){
        $('.js-quantity').val(changeAmount + currentAmount);
      }
    });

    //Add to Cart Logic
    $('.js-productAdd').click(function(){
      var button = $('.js-productAdd');
      var quantity = $('.js-quantity').val();
      var variantId = $('.js-variant').val();
      CartJS.addItem(variantId, quantity, 
      {
        "success": function(data, textStatus, jqXHR) {
          button.addClass('Btn--added');
          button.html('<span class="ProductForm__add-text">Added <i class="fas fa-check"></i></span>');
          setTimeout(function(){
            button.removeClass('Btn--added');
            button.html('Purchase');
          }, 3000);
        },
        "error": function(jqXHR, textStatus, errorThrown) {
          console.log(errorThrown);
        }
      });
    });

    this.initQuickAdd();
  }
  initProductPageSubscribeForm(){
    $(document).ready(function(){
      $('.js-shaveOption').click(function(){
        var option = $(this).data('option');

        $('.js-shaveOption').removeClass('active');
        $('.js-subscribeDescription').addClass('active');
        $('.js-subscribeForm').show();
        $(this).addClass('active');
        
        //Update Interval
        var subscribeTimeText = $('.js-subscribeTime');
        var intervalSelect = $('.rc_select__frequency');
        var intervalOption = intervalSelect.find('option:nth-child('+option+')');
        
        subscribeTimeText.text(intervalOption.text());
        intervalSelect.val(intervalOption.val());

        //Update Prices
        var time = 52/intervalOption.val();

        var subscribePrice = $('#rc_price_autodeliver').text();
        var originalPrice = $('.js-originalProductPrice').text();
        
        //Amount to pay every interval
        $('.js-subscribePrice').text(subscribePrice);
        
        subscribePrice = parseInt(subscribePrice.replace(/\D+/g, ''))*time;
        originalPrice = parseInt(originalPrice.replace(/\D+/g, ''))*time;

        //Amount Saved
        $('.js-subscribeSavings').text(Shopify.formatMoney(originalPrice - subscribePrice));

      });
    });
  }
  //Misc
  initQuickAdd(){
    //Quickadd Button Logic for Collection Products
    $('.js-quickAdd').click(function(){
      var button = $(this);
      var cartLink = button.next();
      var variantId = button.data('variant-id');
      CartJS.addItem(variantId, 1, {}, {
        // Define a success callback to display a success message.
        "success": function(data, textStatus, jqXHR) {
          button.addClass('Btn--added');
          button.html('<span class="CollectionProduct__button-text">Added <i class="fas fa-check"></i></span>');
          cartLink.addClass('active');
          setTimeout(function(){
            button.removeClass('Btn--added');
            cartLink.removeClass('active');
            button.html('Buy');
          }, 5000);
        },
        "error": function(jqXHR, textStatus, errorThrown) {
          console.log(jqXHR);
        }
      });
    });
  }
  
  initQuickView(){
    var clickedButton;
    function updateQuickViewContent(){
      //Takes the info thats in quickview-info.liquid and pastes it into the popup
      var info = clickedButton.siblings('.js-quickview-info');
      var popup = $('.js-quickviewPopup');
      var quickviewContent = popup.find('.js-content');
      quickviewContent.empty();
      quickviewContent.append(info.clone());

      //Apply Add Clickhandler
      $('.js-quickview-add').click(function(){
        var button = $(this);
        var cartLink = button.next();
        var variantId = button.data('variant-id');
        var quantity = $(this).closest('.js-form').find('.js-state').val();
        CartJS.addItem(variantId, quantity, {}, {
          // Define a success callback to display a success message.
          "success": function(data, textStatus, jqXHR) {
            button.addClass('Btn--added');
            button.html('<span class="CollectionProduct__button-text">Added <i class="fas fa-check"></i></span>');
            cartLink.addClass('active');
            setTimeout(function(){
              button.removeClass('Btn--added');
              button.html('Buy');
              cartLink.removeClass('active');
            }, 5000);
          },
          "error": function(jqXHR, textStatus, errorThrown) {
            console.log(jqXHR);
          }
        });
      });

      var quantity = $('.js-quickviewPopup .js-quickview-quantity .js-state');
      var quantityIncrement = $('.js-quickviewPopup .js-quickview-quantity .js-increment');
      var quantityDecrement = $('.js-quickviewPopup .js-quickview-quantity .js-decrement');
      //Apply Quantity Clickhandler
      quantityIncrement.click(function(){
        var currentQuantity = parseInt(quantity.val());
        quantity.val(currentQuantity + 1);
      });

      quantityDecrement.click(function(){
        var currentQuantity = parseInt(quantity.val());
        if(currentQuantity > 0){
          quantity.val(currentQuantity - 1);
        }
      });
    }

    var quickviewPopup = new Focus('.js-quickviewPopup',{
      showCallback: updateQuickViewContent
    });

    $('.js-quickviewPopupTrigger').click(function(){
      clickedButton = $(this);
      quickviewPopup.show();
    });

    //Closing Popup Logic
    $('.js-quickviewPopup .js-overlay').click(function(){
      quickviewPopup.hide();
    });
    
    $('.js-quickviewClose').click(function(e){
      e.preventDefault();
      quickviewPopup.hide();
    });
  }
  initHeader(){
    $('.js-headerSearch').click(function(){
      $(this).parent().toggleClass('active');
    });
  }
  initMobileMenu(){
    $('.js-mobileNavTrigger').click(function(){
      $(this).removeClass('active');
      $('.js-mobileNav').addClass('active');
    });

    $('.js-mobileNavClose').click(function(){
      $('.js-mobileNav').removeClass('active');
    });

    //Dropdown Logic
    $('.js-mobileMenuLinks').click(function(){
      var dropdown = $(this);
      var allDropdowns = $('.js-mobileMenuLinks');
      var allRegularLinks = $('.js-regularMobileLink');
      var navigation = $('.MobileNav__navigation');
      var backButton = $('.js-mobileBack');
      var decoration = $('.js-mobileDecoration');

      if(dropdown.hasClass('active')){
        navigation.fadeOut('fast', function(){
          backButton.hide();
          decoration.show();
          dropdown.removeClass('active');
          allDropdowns.show();
          allRegularLinks.show();
          navigation.fadeIn();
        });
      }else{
        navigation.fadeOut('fast', function(){
          backButton.css('display','block');
          decoration.hide();
          dropdown.addClass('active');
          allDropdowns.hide();
          allRegularLinks.hide();
          dropdown.show();
          navigation.fadeIn();
        });
      }
    });
    
    $('.js-mobileBack').click(function(e){
      e.preventDefault();
      var allDropdowns = $('.js-mobileMenuLinks');
      var allRegularLinks = $('.js-regularMobileLink');
      var navigation = $('.MobileNav__navigation');
      var backButton = $('.js-mobileBack');
      var decoration = $('.js-mobileDecoration');
      
      navigation.fadeOut('fast', function(){
        backButton.hide();
        decoration.show();
        allDropdowns.removeClass('active');
        allDropdowns.show();
        allRegularLinks.show();
        navigation.fadeIn();
      });
    });

    //Search Logic
    $('.js-mobileSearchToggle').click(function(){
      $('.js-mobileNavSearch').toggleClass('active');
      $(this).toggleClass('active');
    });
  }
  initSideCart(){
    var cartPopup = new Focus('.js-sideCart',{
      bodyClass:'fixed'
    });

    $('.js-cartTrigger').click(function(e){
      e.preventDefault();
      cartPopup.show();
      $('.js-mobileNavTrigger').delay(3000).addClass('active');
    });
    
    //Closing Popup Logic
    $('.js-sideCart .js-overlay').click(function(){
      cartPopup.hide();
    });
  
    $('.js-cartClose').click(function(e){
      e.preventDefault();
      $('.js-mobileNavTrigger').removeClass('active');
      cartPopup.hide();
    });
  }
}