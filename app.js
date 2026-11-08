const $ = id => document.getElementById(id);
const num = id => Math.max(0, Number($(id).value) || 0);
const money = n => '฿' + n.toLocaleString('th-TH');

function showPage(id, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
  $(id).classList.add('active');
  btn.classList.add('active');
}

function percent(value, base) {
  return base ? value / base * 100 : 0;
}

function setRing(id, pct) {
  $(id).style.setProperty('--p', Math.min(100, pct));
}

function updateDateLabel() {
  const v = $('date').value;
  $('dateLabel').textContent = v
    ? new Date(v + 'T00:00:00').toLocaleDateString('th-TH', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      })
    : '';
}

function calculate() {
  // Today
  const occupied = num('sold') + num('continueToday') + num('monthlyToday');
  const available = Math.max(0, num('total') - num('offToday'));
  const pctToday = percent(occupied, num('baseToday'));

  $('occupiedToday').textContent = occupied;
  $('vacantToday').textContent = Math.max(0, available - occupied);
  $('percentToday').textContent = pctToday.toFixed(2) + '%';
  setRing('ringToday', pctToday);

  // Tomorrow
  const forecast = num('confirmed') + num('pending') +
    num('continueTomorrow') + num('monthlyTomorrow');
  const forecastAvailable = Math.max(0, num('total') - num('offTomorrow'));
  const pctTomorrow = percent(forecast, num('baseTomorrow'));

  $('confirmedResult').textContent = num('confirmed');
  $('pendingResult').textContent = num('pending');
  $('continueResult').textContent = num('continueTomorrow');
  $('monthlyResult').textContent = num('monthlyTomorrow');
  $('forecast').textContent = forecast;
  $('vacantTomorrow').textContent = Math.max(0, forecastAvailable - forecast);
  $('percentTomorrow').textContent = pctTomorrow.toFixed(2) + '%';
  setRing('ringTomorrow', pctTomorrow);

  // Cash
  const nightEntered = $('nightRoom').value !== '' || $('nightShop').value !== '';
  const day = num('dayRoom') + num('dayShop');
  const night = num('nightRoom') + num('nightShop');

  $('dayTotal').textContent = money(day);
  $('nightTotal').textContent = nightEntered ? money(night) : 'ยังไม่กรอก';
  $('grandTotal').textContent = money(day + night);
}

function saveReport() {
  const data = {};
  document.querySelectorAll('input').forEach(input => {
    data[input.id] = input.value;
  });

  try {
    localStorage.setItem('easyHotel_' + $('date').value, JSON.stringify(data));
    $('status').textContent = 'บันทึกข้อมูลเรียบร้อย';
  } catch (e) {
    $('status').textContent = 'บันทึกไม่สำเร็จ';
  }
  setTimeout(() => { $('status').textContent = ''; }, 3000);
}

function loadReport() {
  updateDateLabel();
  const data = JSON.parse(
    localStorage.getItem('easyHotel_' + $('date').value) || 'null'
  );

  if (data) {
    Object.keys(data).forEach(id => {
      if (id !== 'date' && $(id)) $(id).value = data[id];
    });
  }
  calculate();
}

function exportCSV() {
  const data = [['รายการ', 'ข้อมูล']];
  document.querySelectorAll('input').forEach(input => {
    data.push([input.id, input.value]);
  });

  const csv = '\uFEFF' + data.map(row =>
    row.map(value => '"' + String(value).replaceAll('"', '""') + '"').join(',')
  ).join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'easy-hotel-report.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}

document.querySelectorAll('input').forEach(input => {
  input.addEventListener('input', calculate);
});

$('date').value = new Date().toLocaleDateString('en-CA');
$('date').addEventListener('change', loadReport);

loadReport();
