import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;

function loader (element) {
  element.textContent = "Wait Kar Thoda";

  loadInterval = setInterval(() => {
    element.textContent += ".";

    if (element.textContent === "Wait Kar Thoda....") {
      element.textContent = "Wait Kar Thoda";
    }
  }, 300);
}

function typeText (element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

function generateUniqueID () {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexaDecimal = randomNumber.toString(16);

  return `id-${timestamp}-${hexaDecimal}`;
}

function chatStripe(isAi, value, uniqueId) {
  return (
      `
      <div class="wrapper ${isAi && 'ai'}">
          <div class="chat">
              <div class="profile">
                  <img 
                    src=${isAi ? bot : user} 
                    alt="${isAi ? 'bot' : 'user'}" 
                  />
              </div>
              <div class="message" id=${uniqueId}>${value}</div>
          </div>
      </div>
  `
  )
}

// text-to-speech each word 
function speak(text) {
  const utterance = new SpeechSynthesisUtterance();
  
  let voices = speechSynthesis.getVoices();
  console.log(voices);
  // utterance.voice = speechSynthesis.getVoices()[3];
  if (voices.length !== 0) {
  utterance.voice = voices[1];
  utterance.text = text;
  utterance.lang = "en-US";
  utterance.rate = 1.8;
  utterance.pitch = 2;
  utterance.volume = 1;
  
  speechSynthesis.speak(utterance);
  }
}
const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

  form.reset();

  const uniqueId = generateUniqueID();

  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  const response = await fetch("https://solution-master.onrender.com/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: data.get("prompt"),
    }),
  });

  clearInterval(loadInterval);
  messageDiv.innerHTML = "";

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();
    console.log(parsedData);
    typeText(messageDiv, parsedData);
    speak(parsedData);
  } else {
    const err = await response.text();

    messageDiv.innerHTML = "Something went wrong";

    alert(err);
  }

}

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});
   
