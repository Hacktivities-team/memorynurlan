const countryListEl = document.getElementById('countryList');
countries.forEach(c=>{
  const d = document.createElement('div');
  d.className = 'country-card';
  d.innerHTML = `<div class="flag">${c.flag}</div>
                 <strong>${c.name}</strong>
                 <div class="meta">${c.meta}</div>`;

  // Klikləmə funksiyası: müvafiq HTML səhifəyə yönləndirmək
  d.addEventListener('click', ()=>{
    if(c.name === 'Türkiyə') window.location.href = 'turkiye.html';
    else if(c.name === 'Gürcüstan') window.location.href = 'georgia.html';
    else if(c.name === 'Rusiya') window.location.href = 'russia.html';
    else if(c.name === 'BƏƏ') window.location.href = 'uea.html';
  });

  countryListEl.appendChild(d);
});
