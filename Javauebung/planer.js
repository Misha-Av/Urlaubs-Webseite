const cards = document.querySelectorAll('#packlist-area .person-card');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const indicator = document.getElementById('person-indicator');
const progressBar = document.getElementById('progress-bar');

let currentIndex = 0; 

function showChecklistDirect() {
  document.getElementById('home-page').style.display = 'none';
  document.getElementById('checklist-page').style.display = 'block';
  
  document.getElementById('packlist-area').style.display = 'block';
  const progressArea = document.getElementById('progress-area') || document.querySelector('.progress-container');
  if (progressArea) progressArea.style.display = 'block';
  document.getElementById('activity-area').style.display = 'none';
  
  document.getElementById('btn-toggle-view').textContent = '🎯 Zu den Aktivitäten';
  document.getElementById('btn-prev').style.visibility = 'visible';
  document.getElementById('btn-next').style.visibility = 'visible';
  
  isActivityView = false;
  updateVisibility();
}

function showActivitiesDirect() {
  document.getElementById('home-page').style.display = 'none';
  document.getElementById('checklist-page').style.display = 'block';
  
  document.getElementById('packlist-area').style.display = 'none';
  const progressArea = document.getElementById('progress-area') || document.querySelector('.progress-container');
  if (progressArea) progressArea.style.display = 'none';
  document.getElementById('activity-area').style.display = 'block';
  
  document.getElementById('btn-toggle-view').textContent = '🧳 Zur Packliste';
  document.getElementById('btn-prev').style.visibility = 'hidden';
  document.getElementById('btn-next').style.visibility = 'hidden';
  
  isActivityView = true;
}

function showHome() {
  document.getElementById('home-page').style.display = 'block';
  document.getElementById('checklist-page').style.display = 'none';
  updateCountdown();
}

function updateProgress() {
  const activeCard = document.querySelector('#packlist-area .person-card.active') || document.querySelector('#packlist-area .person-card');
  if (!activeCard) return;

  const activeCheckboxes = activeCard.querySelectorAll('.save-cb');
  const checkedCount = activeCard.querySelectorAll('.save-cb:checked').length;
  
  const percent = activeCheckboxes.length > 0 ? Math.round((checkedCount / activeCheckboxes.length) * 100) : 0;
  
  if (progressBar) {
    progressBar.style.width = percent + '%';
    progressBar.textContent = percent + '%';

    progressBar.classList.remove('bg-red', 'bg-orange', 'bg-yellow', 'bg-green');

    if (percent <= 25) {
      progressBar.classList.add('bg-red');
    } else if (percent <= 50) {
      progressBar.classList.add('bg-orange');
    } else if (percent <= 75) {
      progressBar.classList.add('bg-yellow');
    } else {
      progressBar.classList.add('bg-green');
    }
  }
}

