import { setStorage, getStorage, icons, userIcon } from "./helpers.js";
const form = document.querySelector("form");
const noteList = document.querySelector("ul");

//global değişkenler
var map;
var coords;
var notes = getStorage() || [];
var markerLayer = null;


function loadMap() {
  map = L.map("map").setView(coords, 15);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  markerLayer = L.layerGroup().addTo(map);
  L.marker(coords, { icon: userIcon }).addTo(map)

  renderNoteList(notes);
  //haritadaki tıklanma olayı
  map.on("click", onMapClick);
}

//iptal butonuna tıklanırsa formu kapat ve temizle
form[3].addEventListener("click", () => {
  form.reset();

  form.style.display = "none";
});

//form gönderilince yeni not olustur local storage kaydet
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const newNote = {
    id: new Date().getTime(),
    title: form[0].value,
    date: form[1].value,
    status: form[2].value,
    coords: coords,
  };
  //yeni not ekle
  notes.unshift(newNote);

  //notları listele
  renderNoteList(notes);

  //local storage güncelle
  setStorage(notes);

  //formu kapat
  form.style.display = "none";
  form.reset();
});

//imlec ekler
function renderMarker(note) {
    L.marker(note.coords, { icon: icons[note.status]})
    .addTo(markerLayer)
    .bindPopup(note.title)
     
  }

//ekrana notları bas
function renderNoteList(items) {
  noteList.innerHTML = "";
  markerLayer.clearLayers()
  items.forEach((note) => {
    const listEle = document.createElement("li");

    // data-id ekle
    listEle.dataset.id = note.id;

    listEle.innerHTML = `
   <div class="info">
   <p>${note.title}</p>
   <p>
     <span>Tarih:</span>
     <span>${note.date}</span>
   </p>
   <p>
     <span>Durum:</span>
     <span>${note.status}</span>
   </p>
 </div>
 <div class="icons">
   <i id="fly" class="bi bi-airplane-fill"></i>
   <i class="bi bi-trash3-fill"></i>
 </div>
   `;

    noteList.appendChild(listEle);

    renderMarker(note);
  });
}


// kullanıcının konumunu alma

navigator.geolocation.getCurrentPosition(
    // konumu alırsa haritayı kullanıcının konumu yukler
    (e) => {
      loadMap([e.coords.latitude, e.coords.longitude]);
    },
    // konumu almazsa varsayılan olorak ankara göster
    () => {
      loadMap([39.953925, 32.858552]);
    }
  );


//haritadaki tıklanma olayları calısır
  function onMapClick(e) {
    coords = [e.latlng.lat, e.latlng.lng]; //tıklanan yerin konumuna erişmek
  
    form.style.display = "flex";
    form[0].focus(); //ilk ınputu secer
  }
// silme 
noteList.addEventListener('click', (e) => {
    // tıklanılan elemanın id
    const found_id = e.target.closest('li').dataset.id;
  
    if (
      e.target.id === 'delete' &&
      confirm('Silme işlemini onaylıyor musnuz?')
    ) {
     
      notes = notes.filter((note) => note.id != found_id);
  
      setStorage(notes);
  
      renderNoteList(notes);
    }
  
    if (e.target.id === 'fly') {
      // id bildigimiz elmanı dizideki haline erisme
      const note = notes.find((note) => note.id == found_id);
  
      // not koordinatlarına git
      map.flyTo(note.coords);
    }
  });
  
 