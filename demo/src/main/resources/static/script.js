//log in password
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

//register password
function RegisterTogglePass() {
    const RegisterPassword = document.getElementById("RegisterPassword");
    const RegisterEyeIcon = document.getElementById("RegisterEyeIcon");

    if (RegisterPassword.type === "password") {
        RegisterPassword.type = "text";
        RegisterEyeIcon.classList.remove("fa-eye");
        RegisterEyeIcon.classList.add("fa-eye-slash");
    } else {
        RegisterPassword.type = "password";
        RegisterEyeIcon.classList.remove("fa-eye-slash");
        RegisterEyeIcon.classList.add("fa-eye");
    }
}

// confirm password
function ConfirmPasswordToggle() {
    const ConfirmPassword = document.getElementById("ConfirmPassword");
    const ConfirmEyeIcon = document.getElementById("ConfirmEyeIcon");

    if (ConfirmPassword.type === "password") {
        ConfirmPassword.type = "text";
        ConfirmEyeIcon.classList.remove("fa-eye");
        ConfirmEyeIcon.classList.add("fa-eye-slash");
    } else {
        ConfirmPassword.type = "password";
        ConfirmEyeIcon.classList.remove("fa-eye-slash");
        ConfirmEyeIcon.classList.add("fa-eye");
    }
}

//check muna the information
document.getElementById("registerBtn").addEventListener("click", function (e){
    e.preventDefault();
    validateRegister(e);
});

function validateRegister(event) {
    event.preventDefault();

    const password = document.getElementById("RegisterPassword").value;
    const confirmPassword = document.getElementById("ConfirmPassword").value;

    if (password.length < 6) {
        alert("Password must be between 6 characters.");
        return false;
    }

    if (password !== confirmPassword) {
        alert("Password do not match.");
        return false;
    }

    alert("Registration successfully.");
    return true;

}
