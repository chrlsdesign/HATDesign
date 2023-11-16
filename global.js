// initial
let cmsItems, currentItem, nextItem, nextItemIndex;

//Load Images
function loadImages(){
  $('.nav').imagesLoaded()
  .always( function( instance ) {
    gsap.to($('img'),{
      opacity: 1
    })
  });
  var imgLoad = imagesLoaded('.main');
imgLoad.on( 'always', function() {
    console.log( imgLoad.images.length + ' images loaded' );
    // detect which image is broken
    for ( var i = 0, len = imgLoad.images.length; i < len; i++ ) {
      var image = imgLoad.images[i];
      gsap.to($(image.img),{
        opacity: 1
      })
    }
  });
}

//Load Lenis
const lenis = new Lenis({
  duration: 1.5,
  easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)), // https://easings.net
  direction: "vertical",
  smooth: true,
  smoothTouch: false,
  touchMultiplier: 1.5
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

//Text Anim
function textAnim(){
  gsap.utils.toArray("[anim-text='words']").forEach(sm => {
    const txtAnim = gsap.timeline({
      scrollTrigger: {
        trigger: sm,
        // trigger element - viewport
        start: "top 70%",
        end: "bottom top",
        onEnter: () => txtAnim.play(),
        onEnterBack: () => txtAnim.restart(),
        onLeave: () => txtAnim.reverse(),
        onLeaveBack: () => txtAnim.reverse()
      }
    });
    const txt = new SplitType(sm, { types: 'words' });

    txtAnim.from(txt.words, {
      opacity: 0,
      yPercent: 80,
      stagger: {each: .035},
      duration: 1,
      ease: "power3.easeOut"
    });
  });

  gsap.utils.toArray("[anim-text='words-once']").forEach(sm => {
    const txtAnim = gsap.timeline({
      scrollTrigger: {
        trigger: sm,
        // trigger element - viewport
        start: "top 90%",
        onEnter: () => txtAnim.play()
      }
    });
    const txt = new SplitType(sm, { types: 'words' });

    txtAnim.fromTo(txt.words, {
      opacity: 0,
      yPercent: 80
    },{
      opacity: 1,
      yPercent: 0,
      stagger: {each: .035},
      duration: 1,
      ease: "power3.easeOut"
    });
  });

  gsap.utils.toArray("[anim-text='words-chars']").forEach(sm => {
    const txtAnim = gsap.timeline({
      scrollTrigger: {
        trigger: sm,
        // trigger element - viewport
        start: "top 75%",
        onEnter: () => txtAnim.play()
      }
    });
    const txt = new SplitType(sm, { types: 'words, chars' });

    txtAnim.from(txt.chars, {
      opacity: 0,
      yPercent: 80,
      stagger: {each: .01},
      duration: 1,
      ease: "power3.easeOut"
    });
  });
}

//Per Project
function updateDrag(){
  Draggable.create(".perproject_collection-list", {
    bounds:".perproject_collection-listwrapper",
  //allowNativeTouchScrolling:false,
    type:"x",
    inertia: true,
    zIndex: 3,
    zIndexBoost:false,
    dragClickables: true
    }
  );
}

function pageCode(){
  cmsItems = $(".project_item");
  currentItem = $(".project_next-link.w--current").parent().addClass("active");
  //Update Project Items
  currentItem = cmsItems.filter(".active");
  if (currentItem.next().length > 0) {
    nextItem = currentItem.next();
  } else {
    nextItem = cmsItems.first();
  }
  cmsItems.removeClass("active");
  nextItem.addClass("active");
  nextItemIndex = nextItem.index();

  // Update page
  $(".perproject_next-item").css("display", "none");
  $(".perproject_next-item").eq(nextItemIndex - 1).css("display", "flex");
  let nextLink = nextItem.find("a");
  if(nextLink == null){
    return;
  }else{
    $(".perproject_next-imgwrap").attr("href", nextLink[0].href);
  } 
  
  if (window.innerWidth > 991) {
    ScrollTrigger.create({
      trigger: ".bottom-trigger",
      start: "top bottom",
      end: "bottom bottom",
      onEnter: () => {
        nextLink[0].click();
      }
    });

  let tl2 = gsap.timeline({
    scrollTrigger: {
      trigger: ".perproject_next-section",
      pin: ".perproject_next-listwrapper",
      start: "top top",
      end: "bottom bottom",
      normalizeScroll: true,
      anticipatePin: 1,
      scrub: true
    }
  });
  tl2
    .to(".perproject_next-img", {
      width: "100vw",
      height: "100vh",
      ease: "none"
    })
    .fromTo(
      ".perproject_next-img",
      { clipPath: "polygon(10% 10%, 90% 10%, 90% 90%, 10% 90%)" },
      {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        ease: "none"
      },
      0
    );
  }
}

/* Barba JS*/
function updatePage(){
  $(window).scrollTop(0);
  lenis.start();
}

//Barba
let barbaDuration = 0.8;
barba.hooks.before((data) => {
  $("body").attr("p-e", "none");
});

barba.hooks.after((data) => {
  var response = data.next.html.replace(/(<\/?)html( .+?)?>/gi, "$1nothtml$2>");
  var bodyClasses = $(response).filter("nothtml").attr("data-wf-page");
  $("html").attr("data-wf-page", bodyClasses);
  Webflow.destroy();
  Webflow.ready();
  Webflow.require("ix2").init();
  $("body").attr("p-e", "");
  $(data.next.container).removeClass("fixed");
  let triggers = ScrollTrigger.getAll();
  triggers.forEach((trigger) => {
    trigger.kill();
  }); 
  ScrollTrigger.refresh();
  setTimeout(() => {
    ScrollTrigger.refresh();
  }, 400);
  textAnim();
});

barba.init({ 
  preventRunning: true,
  transitions: [
    {
      once(){
        return setTimeout(()=>{
          gsap.to(".nav_preload",{
            opacity: 0,
            onComplete: ()=> {
              $(this).hide();
            }
          })
        }, 2000);
      },
      beforeLeave(data) {
        lenis.stop();
        $(".w-dropdown").trigger("w-close");
        return gsap.to(data.current.container, {
          opacity: 0
        });
      },
      enter(data) {
        const lt = gsap.timeline({
          onComplete: function () {
            updatePage();
            loadImages();
          }
        });
        $(data.next.container).addClass("fixed");
        return lt.from(
          data.next.container,
          { 
            opacity: 0,
            ease: "power1.inOut",
            duration: barbaDuration 
          }
        );
      }
    }
  ],
  views: [
    {
      namespace: "perproject",
      afterEnter(){
        updateDrag();
        setTimeout(() => {
          pageCode();
        }, 350);      
      }
    },
    {
      namespace: "about",
      beforeEnter(){
        gsap.set($('[anim-text="words-once"]'),{
          opacity: 0
        })    
      },
      afterEnter(){
        gsap.to($('[anim-text="words-once"]'),{
          opacity: 1
        })  
      }
    }
  ]
});

$(function(){
  loadImages();
  textAnim();
})