window.onload = loadProfile;
let originalName = ''

async function loadProfile() {
    try {
        const res = await fetch('/teacher/me');
        if (!res.ok) { window.location.href = '/body/login.html'; return; }
        const data = await res.json();
        renderProfile(data);
    } catch (e) {
        console.error(e);
    }
}

function renderProfile(data) {
    const initials = (data.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    // Header
    document.getElementById('headerName').textContent = data.name || '';
    setAvatar('headerAvatar', 'headerInitials', data.profilePicture, initials);

    // Profile card
    document.getElementById('profileName').textContent = data.name || '';
    document.getElementById('profileEmail').textContent = data.email || '';
    setAvatar('profileAvatar', 'profileInitials', data.profilePicture, initials);

    // Form fields
    originalName = data.name || '';
    document.getElementById('nameInput').value = originalName;
    document.getElementById('emailInput').value = data.email || '';
}

function setAvatar(imgId, initialsId, picture, initials) {
    const img = document.getElementById(imgId);
    const span = document.getElementById(initialsId);
    if (picture) {
        img.src = picture;
        img.style.display = 'block';
        span.style.display = 'none';
    } else {
        img.style.display = 'none';
        span.style.display = '';
        span.textContent = initials;
    }
    // show delete button only on the profile card avatar
    if (imgId === 'profileAvatar') {
        const btn = document.getElementById('deleteAvatarBtn');
        if (btn) btn.style.display = picture ? 'flex' : 'none';
    }
}

async function saveName() {
    const name = document.getElementById('nameInput').value.trim();
    if (name === originalName) {
        return Swal.fire({
            icon: 'info',
            title: 'Nothing to update',
            text: 'Your name is already set to this value.',
            timer: 1800,
            showConfirmButton: false
        });
    }
    if (!name) { return showError('Name cannot be empty'); }

    const res = await fetch('/teacher/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    });

    if (res.ok) {
        const data = await res.json();
        renderProfile(data);
        Swal.fire({ icon: 'success', title: 'Saved!', text: 'Your name has been updated.', timer: 1800, showConfirmButton: false });
    } else {
        showError(await res.text());
    }
}

async function savePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword     = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!currentPassword || !newPassword || !confirmPassword) return showError('Please fill in all password fields.');
    if (newPassword !== confirmPassword) return showError('New passwords do not match.');
    if (newPassword.length < 6) return showError('New password must be at least 6 characters.');

    // Step 1 — send OTP to teacher's email
    Swal.fire({ title: 'Sending OTP...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    const sendRes = await fetch('/teacher/send-change-password-otp', { method: 'POST' });
    if (!sendRes.ok) { return showError(await sendRes.text()); }
    const sendMsg = await sendRes.text();
    Swal.close();

    // Step 2 — ask for OTP
    const otpResult = await Swal.fire({
        title: '<i class="fa-solid fa-envelope" style="color:#0F6577"></i> Verify Your Identity',
        html: `<p style="font-size:13px;color:#64748b;margin:0 0 16px">${sendMsg}</p>
               <input id="swal-otp" class="swal2-input" placeholder="Enter 6-digit OTP" maxlength="6" style="letter-spacing:6px;font-size:18px;text-align:center">`,
        showCancelButton: true,
        confirmButtonText: 'Verify',
        confirmButtonColor: '#0F6577',
        focusConfirm: false,
        preConfirm: () => {
            const val = document.getElementById('swal-otp').value.trim();
            if (!val || val.length !== 6) { Swal.showValidationMessage('Please enter the 6-digit OTP'); return false; }
            return val;
        }
    });

    if (!otpResult.isConfirmed) return;

    // Step 3 — verify OTP then change password
    const email = document.getElementById('emailInput').value;
    const verifyRes = await fetch('/teacher/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpResult.value })
    });

    if (!verifyRes.ok) { return showError(await verifyRes.text()); }

    // OTP verified — now update password
    const res = await fetch('/teacher/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
    });

    if (res.ok) {
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        Swal.fire({ icon: 'success', title: 'Password Updated!', text: 'Your password has been changed.', timer: 1800, showConfirmButton: false });
    } else {
        showError(await res.text());
    }
}

async function deleteProfilePicture() {
    const result = await Swal.fire({
        icon: 'warning',
        title: 'Remove photo?',
        text: 'Your profile picture will be removed.',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Yes, remove it'
    });
    if (!result.isConfirmed) return;

    const res = await fetch('/teacher/profile-picture', { method: 'DELETE' });
    if (res.ok) {
        const initials = document.getElementById('profileInitials').textContent ||
                         document.getElementById('headerInitials').textContent;
        setAvatar('profileAvatar', 'profileInitials', null, initials);
        setAvatar('headerAvatar', 'headerInitials', null, initials);
        Swal.fire({ icon: 'success', title: 'Photo removed', timer: 1500, showConfirmButton: false });
    } else {
        showError('Failed to remove photo.');
    }
}

async function uploadProfilePicture(input) {
    if (!input.files[0]) return;
    const formData = new FormData();
    formData.append('file', input.files[0]);

    const res = await fetch('/teacher/profile-picture', { method: 'POST', body: formData });
    if (res.ok) {
        const base64 = await res.text();
        const initials = document.getElementById('profileInitials').textContent;
        setAvatar('headerAvatar', 'headerInitials', base64, initials);
        setAvatar('profileAvatar', 'profileInitials', base64, initials);
    } else {
        showError('Failed to upload image.');
    }
}

function togglePw(id, btn) {
    const input = document.getElementById(id);
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    btn.querySelector('i').className = isHidden ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
}

function showError(msg) {
    Swal.fire({ icon: 'error', title: 'Oops!', text: msg });
}

function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('open');
    document.getElementById('hamburgerBtn').classList.toggle('open');
    document.getElementById('sidebarOverlay').classList.toggle('active');
}

function logoutFunction(){
    document.getElementById("LogoutModal").style.display = "block";
}

function LogoutBtn(){
    fetch("/logout", {
        method: "POST",
        credentials: "include"
    }).then(() => {
        window.location.href = "/body/login.html";
    });
}

function closeLogoutModal(){
    document.getElementById("LogoutModal").style.display = "none";
}
