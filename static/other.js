// ---------- Upload and Scan Details + remove.bg ----------
const uploadInput = document.getElementById('upload-input');
const preview = document.getElementById('preview');
const saveButton = document.getElementById('save-item-btn');
const itemTypeSelect = document.getElementById('item-type-select');
const itemDetailsForm = document.getElementById('item-details-form');
const removeBgBtn = document.getElementById('remove-bg-btn');
let pendingItem = {};
let pendingOriginalImage = null;
let pendingRemoveBgDataUrl = null;

uploadInput.addEventListener('change', () => {
  const file = uploadInput.files[0];
  if (file) {
    pendingOriginalImage = file;
    preview.src = URL.createObjectURL(file);
    preview.style.display = 'block';
    saveButton.disabled = false;
    removeBgBtn.style.display = 'inline-block';
    removeBgBtn.disabled = false;
    pendingRemoveBgDataUrl = null;
  }
});
itemTypeSelect.addEventListener('change', () => {
  saveButton.disabled = !itemTypeSelect.value || !uploadInput.files.length;
});

function checkEnableSave() {
  if (uploadInput.files.length > 0 && itemTypeSelect.value) {
    saveButton.disabled = false;
  } else {
    saveButton.disabled = true;
  }
}

// Tab navigation logic
const tabs = document.querySelectorAll('nav button');
const sections = document.querySelectorAll('section');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    sections.forEach(s => s.style.display = 'none');
    tab.classList.add('active');
    document.getElementById(tab.getAttribute('aria-controls')).style.display = 'block';
  });
});

// Calendar ----
(() => {
const toggleBtn = document.getElementById('calendar-toggle');
const popup = document.getElementById('calendar-popup');

// Load planned events from localStorage (optional)
const plannedEvents = JSON.parse(localStorage.getItem('plannedevents') || '{}');

function renderCalendar(currentDate) {
  popup.innerHTML = '';
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  header.style.marginBottom = '6px';

  const prevBtn = document.createElement('button');
  prevBtn.textContent = '‹';
  prevBtn.title = 'Previous month';
  prevBtn.style.cursor = 'pointer';
  prevBtn.style.border = 'none';
  prevBtn.style.background = 'none';
  prevBtn.style.color = '#6a46f1';
  prevBtn.style.fontSize = '1.5rem';
  prevBtn.onclick = () => renderCalendar(new Date(year, month -1, 1));

  const nextBtn = document.createElement('button');
  nextBtn.textContent = '›';
  nextBtn.title = 'Next month';
  nextBtn.style.cursor = 'pointer';
  nextBtn.style.border = 'none';
  nextBtn.style.background = 'none';
  nextBtn.style.color = '#6a46f1';
  nextBtn.style.fontSize = '1.5rem';
  nextBtn.onclick = () => renderCalendar(new Date(year, month +1, 1));

  const title = document.createElement('div');
  title.textContent = currentDate.toLocaleDateString(undefined, {month: 'long', year: 'numeric'});
  title.style.fontWeight = '600';
  title.style.fontSize = '1rem';

  header.appendChild(prevBtn);
  header.appendChild(title);
  header.appendChild(nextBtn);
  popup.appendChild(header);

  // Days of week header
  const daysHeader = document.createElement('div');
  daysHeader.style.display = "grid";
  daysHeader.style.gridTemplateColumns = "repeat(7,1fr)";
  daysHeader.style.textAlign = "center";
  daysHeader.style.fontWeight = "600";
  daysHeader.style.marginBottom = "4px";
  ['Su','Mo','Tu','We','Th','Fr','Sa'].forEach(d=> {
    const day = document.createElement('div');
    day.textContent = d;
    daysHeader.appendChild(day);
  });
  popup.appendChild(daysHeader);

  // Days grid
  const daysGrid = document.createElement('div');
  daysGrid.style.display = "grid";
  daysGrid.style.gridTemplateColumns = "repeat(7,1fr)";
  daysGrid.style.gap = "4px";
  daysGrid.style.textAlign = "center";

  const firstDay = new Date(year, month,1);
  const startWeekday = firstDay.getDay();
  const lastDate = new Date(year, month+1, 0).getDate();

  // Empty slots before first date
  for(let i=0; i<startWeekday; i++){
    daysGrid.appendChild(document.createElement('div'));
  }

  const today = new Date();
  const todayString = today.toISOString().slice(0,10);

  for(let day=1; day<=lastDate; day++) {
    const button = document.createElement('button');
    button.textContent = day;
    button.style.cursor = 'pointer';
    button.style.borderRadius = '6px';
    button.style.userSelect = 'none';
    button.style.border = 'none';
    button.style.padding = '6px 0';

    const dateISO = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;

    if(dateISO === todayString){
      button.style.border = '2px solid #6a46f1';
      button.style.color = '#6a46f1';
      button.style.fontWeight = '700';
    }

    if(plannedEvents[dateISO]){
      button.style.backgroundColor = '#d0b9ff';
      button.style.color = '#401ea9';
    }

    button.title = `Select ${dateISO}`;
    button.onclick = () => {
      popup.style.display = 'none';
      // Auto select event type dropdown if it exists and event planned:
      const eventSelect = document.getElementById('event-select') || document.querySelector('select[aria-label="Select event"]');
      if(eventSelect && plannedEvents[dateISO]){
        eventSelect.value = plannedEvents[dateISO];
        eventSelect.dispatchEvent(new Event('change'));
      }
      // Optionally do something with selected date...
    };

    daysGrid.appendChild(button);
  }

  popup.appendChild(daysGrid);
  popup.style.display = 'block';
  popup.focus();
}

toggleBtn.addEventListener('click', () => {
  if(popup.style.display === 'block') {
    popup.style.display = 'none';
  } else {
    renderCalendar(new Date());
  }
});

document.addEventListener('click', e => {
  if(!popup.contains(e.target) && e.target !== toggleBtn){
    popup.style.display = 'none';
  }
});

popup.addEventListener('keydown', e => {
  if(e.key === 'Escape'){
    popup.style.display = 'none';
    toggleBtn.focus();
  }
});

})(); 

