class MapHandler {
    constructor(mapElementId, latInputId, lngInputId, searchBoxId, updateButtonId) {
      this.mapElementId = mapElementId;
      this.latInput = document.getElementById(latInputId);
      this.lngInput = document.getElementById(lngInputId);
      this.searchBoxId = searchBoxId;
      this.updateButtonId = updateButtonId;
      this.currentMarker = null;
      this.staticMarker = null;
      this.searchMarkers = [];
      this.isStaticMarkerVisible = true ;
    }
  
    initMap() {
      this.map = new google.maps.Map(document.getElementById(this.mapElementId), {
        center: { lat: 29.978594774254518, lng: 30.935681164434815 },
        zoom: 18,
        scaleControl: true,
        mapTypeId: "roadmap",
      });
  
      const staticLatLng = { lat: 29.978576788059428, lng: 30.935669975032056 };
      this.staticMarker = new google.maps.Marker({
        map: this.map,
        position: staticLatLng,
        visible: true  // Ensure static marker is visible initially
      });
  
      const infowindow = new google.maps.InfoWindow({
        content: "<b>Paymac Full Digital Solutions</b>",
      });
  
      this.staticMarker.addListener("click", () => {
        infowindow.open(this.map, this.staticMarker);
      });
  
      // initialize inputs with static marker  
      this.updateInputs(staticLatLng.lat, staticLatLng.lng);
  
      // initialize map click listener
      this.map.addListener("click", (e) => this.handleMapClick(e.latLng));
  
      // initialize search box
      this.initSearch();
  
      //  update button click listener
      document.getElementById(this.updateButtonId).addEventListener('click', () => this.updateMarkerFromInputs());
    }
  
    handleMapClick(latLng) {
      if (this.isStaticMarkerVisible) {
        this.staticMarker.setMap(null); 
        this.isStaticMarkerVisible = false;  
      }
  
      this.clearMarkers();
  
      this.currentMarker = new google.maps.Marker({
        position: latLng,
        map: this.map,
      });
  
      const infowindow = new google.maps.InfoWindow({
        content: `<div>
          <p>Latitude: ${latLng.lat()}</p>
          <p>Longitude: ${latLng.lng()}</p>
        </div>`,
      });
  
      infowindow.open(this.map, this.currentMarker);
      this.updateInputs(latLng.lat(), latLng.lng());
    }
  
    updateInputs(lat, lng) {
      this.latInput.value = lat;
      this.lngInput.value = lng;
    }
  
    clearMarkers() {
      if (this.currentMarker) {
        this.currentMarker.setMap(null);
        this.currentMarker = null;
      }
  
      this.searchMarkers.forEach(marker => marker.setMap(null));
      this.searchMarkers = [];
    }
  
    initSearch() {
      const input = document.getElementById(this.searchBoxId);
      const searchBox = new google.maps.places.SearchBox(input);
  
      this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
  
      this.map.addListener("bounds_changed", () => {
        searchBox.setBounds(this.map.getBounds());
      });
  
      searchBox.addListener("places_changed", () => {
        const places = searchBox.getPlaces();
  
        if (places.length == 0) {
          return;
        }
  
        this.clearMarkers();
  
        const bounds = new google.maps.LatLngBounds();
  
        places.forEach((place) => {
          if (!place.geometry || !place.geometry.location) {
            console.log("Returned place contains no geometry");
            return;
          }
  
          const marker = new google.maps.Marker({
            map: this.map,
            title: place.name,
            position: place.geometry.location,
          });
  
          this.searchMarkers.push(marker);
  
          // Update inputs with coordinates of the searched place
          this.updateInputs(place.geometry.location.lat(), place.geometry.location.lng());
  
          if (place.geometry.viewport) {
            bounds.union(place.geometry.viewport);
          } else {
            bounds.extend(place.geometry.location);
          }
        });
  
        this.map.fitBounds(bounds);
      });
    }
  
    updateMarkerFromInputs() {
      const lat = parseFloat(this.latInput.value);
      const lng = parseFloat(this.lngInput.value);
  
      if (isNaN(lat) || isNaN(lng)) {
        alert('Please enter valid latitude and longitude.');
        return;
      }
  
      const newLatLng = new google.maps.LatLng(lat, lng);
  
      if (this.currentMarker) {
        this.currentMarker.setPosition(newLatLng);
      } else {
        this.currentMarker = new google.maps.Marker({
          position: newLatLng,
          map: this.map,
        });
      }
  
      this.map.setCenter(newLatLng);
      this.clearMarkers();
    }
  }
  
  window.initMap = function() {
    const mapHandler = new MapHandler("map", "lat-input", "lng-input", "pac-input", "update-marker");
    mapHandler.initMap();
  };
  