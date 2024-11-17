document.addEventListener("DOMContentLoaded", async () => {
  // Login and Register forms toggle
  let step = 1;
  const loginForm = document.querySelector(".login__form");
  const registerForm = document.querySelector(".register__form");

  const updateFormVisibility = () => {
    if (step === 1) {
      loginForm.style.display = "block";
      registerForm.style.display = "none";
    } else if (step === 2) {
      loginForm.style.display = "none";
      registerForm.style.display = "block";
    }
  };

  // Initialize visibility
  if (loginForm && registerForm) {
    updateFormVisibility();
  }

  // Handle "Sign Up" and "Log In" link clicks
  const registerLink = document.querySelector(".register__link");
  const loginLink = document.querySelector(".login__link");

  if (registerLink) {
    registerLink.addEventListener("click", (event) => {
      event.preventDefault(); // Prevent default link behavior
      step = 2; // Switch to register form
      updateFormVisibility();
    });
  }

  if (loginLink) {
    loginLink.addEventListener("click", (event) => {
      event.preventDefault(); // Prevent default link behavior
      step = 1; // Switch to login form
      updateFormVisibility();
    });
  }

  // Handle form submission
  const error = document.querySelector(".error");
  const errorRegister = document.querySelector(".error-register");
  const usernameInput = loginForm.querySelector("input[type='text']");
  const passwordInput = loginForm.querySelector("input[type='password']");
  const usernameInputReg = registerForm.querySelector("input[type=text]");
  const passwordInputReg = registerForm.querySelector("input[type=password]");
  const btn = loginForm.querySelector(".submit__btn__login");
  const btnRegister = registerForm.querySelector(".submit__btn__register");

  // handle sign in
  const handleSignIn = async (event) => {
    event.preventDefault();
    const btnText = btn.querySelector(".text");
    const loader = btn.querySelector(".loader");

    btnText.style.display = "none";
    loader.style.display = "inline-block";

    // clear previous error message
    if (error) {
      error.textContent = ""; // Clear the error message
      error.style.display = "none"; // Hide the error initially
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: usernameInput.value,
          password: passwordInput.value,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setTimeout(() => {
          btnText.style.display = "inline-block";
          loader.style.display = "none";
        }, 1000);

        // Display error message
        if (error) {
          error.textContent = data.message || "Invalid credentials";
          error.style.display = "block"; // Make the error message visible
          setTimeout(() => {
            error.textContent = ""; // Clear the error message after 5 seconds
            error.style.display = "none"; // Hide the error
          }, 1000); // 5000ms = 5 seconds
        }
        return;
      }

      // Save token to sessionStorage
      sessionStorage.setItem("authToken", data.user.token);
      sessionStorage.setItem("userId", data.user.id);

      // Redirect to dashboard
      window.location.href = "../../pages/dashboard.html";
    } catch (err) {
      console.error("Error:", err);
      if (error) {
        error.textContent = "An error occurred. Please try again.";
        error.style.display = "block"; // Ensure the error is visible
        setTimeout(() => {
          error.textContent = ""; // Clear the error message after 5 seconds
          error.style.display = "none"; // Hide the error
        }, 5000);
      }
    }
  };

  // handle sign up
  const handleSignUp = async (event) => {
    event.preventDefault();
    const btnText = btnRegister.querySelector(".text");
    const loader = btnRegister.querySelector(".loader");

    btnText.style.display = "none";
    loader.style.display = "inline-block";

    // clear previous error message
    if (errorRegister) {
      errorRegister.textContent = ""; // Clear the error message
      errorRegister.style.display = "none"; // Hide the error initially
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: usernameInputReg.value,
          password: passwordInputReg.value,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setTimeout(() => {
          btnText.style.display = "inline-block";
          loader.style.display = "none";
        }, 1000);

        // Display error message
        if (errorRegister) {
          errorRegister.textContent = data.message || "Sign up error";
          errorRegister.style.display = "block"; // Make the error message visible
          setTimeout(() => {
            errorRegister.textContent = ""; // Clear the error message after 5 seconds
            errorRegister.style.display = "none"; // Hide the error
          }, 1000); // 1000ms = 1 seconds
        }
        return;
      }

      // Redirect to dashboard
      window.location.href = "../index.html";
    } catch (err) {
      console.error("Error:", err);
      if (error) {
        error.textContent = "An error occurred. Please try again.";
        error.style.display = "block"; // Ensure the error is visible
        setTimeout(() => {
          error.textContent = ""; // Clear the error message after 5 seconds
          error.style.display = "none"; // Hide the error
        }, 5000);
      }
    }
  };

  if (btn) {
    btn.addEventListener("click", handleSignIn);
  }

  if (btnRegister) {
    btnRegister.addEventListener("click", handleSignUp);
  }
});
