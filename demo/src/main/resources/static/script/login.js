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
        const response = await fetch(`/teacher/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
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
                window.location.href = "TeacherDashboard.html";
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