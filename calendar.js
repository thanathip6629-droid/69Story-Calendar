let currentDate = new Date();
let events = [];

const grid = document.getElementById('calendarGrid');
const monthTitle = document.getElementById('monthTitle');
const nextEventBox = document.getElementById('nextEvent');
const dialog = document.getElementById('eventDialog');
const detail = document.getElementById('eventDetail');

const typeEmoji = { 'Live Band': '🎤', DJ: '🎧', Concert: '🔥', Private: '⭐', Closed: '🔴' };

function thMonth(date) {
  return date.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });
}
function isoDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
function formatThaiDate(dateText) {
  return new Date(dateText + 'T00:00:00').toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
}
function timeRange(ev) {
  if (ev.start_time && ev.end_time) return `${ev.start_time.slice(0,5)}-${ev.end_time.slice(0,5)}`;
  if (ev.start_time) return ev.start_time.slice(0,5);
  return '';
}

async function loadEvents() {
  const { data, error } = await supabaseClient
    .from('events')
    .select('*')
    .order('event_date', { ascending: true })
    .order('start_time', { ascending: true });
  if (error) {
    nextEventBox.innerHTML = `<div class="muted">ERROR</div><h1>ตั้งค่า Supabase ก่อนใช้งาน</h1><p>${error.message}</p>`;
    return;
  }
  events = data || [];
  renderCalendar();
  renderNextEvent();
}

function renderNextEvent() {
  const today = isoDate(new Date());
  const next = events.find(e => e.event_date >= today);
  if (!next) {
    nextEventBox.innerHTML = `<div class="muted">NEXT EVENT</div><h1>ยังไม่มีงานที่กำลังจะมาถึง</h1>`;
    return;
  }
  nextEventBox.innerHTML = `
    <div class="muted">NEXT EVENT</div>
    <h1>${typeEmoji[next.type] || '📅'} ${next.title}</h1>
    <p>${formatThaiDate(next.event_date)} ${timeRange(next)}</p>
    ${next.poster_url ? `<img src="${next.poster_url}" alt="poster" class="next-poster">` : ''}
  `;
  nextEventBox.onclick = () => openDetail(next);
}

function renderCalendar() {
  grid.innerHTML = '';
  monthTitle.textContent = thMonth(currentDate);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startOffset = (first.getDay() + 6) % 7;

  for (let i = 0; i < startOffset; i++) grid.appendChild(document.createElement('div'));

  for (let day = 1; day <= last.getDate(); day++) {
    const date = new Date(year, month, day);
    const dateKey = isoDate(date);
    const cell = document.createElement('div');
    cell.className = 'day-cell';
    cell.innerHTML = `<div class="day-number">${day}</div>`;
    const dayEvents = events.filter(e => e.event_date === dateKey);
    dayEvents.forEach(ev => {
      const chip = document.createElement('button');
      chip.className = `event-chip ${ev.type?.toLowerCase().replaceAll(' ', '-')}`;
      chip.textContent = `${typeEmoji[ev.type] || '📅'} ${ev.title}`;
      chip.onclick = () => openDetail(ev);
      cell.appendChild(chip);
    });
    grid.appendChild(cell);
  }
}

function openDetail(ev) {
  detail.innerHTML = `
    <h2>${typeEmoji[ev.type] || '📅'} ${ev.title}</h2>
    <p class="muted">${ev.type || ''}</p>
    <p><b>วันที่:</b> ${formatThaiDate(ev.event_date)}</p>
    <p><b>เวลา:</b> ${timeRange(ev) || '-'}</p>
    <p><b>ศิลปิน:</b> ${ev.artist || '-'}</p>
    ${ev.poster_url ? `<img src="${ev.poster_url}" alt="poster" class="detail-poster">` : ''}
    <p>${ev.description || ''}</p>
  `;
  dialog.showModal();
}

document.getElementById('prevMonth').onclick = () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); };
document.getElementById('nextMonth').onclick = () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); };

supabaseClient.channel('events-calendar')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, loadEvents)
  .subscribe();

loadEvents();
