import { debounce } from "lodash";
import MapStyles from "./imports/mapstyles";
import { Loader } from "@googlemaps/js-api-loader";

// TODO: restrict API key
//
const APIKEY = "";

(({ behaviors }, drupalSettings) => {
  if (!APIKEY) {
    return console.log(
      "get a google maps API key at https://console.developers.google.com/apis/dashboard"
    );
  }

  behaviors.googleMapinitBehavior = {
    attach(context) {
      once("googleMapInitBehavior", ".js-map", context).forEach((map) => {
        // user intersection observer to lazy load map
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                observer.unobserve(entry.target);
                loadMap();
              }
            });
          },
          { rootMargin: "0px 0px 0px 0px" }
        );
        observer.observe(map);

        async function loadMap() {
          const loader = new Loader({
            apiKey: APIKEY,
            version: "weekly",
          });

          await loader.importLibrary("maps", "geometry");
          initMap(map);
        }
      });
    },
  };

  function initMap(mapContainer) {
    const bound = new google.maps.LatLngBounds();
    const geolocations = mapContainer.dataset.geolocations
      .split(";")
      .map((geolocation) => {
        const [lat, lng] = geolocation.split(",");
        return { lat: parseFloat(lat), lng: parseFloat(lng) };
      });

    makeMap();

    function makeMap() {
      var gmarkers = [];
      var map = null;
      let markerSize = 100;

      geolocations.forEach((geolocation) => {
        bound.extend(new google.maps.LatLng(geolocation.lat, geolocation.lng));
      });

      const customZoom = mapContainer.dataset.customZoom * 1;
      var zoomFactor = 13;
      if (customZoom) {
        zoomFactor = customZoom;
      }

      const mapOptions = {
        center: bound.getCenter(),
        zoom: zoomFactor,
        disableDefaultUI: true,
        scrollwheel: false, // Disable zooming with scroll wheel
        disableDoubleClickZoom: true, // Disable double-click to zoom
        gestureHandling: "none", // Disable all kinds of gestures to zoom,
        styles: MapStyles,
      };

      map = new google.maps.Map(mapContainer, mapOptions);

      async function setMarkers() {
        const markerImage = {
          url: mapContainer.dataset.marker,
          scaledSize: new google.maps.Size(53, 72),
          // path: google.maps.SymbolPath.CIRCLE,
          // scale: markerSize / 2,
          // fillColor: "#FF0000",
          // fillOpacity: 1,
          // strokeWeight: 0,
        };

        geolocations.forEach((geolocation) => {
          const myLatLng = new google.maps.LatLng(
            geolocation.lat,
            geolocation.lng
          );

          const marker = new google.maps.Marker({
            position: myLatLng,
            map: map,
            optimized: false,
            icon: markerImage,
          });

          // Open google maps at coordinates on marker click
          gmarkers.push(marker);
          const url = `https://maps.google.com/maps?daddr=${geolocation.lat},${geolocation.lng}`;

          google.maps.event.addListener(marker, "click", function () {
            window.open(url);
          });
        });

        if (geolocations.length > 1) {
          // Fit map to bounds
          map.fitBounds(bound);
          window.addEventListener(
            "resize",
            debounce(() => {
              map.fitBounds(bound);
            }, 100)
          );
        }
      }
      setMarkers();
    }
  }
})(Drupal, drupalSettings);