// REMOVE.BG INTEGRATION
removeBgBtn.addEventListener('click', async function() {
  if (!pendingOriginalImage) return;
  removeBgBtn.disabled = true;
  removeBgBtn.textContent = "Removing...";
  // You must set your remove.bg API key here:
  const apiKey = "GAGNG1t7VyBas6EAgDqkEosu";
  const formData = new FormData();
  formData.append("image_file", pendingOriginalImage);
  formData.append("size", "auto");
  try {
    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: { "X-Api-Key": apiKey },
      body: formData,
    });
    if (!response.ok) {
      throw new Error("Background removal failed: " + response.statusText);
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    preview.src = url;
    pendingRemoveBgDataUrl = url;
    removeBgBtn.textContent = "Removed!";
  } catch (e) {
    alert("Failed to remove background. " + e.message);
    removeBgBtn.textContent = "Remove Background";
  } finally {
    removeBgBtn.disabled = false;
  }
});

// Save to closet (step 1: basic info, then prompt for details)
saveButton.addEventListener('click', function() {
  if (!uploadInput.files.length || !itemTypeSelect.value) return;
  if (pendingRemoveBgDataUrl) {
    // use result from remove.bg
    fetch(pendingRemoveBgDataUrl)
      .then(r => r.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onload = function(e) {
          pendingItem = {
            id: Date.now(),
            image: e.target.result,
            type: itemTypeSelect.value
          };
          itemDetailsForm.style.display = 'block';
        };
        reader.readAsDataURL(blob);
      });
  } else {
    // use original image
    const file = uploadInput.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
      pendingItem = {
        id: Date.now(),
        image: e.target.result,
        type: itemTypeSelect.value
      };
      itemDetailsForm.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
});

// Save scan/details to closet
document.getElementById('save-details-btn').onclick = function() {
  pendingItem.dominantColor = document.getElementById('dominant-color-input').value;
  pendingItem.colorName = document.getElementById('dominant-color-name').value.trim().toLowerCase();
  pendingItem.suitableEvent = document.getElementById('details-event').value;
  const closet = JSON.parse(localStorage.getItem('closet')||'[]');
  closet.push(pendingItem);
  localStorage.setItem('closet', JSON.stringify(closet));
  preview.style.display = 'none';
  uploadInput.value = '';
  itemTypeSelect.value = '';
  saveButton.disabled = true;
  itemDetailsForm.style.display = 'none';
  document.getElementById('dominant-color-name').value = '';
  document.getElementById('dominant-color-input').value = '#cccccc';
  document.getElementById('details-event').selectedIndex = 0;
  pendingItem = {};
  pendingOriginalImage = null;
  pendingRemoveBgDataUrl = null;
  removeBgBtn.style.display = 'none';
  removeBgBtn.textContent = "Remove Background";
  alert('Item added to closet!');
  renderCloset();
};

// ---------- Closet rendering and filtering ----------
function renderCloset(filterType) {
  const closet = JSON.parse(localStorage.getItem('closet')||'[]');
  let filtered = closet;
  if (filterType) filtered = closet.filter(item => item.type === filterType);
  const closetList = document.getElementById('closet-list');
  closetList.innerHTML = '';
  if (!filtered.length) {
    document.getElementById('closet-empty-msg').textContent = 'No items in this category. Add some!';
    return;
  }
  document.getElementById('closet-empty-msg').textContent = '';
  filtered.forEach(item => {
    const div = document.createElement('div');
    div.className = 'closet-item';
    div.innerHTML = `
      <img src="${item.image}" alt="${item.type}" />
      <span class="closet-type-tag">${item.type}</span>
      <button class="closet-delete-btn" title="Delete">&times;</button>
      <div style="padding:0.2rem 0.5rem; font-size:0.8rem;">${item.colorName || ''} <span style="display:inline-block;width:16px;height:16px;background:${item.dominantColor};border-radius:50%;vertical-align:middle;margin-left:3px;"></span></div>
      <div style="font-size:0.75rem;color:#6a46f1;">Event: ${item.suitableEvent||'N/A'}</div>
    `;
    div.querySelector('.closet-delete-btn').onclick = function(e) {
      e.stopPropagation();
      const closet = JSON.parse(localStorage.getItem('closet')||'[]');
      const idx = closet.findIndex(ci => ci.id === item.id);
      if (idx !== -1) {
        closet.splice(idx,1);
        localStorage.setItem('closet', JSON.stringify(closet));
        renderCloset(document.getElementById('closet-type-filter').value);
      }
    };
    closetList.appendChild(div);
  });
}
window.addEventListener('load', () => renderCloset());
document.getElementById('closet-type-filter').addEventListener('change', function() {
  renderCloset(this.value);
});

