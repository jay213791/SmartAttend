//register password eye icon
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

// confirm password eye icon
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

//prevent from submitting yung form
document.getElementById("registerForm").addEventListener("submit", function (e){
    e.preventDefault();
    validateRegister();
});


// this function check kung yung email exists sa database
async function checkEmailExists(email) {
    try {
        const response = await fetch(`/teacher/check-email?email=${email}`);

        if (response.status === 400) {
            return true;
        } else if (response.ok) {
            return false;
        } else {
            console.error("Unexpected server response: ", response.status, await response.text());
            return true;
        }
      // this run if yung fetch ay hindi gumana (fetch sa back end)
    } catch (error) {
        console.error("Error checking email:", error);
        return true;
    }
}

// this function validate the register form
async function validateRegister() {

    const password = document.getElementById("RegisterPassword").value;
    const confirmPassword = document.getElementById("ConfirmPassword").value;
    const email = document.getElementById("register_email").value;
    const name = document.getElementById("register_name").value;

    if (!password || !confirmPassword || !email || !name) {
        Swal.fire({
            icon: "warning",
            title: "Missing Fields",
            text: "Please fill up the form",
        });
    }

    if (!isValidEmail(email)) {
        Swal.fire({
            icon: "error",
            title: "Invalid Email",
            text: "Please enter valid email address",
        });
        return;
    }

    const exists  = await checkEmailExists(email);

    if (exists) {
        Swal.fire({
            icon: "error",
            title: "Email already exists",
            text: "Please use different email address",
        });
        return;
    }

    if (password.length < 6) {
        Swal.fire({
            icon: 'warning',
            title: 'Warning',
            text: 'Password must be at least 6 characters',
            background: '#ffffff',
            color: '#333',
            confirmButtonColor: '#4e73df'
        });
        return;
    }

    if (password !== confirmPassword) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Password do not match!',
        });
        return;
    }

    // save teacher info to database
    const teacherData = {
        name: name,
        email: email,
        password: password,
    };

    try {
        const response = await fetch(`/teacher/add`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(teacherData),
        });

        if (response.ok) {
            Swal.fire({
                icon: "success",
                title: "Success",
                text: "Your account has been created successfully! Wait for admin approval.",
                timer: 3000,
                showConfirmButton: false,
            }).then(() => {
                document.getElementById("registerForm").reset();
            });
        } else {
            const errorText = await response.text();
            Swal.fire({
                icon: "error",
                title: "Error",
                text: errorText || "Something went wrong",
            });
        }
    } catch (error) {
        console.error("Error submitting teacher:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Unable to connect to the server",
        });
    }
}

// function for email validation kung valid
function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}
