const loginBox = document.getElementById('loginBox');
const adminBox = document.getElementById('adminBox');
const loginMsg = document.getElementById('loginMsg');
const form = document.getElementById('eventForm');
const list = document.getElementById('eventList');
const formTitle = document.getElementById('formTitle');

function $(id) { return document.getElementById(id); }
function timeShort(t) { return t ? t.slice(0,5) : ''; }
function formatDate(d) { return new Date(d + 'T00:00:00').toLocaleDateString('th-TH', { day:'numeric', month:'short', year:'numeric' }); }

async function checkSession() {
  const { data } = await supabaseClient.auth.getSession();
  if (data.session) showAdmin(); else showLogin();
}
function showLogin() { loginBox.classList.remove('hidden'); adminBox.classList.add('hidden'); }
function showAdmin() { loginBox.classList.add('hidden'); adminBox.classList.remove('hidden'); loadEvents(); }

$('loginBtn').onclick = async () => {
  loginMsg.textContent = 'กำลังเข้าสู่ระบบ...';
  const { error } = await supabaseClient.auth.signInWithPassword({
    email: $('email').value,
    password: $('password').value
  });
  if (error) loginMsg.textContent = error.message;
  else { loginMsg.textContent = ''; showAdmin(); }
};
$('logoutBtn').onclick = async () => { await supabaseClient.auth.signOut(); showLogin(); };

async function loadEvents() {
  const { data, error } = await supabaseClient
    .from('events')
    .select('*')
    .order('event_date', { ascending: true })
    .order('start_time', { ascending: true });
  if (error) { list.innerHTML = `<p class="msg">${error.message}</p>`; return; }
  renderList(data || []);
}

function renderList(events) {
  list.innerHTML = events.map(ev => `
    <div class="list-card">
      <div>
        <b>${ev.title}</b>
        <p>${formatDate(ev.event_date)} ${timeShort(ev.start_time)} • ${ev.type || ''}</p>
      </div>
      <div class="row">
        <button class="dark-btn" onclick='editEvent(${JSON.stringify(ev).replaceAll("'", "&apos;")})'>แก้</button>
        <button class="danger-btn" onclick="deleteEvent('${ev.id}')">ลบ</button>
      </div>
    </div>
  `).join('') || '<p class="muted">ยังไม่มีงาน</p>';
}

window.editEvent = (ev) => {
  formTitle.textContent = 'แก้ไขงาน';
  $('eventId').value = ev.id;
  $('title').value = ev.title || '';
  $('artist').value = ev.artist || '';
  $('eventDate').value = ev.event_date || '';
  $('startTime').value = timeShort(ev.start_time);
  $('endTime').value = timeShort(ev.end_time);
  $('type').value = ev.type || 'Live Band';
  $('posterUrl').value = ev.poster_url || '';
  $('description').value = ev.description || '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteEvent = async (id) => {
  if (!confirm('ลบงานนี้ใช่ไหม?')) return;
  const { error } = await supabaseClient.from('events').delete().eq('id', id);
  if (error) alert(error.message); else loadEvents();
};

$('cancelEdit').onclick = () => resetForm();
function resetForm() { form.reset(); $('eventId').value = ''; formTitle.textContent = 'เพิ่มงาน'; }

form.onsubmit = async (e) => {
  e.preventDefault();
  const id = $('eventId').value;
  const payload = {
    title: $('title').value.trim(),
    artist: $('artist').value.trim(),
    event_date: $('eventDate').value,
    start_time: $('startTime').value || null,
    end_time: $('endTime').value || null,
    type: $('type').value,
    poster_url: $('posterUrl').value.trim() || null,
    description: $('description').value.trim(),
    updated_at: new Date().toISOString()
  };
  const { error } = id
    ? await supabaseClient.from('events').update(payload).eq('id', id)
    : await supabaseClient.from('events').insert(payload);
  if (error) alert(error.message);
  else { resetForm(); loadEvents(); }
};

supabaseClient.channel('events-admin')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, loadEvents)
  .subscribe();

checkSession();