// ---------- Recommendations (weather, preferences, event) ----------
function colorDistance(hex1, hex2) {
  function hexToRgb(hex) {
    hex = hex.replace('#','');
    if(hex.length===3) hex = hex.split('').map(x=>x+x).join('');
    var bigint = parseInt(hex, 16);
    return [ (bigint>>16)&255, (bigint>>8)&255, bigint&255 ];
  }
  const rgb1 = hexToRgb(hex1), rgb2 = hexToRgb(hex2);
  return Math.sqrt(rgb1.reduce((acc, c, i)=>acc+Math.pow(c-rgb2[i],2),0));
}
function colorNameToHex(color) {
  const map = { red:'#c00', blue:'#09c', green:'#0c9', pink:'#e6a', beige:'#f5f5dc', navy:'#001f5a', yellow:'#ff0', black:'#111', white:'#fff', brown:'#964B00', orange:'#f90', purple:'#93f', grey:'#888' };
  return map[color.toLowerCase()] || '#ccc';
}
function getWeatherType() {
  const desc = document.getElementById('weather-desc')?.textContent?.toLowerCase() || '';
  if (desc.includes("rain")) return "rain";
  if (desc.includes("snow")||desc.includes("cold")) return "cold";
  if (desc.includes("clear")||desc.includes("sun")) return "hot";
  if (desc.includes("cloud")||desc.includes("fog")||desc.includes("mild")) return "mild";
  return "";
}
function recommendOutfits(closet, profile, eventType) {
  const weatherType = getWeatherType();
  return closet.filter(item => {
    if(weatherType==="rain" && item.type!=="outerwear") return false;
    if(weatherType==="cold" && item.type!=="outerwear" && item.type!=="sweater") return false;
    if(weatherType==="hot" && (item.type==="outerwear")) return false;
    if(eventType && item.suitableEvent && item.suitableEvent!==eventType) return false;
    const colorMatch = (profile.preferredColors||[]).some(c =>
      item.colorName?.includes(c) ||
      colorDistance(item.dominantColor||"#fff", colorNameToHex(c)) < 60
    );
    if((profile.preferredColors||[]).length && !colorMatch) return false;
    return true;
  });
}
document.getElementById('recommend-btn').onclick = function() {
  const closet = JSON.parse(localStorage.getItem('closet')||'[]');
  const profile = JSON.parse(localStorage.getItem('userProfile')||'{}');
  const eventType = document.getElementById('event-select').value;
  const results = recommendOutfits(closet, profile, eventType);
  const list = document.getElementById('recommendations-list');
  list.innerHTML = '';
  if (!results.length) {
    list.textContent = 'No matching outfits. Try adding more items or adjusting your profile/event!';
    return;
  }
  results.forEach(item => {
    const div = document.createElement('div');
    div.style = 'display:inline-block; margin:0.5rem; vertical-align:top; box-shadow:0 1px 6px #6a46f133; border-radius:10px; background:#fff;';
    div.innerHTML = `
      <img src="${item.image}" style="width:100px; height:120px; object-fit:cover; border-radius:8px 8px 0 0;" />
      <div style="padding:0.2rem 0.5rem; font-size:0.9rem;">${item.type} | <span style="display:inline-block;width:12px;height:12px;background:${item.dominantColor};border-radius:50%;vertical-align:middle;"></span> ${item.colorName||''}</div>
      <div style="font-size:0.8rem;color:#6a46f1;">${item.suitableEvent||'N/A'}</div>
    `;
    list.appendChild(div);
  });
};

// ---------- Google Outfit Inspiration Button ----------
document.getElementById('google-outfit-btn').onclick = function() {
  const type = document.getElementById('item-type-select')?.value || '';
  const color = document.getElementById('dominant-color-name')?.value || '';
  const eventType = document.getElementById('details-event')?.value || '';
  const weatherDesc = document.getElementById('weather-desc')?.textContent || '';
  const q = encodeURIComponent(`${eventType} ${type} ${color} outfit for ${weatherDesc} weather`);
  window.open(`https://www.google.com/search?tbm=isch&q=${q}`, '_blank');
};