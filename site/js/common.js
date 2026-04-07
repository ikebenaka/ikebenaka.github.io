document.addEventListener("DOMContentLoaded", function () {
  'use strict';

  function setFormStatus(statusNode, message, variant) {
    if (!statusNode) return;
    statusNode.textContent = message || "";
    statusNode.classList.remove("is-error", "is-success");
    if (variant) {
      statusNode.classList.add(variant === "error" ? "is-error" : "is-success");
    }
  }

  function buildMailtoUrl(email, subject, body) {
    return "mailto:" + email +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);
  }

  function submitWithFallback(form, statusNode) {
    var fallbackEmail = form.dataset.fallbackEmail;

    if (!fallbackEmail) {
      setFormStatus(statusNode, "This form is still being connected. Please try again soon.", "error");
      return;
    }

    if (form.dataset.managedForm === "contact") {
      var name = form.querySelector("[name='name']").value.trim();
      var email = form.querySelector("[name='_replyto']").value.trim();
      var message = form.querySelector("[name='text']").value.trim();
      var contactBody = [
        "Name: " + name,
        "Email: " + email,
        "",
        message
      ].join("\n");

      window.location.href = buildMailtoUrl(
        fallbackEmail,
        "Website contact from " + name,
        contactBody
      );

      setFormStatus(statusNode, "Your email app should open with this message prefilled.", "success");
      return;
    }

    var subscriberEmail = form.querySelector("[name='EMAIL']").value.trim();
    var newsletterSubject = form.dataset.fallbackSubject || "Newsletter signup";
    var newsletterBody = "Please add this email to my website subscriber list:\n\n" + subscriberEmail;

    window.location.href = buildMailtoUrl(fallbackEmail, newsletterSubject, newsletterBody);
    setFormStatus(statusNode, "Your email app should open so you can finish subscribing.", "success");
  }

  function serializeManagedForm(form) {
    if (form.dataset.managedForm === "contact") {
      return {
        action: "contact",
        name: form.querySelector("[name='name']").value.trim(),
        email: form.querySelector("[name='_replyto']").value.trim(),
        message: form.querySelector("[name='text']").value.trim(),
        source: window.location.pathname
      };
    }

    return {
      action: "subscribe",
      email: form.querySelector("[name='EMAIL']").value.trim(),
      source: window.location.pathname
    };
  }

  function handleManagedForm(form) {
    var statusNode = form.querySelector("[data-form-status]");
    var submitButton = form.querySelector("button[type='submit']");

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!form.reportValidity()) {
        setFormStatus(statusNode, "Please fill out the required fields first.", "error");
        return;
      }

      var endpoint = form.dataset.endpoint;
      var payload = serializeManagedForm(form);

      if (!endpoint) {
        submitWithFallback(form, statusNode);
        return;
      }

      if (submitButton) submitButton.disabled = true;
      setFormStatus(statusNode, "Sending...", null);

      fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      })
        .then(function (response) {
          return response.json().catch(function () {
            return {};
          });
        })
        .then(function (responseBody) {
          if (responseBody && responseBody.ok === false) {
            throw new Error(responseBody.message || "Request failed");
          }

          var successMessage = responseBody.message ||
            (form.dataset.managedForm === "contact"
              ? "Thanks for reaching out. Your message has been sent."
              : "Thanks for subscribing. You will hear about new posts here.");

          setFormStatus(statusNode, successMessage, "success");
          form.reset();
        })
        .catch(function (error) {
          if (endpoint) {
            setFormStatus(
              statusNode,
              error && error.message ? error.message : "Something went wrong. Please try again.",
              "error"
            );
            return;
          }

          submitWithFallback(form, statusNode);
        })
        .finally(function () {
          if (submitButton) submitButton.disabled = false;
        });
    });
  }

  var managedForms = document.querySelectorAll("[data-managed-form]");
  managedForms.forEach(handleManagedForm);

  /* =======================
  // Menu
  ======================= */
  var body = document.querySelector("body"),
  menuOpenIcon = document.querySelector(".nav__icon-menu"),
  menuCloseIcon = document.querySelector(".nav__icon-close"),
  menuList = document.querySelector(".main-nav");

  menuOpenIcon.addEventListener("click", () => {
    menuOpen();
  });

  menuCloseIcon.addEventListener("click", () => {
    menuClose();
  });

  function menuOpen() {
    menuList.classList.add("is-open");
  }

  function menuClose() {
    menuList.classList.remove("is-open");
  }

  /* =======================
  // Animation Load Page
  ======================= */
  setTimeout(function(){
    body.classList.add("is-in");
  },150)

  /* ==================================
  // Stop Animations After All Have Run
  ================================== */
  setTimeout(function(){
    body.classList.add("stop-animations");
  },1500)

  /* ======================================
  // Stop Animations During Window Resizing
  ====================================== */
  let resizeTimer;
  window.addEventListener("resize", () => {
    document.body.classList.add("resize-animation-stopper");
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      document.body.classList.remove("resize-animation-stopper");
    }, 300);
  });


  /* =======================
  // Responsive Videos
  ======================= */
  if (typeof reframe === "function") {
    reframe(".post__content iframe:not(.reframe-off), .page__content iframe:not(.reframe-off)");
  }


  /* =======================
  // Zoom Image
  ======================= */
  const lightense = document.querySelector(".page img, .post img, .gallery-grid img"),
  imageLink = document.querySelectorAll(".page a img, .post a img, .gallery-grid a img");

  if (imageLink) {
    for (var i = 0; i < imageLink.length; i++) imageLink[i].parentNode.classList.add("image-link");
    for (var i = 0; i < imageLink.length; i++) imageLink[i].classList.add("no-lightense");
  }

  if (lightense && typeof Lightense === "function") {
    Lightense(".page img:not(.no-lightense), .post img:not(.no-lightense), .gallery-grid img:not(.no-lightense)", {
    padding: 60,
    offset: 30
    });
  }

  /* =======================
  // Gallery Lightbox
  ======================= */
  const galleryTriggers = document.querySelectorAll(".gallery-grid__trigger");
  if (galleryTriggers.length) {
    const lightbox = document.createElement("div");
    lightbox.className = "gallery-lightbox";
    lightbox.innerHTML = '<div class="gallery-lightbox__dialog" role="dialog" aria-modal="true"><img class="gallery-lightbox__image" alt=""></div>';
    document.body.appendChild(lightbox);

    const lightboxImage = lightbox.querySelector(".gallery-lightbox__image");

    function closeGalleryLightbox() {
      lightbox.classList.remove("is-open");
      document.body.classList.remove("gallery-lightbox-open");
      lightboxImage.removeAttribute("src");
      lightboxImage.setAttribute("alt", "");
    }

    galleryTriggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const imageSrc = trigger.getAttribute("data-gallery-image");
        const imageAlt = trigger.getAttribute("data-gallery-alt") || "";
        if (!imageSrc) return;
        lightboxImage.setAttribute("src", imageSrc);
        lightboxImage.setAttribute("alt", imageAlt);
        lightbox.classList.add("is-open");
        document.body.classList.add("gallery-lightbox-open");
      });
    });

    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) {
        closeGalleryLightbox();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
        closeGalleryLightbox();
      }
    });
  }

  /* ============================
  // Testimonials Slider
  ============================ */
  if (document.querySelector(".my-slider") && typeof tns === "function") {
    var slider = tns({
      container: ".my-slider",
      items: 3,
      slideBy: 1,
      gutter: 20,
      nav: false,
      mouseDrag: true,
      autoplay: false,
      controlsContainer: "#customize-controls",
      responsive: {
        1024: {
          items: 3,
        },
        768: {
          items: 2,
        },
        0: {
          items: 1,
        }
      }
    });
  }


  /* ============================
  // iTyped
  ============================ */
  if (document.querySelector(".c-subscribe") && typeof ityped !== "undefined" && ityped && typeof ityped.init === "function") {
    var options = {
      strings: itype_text,
      typeSpeed: 100,
      backSpeed: 50,
      startDelay: 200,
      backDelay: 1500,
      loop: true,
      showCursor: true,
      cursorChar: "|",
      onFinished: function(){}
    }

    ityped.init('#ityped', options);
  }


  /* ============================
  // Scroll to top
  ============================ */
  const btnScrollToTop = document.querySelector(".top");

  window.addEventListener("scroll", function () {
    window.scrollY > window.innerHeight ? btnScrollToTop.classList.add("is-active") : btnScrollToTop.classList.remove("is-active");
  });

  btnScrollToTop.addEventListener("click", function () {
    if (window.scrollY != 0) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth"
      })
    }
  });

});
