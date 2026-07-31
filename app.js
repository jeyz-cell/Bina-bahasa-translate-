// Konfigurasi Gemini API Key
const GEMINI_API_KEY = "AQ.Ab8RN6ILd6-4i7iWQkxNjSDu1CwOUvqsoNJwRJuSupMx9CilJw";

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

// 3. Terjemahan Menggunakan AI (Gemini API)
translateBtn.addEventListener('click', async () => {
  const text = inputText.value.trim();
  if (!text) return alert("Silakan masukkan teks terlebih dahulu!");

  const sourceName = sourceLang.options[sourceLang.selectedIndex].text;
  const targetName = targetLang.options[targetLang.selectedIndex].text;

  outputText.innerText = "Menerjemahkan...";

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Terjemahkan teks berikut dari bahasa ${sourceName} ke bahasa ${targetName}. Berikan HANYA hasil terjemahannya tanpa penjelasan tambahan:\n\n"${text}"`
          }]
        }]
      })
    });

    const data = await response.json();
    if (data.candidates && data.candidates[0].content.parts[0].text) {
      outputText.innerText = data.candidates[0].content.parts[0].text.trim();
    } else {
      outputText.innerText = "Gagal menerjemahkan. Periksa API Key kamu.";
    }
  } catch (error) {
    console.error(error);
    outputText.innerText = "Terjadi kesalahan saat terhubung ke AI.";
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

// 7. Fitur Terjemahan Gambar (Menggunakan Gemini Vision)
imageInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async () => {
    const base64Data = reader.result.split(',')[1];
    const sourceName = sourceLang.options[sourceLang.selectedIndex].text;
    const targetName = targetLang.options[targetLang.selectedIndex].text;

    outputText.innerText = "Membaca gambar & menerjemahkan...";

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: `Ekstrak teks dalam gambar ini dan terjemahkan dari ${sourceName} ke ${targetName}. Berikan HANYA hasil terjemahannya.` },
              {
                inline_data: {
                  mime_type: file.type,
                  data: base64Data
                }
              }
            ]
          }]
        })
      });

      const data = await response.json();
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        outputText.innerText = data.candidates[0].content.parts[0].text.trim();
      } else {
        outputText.innerText = "Gagal memproses gambar.";
      }
    } catch (err) {
      console.error(err);
      outputText.innerText = "Terjadi kesalahan saat memproses gambar.";
    }
  };
  reader.readAsDataURL(file);
});