function updateVisibility() {
  cards.forEach((card, index) => {
    if (index === currentIndex) {
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
  });
  
  if (indicator) {
    const currentInput = document.getElementById(`name-p${currentIndex + 1}`);
    const displayName = currentInput ? currentInput.value : `Person ${currentIndex + 1}`;
    indicator.textContent = `${displayName} (Liste ${currentIndex + 1} von ${cards.length})`;
  }
  
  updateProgress();
}

if (btnNext) {
  btnNext.addEventListener('click', () => {
    currentIndex++;
    if (currentIndex >= cards.length) currentIndex = 0;
    updateVisibility();
  });
}

if (btnPrev) {
  btnPrev.addEventListener('click', () => {
    currentIndex--;
    if (currentIndex < 0) currentIndex = cards.length - 1;
    updateVisibility();
  });
}

const checkboxes = document.querySelectorAll('.save-cb');
checkboxes.forEach(cb => {
  const savedState = localStorage.getItem(cb.id);
  if (savedState === 'true') {
    cb.checked = true;
  }

  cb.addEventListener('change', () => {
    localStorage.setItem(cb.id, cb.checked);
    updateProgress();
  });
});

document.addEventListener("DOMContentLoaded", () => {
    const persons = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'];
    persons.forEach(personId => {
        loadCustomItems(personId);
    });
    
    const nameInputs = document.querySelectorAll('.name-input');
    nameInputs.forEach(input => {
      const savedName = localStorage.getItem(input.id);
      if (savedName) {
        input.value = savedName;
      }

      input.addEventListener('input', () => {
        localStorage.setItem(input.id, input.value);
        if (input.id === `name-p${currentIndex + 1}`) {
          updateVisibility(); 
        }
      });
    });

    loadActivityItems();
    updateProgress();
});

function addCustomItem(personId) {
    const inputField = document.getElementById(`input-${personId}`);
    if (!inputField) return;
    
    const itemText = inputField.value.trim();

    if (itemText === "") {
        alert("Bitte gib einen Text ein!");
        return;
    }

    const itemId = `${personId}-custom-${Date.now()}`;

    createItemDOM(personId, itemId, itemText, false);
    saveCustomItemToStorage(personId, itemId, itemText, false);

    inputField.value = "";
    updateProgress(); 
}

function createItemDOM(personId, itemId, text, isChecked) {
    const listContainer = document.getElementById(`custom-list-${personId}`);
    if (!listContainer) return;

    const label = document.createElement("label");
    label.className = "todo-item custom-item";
    label.id = `container-${itemId}`;

    label.innerHTML = `
        <input type="checkbox" class="save-cb" id="${itemId}" ${isChecked ? 'checked' : ''} onchange="toggleCustomItem('${personId}', '${itemId}')">
        <span>${text}</span>
        <button class="delete-btn" onclick="deleteCustomItem('${personId}', '${itemId}')" style="margin-left: auto; background: none; border: none; cursor: pointer;">❌</button>
    `;

    listContainer.appendChild(label);
}

function toggleCustomItem(personId, itemId) {
    const checkbox = document.getElementById(itemId);
    if (!checkbox) return;
    
    let items = JSON.parse(localStorage.getItem(`customItems_${personId}`)) || [];
    
    items = items.map(item => {
        if (item.id === itemId) {
            item.checked = checkbox.checked;
        }
        return item;
    });

    localStorage.setItem(`customItems_${personId}`, JSON.stringify(items));
    updateProgress(); 
}

function deleteCustomItem(personId, itemId) {
    const element = document.getElementById(`container-${itemId}`);
    if (element) element.remove();

    let items = JSON.parse(localStorage.getItem(`customItems_${personId}`)) || [];
    items = items.filter(item => item.id !== itemId);
    localStorage.setItem(`customItems_${personId}`, JSON.stringify(items));

    updateProgress(); 
}

function saveCustomItemToStorage(personId, itemId, text, checked) {
    const items = JSON.parse(localStorage.getItem(`customItems_${personId}`)) || [];
    items.push({ id: itemId, text: text, checked: checked });
    localStorage.setItem(`customItems_${personId}`, JSON.stringify(items));
}

function loadCustomItems(personId) {
    const items = JSON.parse(localStorage.getItem(`customItems_${personId}`)) || [];
    items.forEach(item => {
        createItemDOM(personId, item.id, item.text, item.checked);
    });
}

document.addEventListener('change', (event) => {
    if (event.target.classList.contains('save-cb')) {
        updateProgress();
    }
});

function saveTravelDate() {
  const dateInput = document.getElementById('travel-date');
  if (dateInput) {
    localStorage.setItem('travelDate', dateInput.value);
    updateCountdown();
  }
}

function updateCountdown() {
  const display = document.getElementById('countdown-display');
  if (!display) return;

  const savedDate = localStorage.getItem('travelDate');
  const dateInput = document.getElementById('travel-date');
  
  if (dateInput && savedDate) {
    dateInput.value = savedDate;
  }

  if (!savedDate) {
    display.textContent = "Gib ein Datum ein, um den Countdown zu starten! ✈️";
    return;
  }

  const targetDate = new Date(savedDate);
  targetDate.setHours(0, 0, 0, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = targetDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 1) {
    display.textContent = `Noch ${diffDays} Tage bis zum Urlaub! 🌴`;
  } else if (diffDays === 1) {
    display.textContent = "Morgen geht es endlich los! 🧳";
  } else if (diffDays === 0) {
    display.textContent = "Heute geht die Reise los! Gute Reise! ✈️🥳";
  } else {
    display.textContent = "Dein Urlaub hat schon begonnen oder ist vorbei! 😎";
  }
}

function resetAllLists() {
  const confirmReset = confirm("Möchtest du wirklich alle Listen und Namen löschen, um einen neuen Urlaub zu planen?");
  
  if (confirmReset) {
    localStorage.clear();   
    window.location.reload();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  updateCountdown();
  loadActivityItems();
  loadSavedWeather();
  loadVaultData();
});

let isActivityView = false;

function togglePacklistActivityView() {
  const packlistArea = document.getElementById('packlist-area');
  const progressArea = document.getElementById('progress-area') || document.querySelector('.progress-container');
  const activityArea = document.getElementById('activity-area');
  const toggleBtn = document.getElementById('btn-toggle-view');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');

  isActivityView = !isActivityView;

  if (isActivityView) {
    if (packlistArea) packlistArea.style.display = 'none';
    if (progressArea) progressArea.style.display = 'none';
    if (activityArea) activityArea.style.display = 'block';
    if (toggleBtn) toggleBtn.textContent = '🧳 Zur Packliste';
    if (btnPrev) btnPrev.style.visibility = 'hidden';
    if (btnNext) btnNext.style.visibility = 'hidden';
  } else {
    if (packlistArea) packlistArea.style.display = 'block';
    if (progressArea) progressArea.style.display = 'block';
    if (activityArea) activityArea.style.display = 'none';
    if (toggleBtn) toggleBtn.textContent = '🎯 Zu den Aktivitäten';
    if (btnPrev) btnPrev.style.visibility = 'visible';
    if (btnNext) btnNext.style.visibility = 'visible';
    
    updateVisibility(); 
  }
}

function addActivityItem() {
  const inputField = document.getElementById('input-activity');
  if (!inputField) return;
  
  const itemText = inputField.value.trim();
  if (itemText === "") {
    alert("Bitte gib eine Aktivität ein!");
    return;
  }

  const itemId = `activity-${Date.now()}`;
  createActivityDOM(itemId, itemText, false);
  saveActivityToStorage(itemId, itemText, false);
  inputField.value = "";
}

function createActivityDOM(itemId, text, isChecked) {
  const listContainer = document.getElementById('global-activity-list');
  if (!listContainer) return;

  const label = document.createElement("label");
  label.className = "todo-item activity-item";
  label.id = `container-${itemId}`;

  label.innerHTML = `
    <input type="checkbox" class="save-cb" id="${itemId}" ${isChecked ? 'checked' : ''} onchange="toggleActivityItem('${itemId}')">
    <span>${text}</span>
    <button class="delete-btn" onclick="deleteActivityItem('${itemId}')" style="margin-left: auto; background: none; border: none; cursor: pointer;">❌</button>
  `;

  listContainer.appendChild(label);
}

function toggleActivityItem(itemId) {
  const checkbox = document.getElementById(itemId);
  if (!checkbox) return;
  
  let items = JSON.parse(localStorage.getItem('globalActivities')) || [];
  items = items.map(item => {
    if (item.id === itemId) item.checked = checkbox.checked;
    return item;
  });
  localStorage.setItem('globalActivities', JSON.stringify(items));
}

function deleteActivityItem(itemId) {
  const element = document.getElementById(`container-${itemId}`);
  if (element) element.remove();

  let items = JSON.parse(localStorage.getItem('globalActivities')) || [];
  items = items.filter(item => item.id !== itemId);
  localStorage.setItem('globalActivities', JSON.stringify(items));
}

function saveActivityToStorage(itemId, text, checked) {
  const items = JSON.parse(localStorage.getItem('globalActivities')) || [];
  items.push({ id: itemId, text: text, checked: checked });
  localStorage.setItem('globalActivities', JSON.stringify(items));
}

function loadActivityItems() {
  const savedItems = localStorage.getItem('globalActivities');
  let items = [];

  if (savedItems === null) {
    const defaultActivities = [
      { id: `activity-def-1`, text: "🌅 Den Sonnenuntergang am Strand genießen", checked: false },
      { id: `activity-def-2`, text: "🚤 Eine Bootstour buchen", checked: false },
      { id: `activity-def-3`, text: "🐠 Schnorcheln oder im Meer schwimmen", checked: false },
      { id: `activity-def-4`, text: "🍽️ Lokale Spezialitäten im Restaurant testen", checked: false },
      { id: `activity-def-5`, text: "🏛️ Eine Sehenswürdigkeit besuchen", checked: false }
    ];
    localStorage.setItem('globalActivities', JSON.stringify(defaultActivities));
    items = defaultActivities;
  } else {
    items = JSON.parse(savedItems);
  }

  items.forEach(item => {
    createActivityDOM(item.id, item.text, item.checked);
  });
}

function getLiveWeather() {
  const cityInput = document.getElementById('weather-city');
  const display = document.getElementById('weather-display');
  
  if (!cityInput || !display) return;
  
  const city = cityInput.value.trim();
  if (city === "") {
    alert("Bitte gib einen Ort ein!");
    return;
  }
  
  display.textContent = "Wetter wird live geladen... ⏳";
  
  fetch(`https://wttr.in{encodeURIComponent(city)}?format=j1`)
    .then(response => {
      if (!response.ok) throw new Error("Ort nicht gefunden");
      return response.json();
    })
    .then(data => {
      const temp = data.current_condition[0].temp_C + "°C";
      const descText = data.current_condition[0].lang_de 
        ? data.current_condition[0].lang_de[0].value 
        : data.current_condition[0].weatherDesc[0].value;
      
      document.getElementById('weather-temp').value = temp;
      document.getElementById('weather-desc').value = descText;
      
      const weatherData = { city: city, temp: temp, desc: descText };
      localStorage.setItem('combinedWeather', JSON.stringify(weatherData));
      
      displayWeatherUI(city, temp, descText, true);
    })
    .catch(error => {
      display.textContent = "Live-Suche fehlgeschlagen. Keine Verbindung oder Ort falsch! ❌";
    });
}

function saveOfflineWeather() {
  const city = document.getElementById('weather-city').value.trim();
  const temp = document.getElementById('weather-temp').value.trim();
  const desc = document.getElementById('weather-desc').value.trim();

  if (city === "" || temp === "" || desc === "") {
    alert("Bitte fülle alle Felder aus, um das Wetter offline zu sichern!");
    return;
  }

  const weatherData = { city: city, temp: temp, desc: desc };
  localStorage.setItem('combinedWeather', JSON.stringify(weatherData));
  
  displayWeatherUI(city, temp, desc, false);
}

function displayWeatherUI(city, temp, desc, isLive) {
  const display = document.getElementById('weather-display');
  if (!display) return;
  
  const prefix = isLive ? "☀️ Live-Wetter" : "💾 Offline-Gemerkt";
  display.innerHTML = `${prefix} für <b>${city}</b>: <span style="color: #e76f51;">${temp}</span> (${desc})`;
}

function loadSavedWeather() {
  const display = document.getElementById('weather-display');
  if (!display) return;

  const saved = localStorage.getItem('combinedWeather');

  if (saved) {
    const data = JSON.parse(saved);
    if(document.getElementById('weather-city')) document.getElementById('weather-city').value = data.city;
    if(document.getElementById('weather-temp')) document.getElementById('weather-temp').value = data.temp;
    if(document.getElementById('weather-desc')) document.getElementById('weather-desc').value = data.desc;
    
    displayWeatherUI(data.city, data.temp, data.desc, false);
  } else {
    display.textContent = "Noch kein Wetter für den Urlaubsort eingetragen! 🏖️";
  }
}

function toggleVault() {
  const content = document.getElementById('vault-content');
  const icon = document.getElementById('vault-status-icon');
  
  if (!content || !icon) return;

  if (content.style.display === 'none') {
    content.style.display = 'block';
    icon.textContent = '▼'; 
  } else {
    content.style.display = 'none';
    icon.textContent = '▶';
  }
}

function saveVaultData() {
  const hotel = document.getElementById('vault-hotel').value.trim();
  const transport = document.getElementById('vault-transport').value.trim();
  const booking = document.getElementById('vault-booking').value.trim();
  const phone = document.getElementById('vault-phone').value.trim();
  const notes = document.getElementById('vault-notes').value.trim();

  const vaultData = {
    hotel: hotel,
    transport: transport,
    booking: booking,
    phone: phone,
    notes: notes
  };

  localStorage.setItem('travelVaultData', JSON.stringify(vaultData));
  alert("Reise-Dokumente und Notizen erfolgreich im Offline-Tresor gesichert! 🔐💾");
}

function loadVaultData() {
  const saved = localStorage.getItem('travelVaultData');
  if (!saved) return;

  const data = JSON.parse(saved);

  if (document.getElementById('vault-hotel')) document.getElementById('vault-hotel').value = data.hotel || '';
  if (document.getElementById('vault-transport')) document.getElementById('vault-transport').value = data.transport || '';
  if (document.getElementById('vault-booking')) document.getElementById('vault-booking').value = data.booking || '';
  if (document.getElementById('vault-phone')) document.getElementById('vault-phone').value = data.phone || '';
  if (document.getElementById('vault-notes')) document.getElementById('vault-notes').value = data.notes || ''; // NEU: Notizen ins Feld eintragen
}