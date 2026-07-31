// Konfigurasi TranslateAPI Key
const TRANSLATE_API_KEY = "ta_6bff395f10d062c53d1d222315802b0ec189f4619a18cd2563dd24c5";

// Elemen DOM
const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const sourceLang = document.getElementById('sourceLang');
const targetLang = document.getElementById('targetLang');
const translateBtn = document.getElementById('translateBtn');
const swapLangBtn = document.getElementById('swapLangBtn');
const clearBtn = document.getElementById('clearBtn');
const targetLangLabel = document.getElementById('targetLangLabel');

const voiceInputBtn = document.getElementById('voiceInputBtn');
const mainMicBtn = document.getElementById('mainMicBtn');
const listenInputBtn = document.getElementById('listenInputBtn');
const listenOutputBtn = document.getElementById('listenOutputBtn');
const copyInputBtn = document.getElementById('copyInputBtn');
const copyOutputBtn = document.getElementById('copyOutputBtn');
const copyOutputBtn2 = document.getElementById('copyOutputBtn2');
const imageInput = document.getElementById('imageInput');

// 1. Fitur Clear Text
clearBtn.addEventListener('click', () => {
  inputText.value = '';
  outputText.innerText = 'Hasil terjemahan akan muncul di sini...';
});

// 2. Swapping Bahasa
swapLangBtn.addEventListener('click', () => {
  const temp = sourceLang.value;
  sourceLang.value = targetLang.value;
  targetLang.value = temp;
  updateTargetLabel();
});

function updateTargetLabel() {
  const selectedText = targetLang.options[targetLang.selectedIndex].text.replace(/[\uD83C-\uDBFF\uDC00-\uDFFF]/g, '').trim();
  targetLangLabel.innerHTML = `<i class="fa-solid fa-volume-high"></i> ${selectedText}`;
}

targetLang.addEventListener('change', updateTargetLabel);

// 3. Terjemahan Menggunakan TranslateAPI.ai
translateBtn.addEventListener('click', async () => {
  const text = inputText.value.trim();
  if (!text) return alert("Silakan masukkan teks terlebih dahulu!");

  // Mengambil value/kode bahasa target (misal: 'es', 'en', 'id')
  const targetCode = targetLang.value;

  outputText.innerText = "Menerjemahkan...";

  try {
    const response = await fetch("https://api.translateapi.ai/api/v1/translate/", {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${TRANSLATE_API_KEY}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        text: text,
        target_language: targetCode
      })
    });

    const data = await response.json();
    
    // Asumsi response mengembalikan properti 'translated_text' atau disesuaikan dengan skema API
    if (data && (data.translated_text || data.result)) {
      outputText.innerText = data.translated_text || data.result;
    } else {
      outputText.innerText = "Gagal menerjemahkan. Periksa API Key atau Format Response.";
    }
  } catch (error) {
    console.error(error);
    outputText.innerText = "Terjadi kesalahan saat terhubung ke API.";
  }
});

// 4. Fitur Speech-to-Text (Suara ke Teks)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  const recognition = new SpeechRecognition();

  const startListening = () => {
    recognition.lang = sourceLang.value;
    recognition.start();
    inputText.placeholder = "Mendengarkan suara...";
  };

  voiceInputBtn.addEventListener('click', startListening);
  mainMicBtn.addEventListener('click', startListening);

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    inputText.value = transcript;
    inputText.placeholder = "Ketik teks di sini...";
  };

  recognition.onerror = (event) => {
    alert("Gagal mengenali suara: " + event.error);
  };
} else {
  alert("Browser Anda tidak mendukung Speech Recognition.");
}

// 5. Fitur Text-to-Speech (Dengar Teks)
function speakText(text, lang) {
  if (!text) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  window.speechSynthesis.speak(utterance);
}

listenInputBtn.addEventListener('click', () => speakText(inputText.value, sourceLang.value));
listenOutputBtn.addEventListener('click', () => speakText(outputText.innerText, targetLang.value));

// 6. Fitur Salin Teks
function copyToClipboard(text) {
  if (!text) return;
  navigator.clipboard.writeText(text);
  alert("Teks berhasil disalin!");
}

copyInputBtn.addEventListener('click', () => copyToClipboard(inputText.value));
copyOutputBtn.addEventListener('click', () => copyToClipboard(outputText.innerText));
copyOutputBtn2.addEventListener('click', () => copyToClipboard(outputText.innerText));
