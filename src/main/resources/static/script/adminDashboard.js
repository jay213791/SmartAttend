let allTeachers = [];
let currentTab = 'all';

window.onload = async () => {
    await loadAdmin();
    await loadTeachers();
};

async function loadAdmin() {
    const res = await fetch('/admin/me');
    if (!res.ok) { window.location.replace('/body/login.html'); return; }
    const data = await res.json();
    document.getElementById('adminName').textContent = 'Hi, ' + (data.name || 'Admin');
}

async function loadTeachers() {
    const res = await fetch('/admin/teachers');
    if (!res.ok) return;
    allTeachers = await res.json();
    updateStats();
    renderTable();
}

function updateStats() {
    const total    = allTeachers.length;
    const pending  = allTeachers.filter(t => t.status === 'pending').length;
    const approved = allTeachers.filter(t => t.status === 'approved').length;
    const banned   = allTeachers.filter(t => t.status === 'banned').length;

    document.getElementById('statTotal').textContent    = total;
    document.getElementById('statPending').textContent  = pending;
    document.getElementById('statApproved').textContent = approved;
    document.getElementById('statBanned').textContent   = banned;
    document.getElementById('pendingBadge').textContent = pending;
    document.getElementById('pendingBadge').style.display = pending > 0 ? '' : 'none';
}

function showTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    event.currentTarget.classList.add('active');

    const titles = { all: 'All Teachers', pending: 'Pending Approval', approved: 'Approved Teachers', banned: 'Banned Teachers' };
    document.getElementById('tableTitle').textContent = titles[tab];
    document.getElementById('searchInput').value = '';
    renderTable();
}

function renderTable() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    let filtered = allTeachers;

    if (currentTab !== 'all') filtered = filtered.filter(t => t.status === currentTab);
    if (search) filtered = filtered.filter(t =>
        (t.name || '').toLowerCase().includes(search) ||
        (t.email || '').toLowerCase().includes(search)
    );

    const tbody = document.getElementById('teacherTableBody');
    const empty = document.getElementById('emptyState');
    tbody.innerHTML = '';

    if (filtered.length === 0) {
        empty.style.display = 'block';
        return;
    }
    empty.style.display = 'none';

    filtered.forEach(t => {
        const initials = (t.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
        const avatarHtml = t.profilePicture
            ? `<img class="teacher-avatar" src="${t.profilePicture}" alt="">`
            : `<div class="teacher-initials">${initials}</div>`;

        const statusClass = t.status || 'pending';
        const statusIcon = { pending: 'fa-clock', approved: 'fa-circle-check', banned: 'fa-ban' }[statusClass] || 'fa-clock';

        let actions = '';
        if (t.status === 'pending') {
            actions = `
                <button class="btn-approve" onclick="approveTeacher(${t.id})"><i class="fa-solid fa-check"></i> Approve</button>
                <button class="btn-ban"     onclick="banTeacher(${t.id})"><i class="fa-solid fa-ban"></i> Ban</button>
                <button class="btn-delete"  onclick="deleteTeacher(${t.id})"><i class="fa-solid fa-trash"></i></button>`;
        } else if (t.status === 'approved') {
            actions = `
                <button class="btn-ban"    onclick="banTeacher(${t.id})"><i class="fa-solid fa-ban"></i> Ban</button>
                <button class="btn-delete" onclick="deleteTeacher(${t.id})"><i class="fa-solid fa-trash"></i></button>`;
        } else if (t.status === 'banned') {
            actions = `
                <button class="btn-unban"  onclick="approveTeacher(${t.id})"><i class="fa-solid fa-rotate-left"></i> Unban</button>
                <button class="btn-delete" onclick="deleteTeacher(${t.id})"><i class="fa-solid fa-trash"></i></button>`;
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="teacher-cell">
                    ${avatarHtml}
                    <span class="teacher-name">${t.name || '—'}</span>
                </div>
            </td>
            <td>${t.email}</td>
            <td>${t.createdAt || '—'}</td>
            <td><span class="status-pill ${statusClass}"><i class="fa-solid ${statusIcon}"></i> ${capitalize(statusClass)}</span></td>
            <td><div class="action-btns">${actions}</div></td>
        `;
        tbody.appendChild(row);
    });
}

async function approveTeacher(id) {
    const res = await fetch(`/admin/teachers/${id}/approve`, { method: 'PUT' });
    if (res.ok) { await loadTeachers(); toast('Teacher approved!', 'success'); }
}

async function banTeacher(id) {
    const result = await Swal.fire({
        icon: 'warning', title: 'Ban this teacher?',
        text: 'They will no longer be able to log in.',
        showCancelButton: true, confirmButtonColor: '#d97706',
        confirmButtonText: 'Yes, ban'
    });
    if (!result.isConfirmed) return;
    const res = await fetch(`/admin/teachers/${id}/ban`, { method: 'PUT' });
    if (res.ok) { await loadTeachers(); toast('Teacher banned.', 'warning'); }
}

async function deleteTeacher(id) {
    const result = await Swal.fire({
        icon: 'warning', title: 'Delete this teacher?',
        text: 'This action cannot be undone.',
        showCancelButton: true, confirmButtonColor: '#dc2626',
        confirmButtonText: 'Yes, delete'
    });
    if (!result.isConfirmed) return;
    const res = await fetch(`/admin/teachers/${id}`, { method: 'DELETE' });
    if (res.ok) { await loadTeachers(); toast('Teacher deleted.', 'error'); }
}

async function logoutAdmin() {
    await fetch('/logout', { method: 'POST' }).catch(() => {});
    window.location.replace('/body/login.html');
}

function toast(msg, icon) {
    Swal.fire({ icon, title: msg, timer: 1600, showConfirmButton: false, toast: true, position: 'top-end' });
}

function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }
