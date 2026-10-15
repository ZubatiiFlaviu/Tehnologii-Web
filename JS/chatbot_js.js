const questions = [
    {
        question: "Te-ai apucat de ideea de proiect?",
        options: {
            a: "Da, am deja o schiță!",
            b: "Nu încă, dar mă gândesc la ceva",
            c: "Nu prea știu ce să fac…"
        },
        correctAnswer: "a",
        correctResponse: "Excelent! Abia aștept să văd ce iese!",
        incorrectResponse: "Nu-i nimic! Putem discuta idei împreună."
    },
    {
        question: "Cum merge echipa ta la proiect?",
        options: {
            a: "Ne organizăm bine!",
            b: "Mai greu cu sincronizarea…",
            c: "Sunt singur(ă)."
        },
        correctAnswer: "a",
        correctResponse: "Foarte tare! Munca în echipă e cheia succesului!",
        incorrectResponse: "O să găsim soluții împreună, nu-ți face griji."
    }
];

let currentQuestionIndex = 0;
const chatContainer = document.getElementById("chat-container");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const submitButton = chatForm.querySelector("button[type='submit']");

function scrollChatContainerToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function appendMessage(author, text, options = null, isUser = false) {
    const message = document.createElement("div");
    message.classList.add("message", isUser ? "message-user" : "message-bot");

    const label = document.createElement("strong");
    label.textContent = author;
    message.appendChild(label);

    const body = document.createElement("span");
    body.textContent = text;
    message.appendChild(body);

    if (options) {
        const list = document.createElement("ol");
        list.classList.add("message-options");
        list.type = "a";

        Object.values(options).forEach((option) => {
            const item = document.createElement("li");
            item.textContent = option;
            list.appendChild(item);
        });

        message.appendChild(list);
    }

    chatContainer.appendChild(message);
    scrollChatContainerToBottom();
}

function displayQuestion() {
    const currentQuestion = questions[currentQuestionIndex];
    appendMessage("Bot", currentQuestion.question, currentQuestion.options);
    userInput.focus();
}

function normalizeAnswer(answer, options) {
    const normalizedAnswer = answer.trim().toLocaleLowerCase("ro");
    const keys = Object.keys(options);

    if (keys.includes(normalizedAnswer)) {
        return normalizedAnswer;
    }

    return keys.find((key) => options[key].toLocaleLowerCase("ro") === normalizedAnswer) ?? null;
}

chatForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const answer = userInput.value.trim();
    if (!answer) return;

    const currentQuestion = questions[currentQuestionIndex];
    const answerKey = normalizeAnswer(answer, currentQuestion.options);

    if (!answerKey) {
        appendMessage("Bot", "Alege a, b sau c ori scrie una dintre variantele afișate.");
        userInput.select();
        return;
    }

    appendMessage("Tu", answer, null, true);
    const feedback = answerKey === currentQuestion.correctAnswer
        ? currentQuestion.correctResponse
        : currentQuestion.incorrectResponse;
    appendMessage("Bot", feedback);

    currentQuestionIndex = (currentQuestionIndex + 1) % questions.length;
    userInput.value = "";
    userInput.disabled = true;
    submitButton.disabled = true;

    window.setTimeout(() => {
        displayQuestion();
        userInput.disabled = false;
        submitButton.disabled = false;
        userInput.focus();
    }, 800);
});

displayQuestion();
