import Cookies from "js-cookie";

(({ behaviors }, drupalSettings) => {
  behaviors.cookieDisclaimerBehavior = {
    attach(context) {
      context.querySelectorAll(".js-cookies-popup").forEach((disclaimer) => {
        const disclaimerButton = disclaimer.querySelector(
          ".js-cookies-popup__button"
        );

        function killCookieDisclaimer() {
          disclaimer.remove();
        }

        if (Cookies.get("allow-cookies") == "true") {
          return killCookieDisclaimer();
        }

        disclaimer.classList.add("is-visible");

        disclaimerButton.addEventListener("click", (e) => {
          disclaimer.classList.remove("is-visible");
          setTimeout(killCookieDisclaimer, 1000);
          Cookies.set("allow-cookies", "true", { expires: 14 });
        });
      });
    },
  };
})(Drupal, drupalSettings);
