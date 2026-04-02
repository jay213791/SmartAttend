let resetEmail = "";

//log in password eye icon
function togglePassword() {
    const passwordInput = document.getElementById("password");
    const eyeIcon = document.getElementById("eyeIcon");

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        eyeIcon.classList.remove("fa-eye");
        eyeIcon.classList.add("fa-eye-slash");
    } else {
        passwordInput.type = "password";
        eyeIcon.classList.remove("fa-eye-slash");
        eyeIcon.classList.add("fa-eye");
    }
}

document.getElementById("loginForm").addEventListener("submit", function (e){
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    if (email === 'open@admin') {
        openAdminPasscode();
        return;
    }
    loginUser();
});

async function loginUser() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const form = document.getElementById("loginForm");

    if (!email || !password) {
        Swal.fire({
            icon: 'warning',
            title: "Missing Fields",
            text: "Please enter email and password",
        });
        return;
    }

    try {
        const response = await fetch(`/teacher/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email,
                password: password
            }),
            credentials: "include"
        });

        if (response.ok) {
            const data = await response.json();
            // this part still need some changes para mas lalong secured
            localStorage.setItem("teacher", JSON.stringify(data));

            Swal.fire({
                icon: "success",
                title: "Login Successful",
                text: "Welcome to SmartAttend!",
                allowOutsideClick: false,
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                window.location.href = "TeacherDashboard.html";
                form.reset();
            });
        } else {
            const errorMessage = await response.text();

            Swal.fire({
                icon: "error",
                title: "Login Failed",
                text: errorMessage,
            });
        }
    } catch (error) {
        console.error("Login Failed", error);
        Swal.fire({
            icon: "error",
            title: "Server Error",
            text: "Unable to connect to server",
        });
    }
}

// para sa reset password function

function openForgotModal() {
    document.getElementById("forgotModal").style.display = "block";
}

function closeForgotModal() {
    document.getElementById("forgotModal").style.display = "none";
}

async function forgotPassword() {
    const email = document.getElementById("ForgotEmail").value
    const form = document.getElementById("emailForm");

    if (!email) {
        Swal.fire({
            icon: "warning",
            title: "Enter Email",
            text: "Please enter email",
        });
        return;
    }

    Swal.fire({
        title: "Sending OTP...",
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        const response = await fetch(`/teacher/forgot-password`, {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ email })
        });

        const data = await response.text();

        Swal.close();

        if (!response.ok) {
            Swal.fire({
                icon: "error",
                title: "Failed to access token",
                text: data,
            });
            return;
        }

        resetEmail = email;
        document.getElementById("forgotModal").style.display = "none";
        form.reset();

        const otpResult = await Swal.fire({
            title: '<i class="fa-solid fa-envelope" style="color:#0F6577"></i> Verify Your Identity',
            html: `<p style="font-size:13px;color:#64748b;margin:0 0 16px">${data}</p>
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

        const verifyRes = await fetch(`/teacher/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: resetEmail, otp: otpResult.value })
        });

        const verifyData = await verifyRes.text();

        if (!verifyRes.ok) {
            Swal.fire({ icon: 'error', title: 'Verify OTP', text: verifyData });
            return;
        }

        Swal.fire({
            icon: 'success', title: 'OTP Verified', text: verifyData,
            timer: 2000, showConfirmButton: false
        }).then(() => {
            document.getElementById('changePasswordModal').style.display = 'block';
        });

    } catch (error) {
        Swal.close();

        console.error("Login Failed", error);
        Swal.fire({
            icon: "error",
            title: "Server Error",
            text: "Unable to connect to server",
        });
    }
}

function closeverifyForgotModal() {
    document.getElementById("verifyForgotModal").style.display = "none";
}

function closechangeForgotModal() {
    document.getElementById("changePasswordModal").style.display = "none";
}

async function submitNewPassword(){
    const email = resetEmail;
    const password = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmNewPassword").value;
    const form = document.getElementById("newPasswordForm");

    if (!newPassword) {
        Swal.fire({
            icon: "warning",
            title: "Enter New Password",
            text: "Please enter new password",
        });
        return;
    }

    if (confirmPassword !== password) {
        Swal.fire({
            icon: "error",
            title: "Invalid Password",
            text: "Passwords do not match"
        });
        return;
    }

    try {
        const response = await fetch(`/teacher/reset-password`, {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password})
        })

        const data = await response.text();

        if (!response.ok) {
            Swal.fire({
                icon: "error",
                title: "Error Encountered",
                text: data,
            });
            return;
        }

        Swal.fire({
            icon: "success",
            title: "Password reset successful",
            text: data,
            timer: 2000,
            showConfirmButton: false
        }).then(() => {
            document.getElementById("changePasswordModal").style.display = "none";
            form.reset();
        });
    } catch (error) {
        console.error("Login Failed", error);
        Swal.fire({
            icon: "error",
            title: "Server Error",
            text: "Unable to connect to server",
        });
    }
}

function openAdminPasscode() {
    Swal.fire({
        title: '<i class="fa-solid fa-shield-halved" style="color:#0F6577"></i> Admin Access',
        input: 'password',
        inputPlaceholder: 'Enter passcode',
        inputAttributes: { autocomplete: 'off' },
        showCancelButton: true,
        confirmButtonText: 'Enter',
        confirmButtonColor: '#0F6577',
        cancelButtonColor: '#aaa',
        inputValidator: (value) => {
            if (!value) return 'Please enter the passcode';
        }
    }).then((result) => {
        if (result.isConfirmed) {
            if (result.value === 'smartattend@admin') {
                sessionStorage.setItem('adminGate', 'granted');
                window.location.href = '/body/adminLogin.html';
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Access Denied',
                    text: 'Incorrect passcode.',
                    timer: 1800,
                    showConfirmButton: false
                });
            }
        }
    });
}

function newPassToggle(){
    const NewPasswordInput = document.getElementById("newPassword");
    const eyeIcon = document.getElementById("newPassEyeIcon");

    if (NewPasswordInput.type === "password") {
        NewPasswordInput.type = "text";
        eyeIcon.classList.remove("fa-eye");
        eyeIcon.classList.add("fa-eye-slash");
    } else {
        NewPasswordInput.type = "password";
        eyeIcon.classList.remove("fa-eye-slash");
        eyeIcon.classList.add("fa-eye");
    }
}

function ConfirmNewPassToggle(){
    const ConfirmpasswordInput = document.getElementById("confirmNewPassword");
    const eyeIcon = document.getElementById("ConfirmNewPassEyeIcon");

    if (ConfirmpasswordInput.type === "password") {
        ConfirmpasswordInput.type = "text";
        eyeIcon.classList.remove("fa-eye");
        eyeIcon.classList.add("fa-eye-slash");
    } else {
        ConfirmpasswordInput.type = "password";
        eyeIcon.classList.remove("fa-eye-slash");
        eyeIcon.classList.add("fa-eye");
    }
}