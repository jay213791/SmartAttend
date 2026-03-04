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
    loginUser();
});

async function loginUser() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
        Swal.fire({
            icon: 'warning',
            title: "Missing Fields",
            text: "Please enter email and password",
        });
        return;
    }

    try {
        const response = await fetch(`https://smartattend-production-c29f.up.railway.app/teacher/login`, {
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
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                window.location.href = "teacherDashboard.html";
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

        Swal.fire({
            icon: "success",
            title: "OTP sent",
            text: data,
            timer: 2000,
            showConfirmButton: false,
        }).then(() => {
            resetEmail = email;
            document.getElementById("forgotModal").style.display = "none";
            document.getElementById("verifyForgotModal").style.display = "block";
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

async function VerifyOtp() {
    const email = resetEmail;
    const otp = document.getElementById("otp").value;

    if (!otp) {
        Swal.fire({
            icon: "warning",
            title: "Enter OTP",
            text: "Please enter the OTP Code",
        });
        return;
    }

    try {
        const response = await fetch(`/teacher/verify-otp`, {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ email, otp})
        })

        const data = await response.text();

        if (!response.ok) {
            Swal.fire({
                icon: "error",
                title: "Verify OTP",
                text: data,
            });
            return;
        }

        Swal.fire({
            icon: "success",
            title: "OTP verified",
            text: data,
            timer: 2000,
            showConfirmButton: false
        }).then(() => {
            document.getElementById("verifyForgotModal").style.display = "none";
            document.getElementById("changePasswordModal").style.display = "block";
        });
    } catch (error) {
        console.error("VerifyOtp", error);
        Swal.fire({
            icon: "error",
            title: "Server Error",
            text: "Unable to connect to server",
        });
    }
}

function closechangeForgotModal() {
    document.getElementById("changePasswordModal").style.display = "none";
}

async function submitNewPassword(){
    const email = resetEmail;
    const password = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmNewPassword").value;

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