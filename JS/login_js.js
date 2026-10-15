const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginMessage = document.getElementById("loginMessage");

const emailPattern = /^[a-z]+\.[a-z]+\d{0,2}@e-uvt\.ro$/i;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{7,}$/;

loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    loginMessage.classList.remove("is-error", "is-success");

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!emailPattern.test(email)) {
        loginMessage.textContent = "Emailul trebuie să fie de forma nume.prenume@e-uvt.ro, cu cel mult două cifre opționale la final.";
        loginMessage.classList.add("is-error");
        emailInput.focus();
        return;
    }

    if (!passwordPattern.test(password)) {
        loginMessage.textContent = "Parola trebuie să aibă minimum 7 caractere și să includă literă mare, literă mică, cifră și caracter special.";
        loginMessage.classList.add("is-error");
        passwordInput.focus();
        return;
    }

    loginMessage.textContent = "Date valide. Te redirecționăm către pagina principală…";
    loginMessage.classList.add("is-success");
    window.location.href = "home.html";
});

emailInput.addEventListener("input", () => loginMessage.classList.remove("is-error", "is-success"));
passwordInput.addEventListener("input", () => loginMessage.classList.remove("is-error", "is-success"));
