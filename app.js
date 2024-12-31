const aiBall = document.getElementById('ai-ball');

let conversationHistory = JSON.parse(localStorage.getItem('conversationHistory')) || [
    {
        role: "system",
        content: "(Nama kamu Hervis, kamu harus pake bahasa yang sederhana mudah di pahami. gunakan gaya bicara ini di setiap pembicaraan,)"
    }
];

// Simpan riwayat percakapan ke localStorage setiap ada perubahan
function saveConversationHistory() {
    localStorage.setItem('conversationHistory', JSON.stringify(conversationHistory));
}

// Mulai mendengarkan suara ketika bulat di klik
aiBall.addEventListener('click', startListening);

async function startListening() {
    aiBall.classList.add('mic-listening');  // Ganti animasi ke listening

    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'id-ID';
        recognition.interimResults = false;  // Jangan tampilkan hasil sementara
        recognition.maxAlternatives = 1;

        recognition.start();

        recognition.onstart = () => {
            console.log('Mendengarkan...');
        };

        recognition.onresult = async (event) => {
            const userInput = event.results[0][0].transcript;
            console.log('User berkata:', userInput);

            // Tambahkan pesan user ke riwayat percakapan
            conversationHistory.push({
                role: "user",
                content: userInput
            });

            // Simpan percakapan ke localStorage
            saveConversationHistory();

            // Tampilkan respons dari AI
            await getAIResponse(userInput);
        };

        recognition.onerror = (event) => {
            console.error('Terjadi kesalahan:', event.error);
            aiBall.classList.remove('mic-listening');  // Hentikan animasi listening
            aiBall.classList.add('mic-talking');  // Ganti animasi ke talking
            setTimeout(() => {
                aiBall.classList.remove('mic-talking');  // Kembali ke keadaan normal
            }, 1000);
        };
    } else {
        alert('Speech recognition tidak didukung di browser ini.');
    }
}

async function getAIResponse(userInput) {
    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer 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'
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: conversationHistory,
                max_tokens: 1024,
                temperature: 0.2
            })
        });

        const data = await response.json();
        const aiMessage = data.choices[0].message.content;

        // Tambahkan respons AI ke riwayat percakapan
        conversationHistory.push({
            role: "assistant",
            content: aiMessage
        });

        // Simpan percakapan ke localStorage
        saveConversationHistory();

        // Tampilkan respons AI
        displayMessage(aiMessage);

        // Mengaktifkan animasi berbicara
        aiBall.classList.remove('mic-listening');
        aiBall.classList.add('mic-talking');

        setTimeout(() => {
            aiBall.classList.remove('mic-talking');
        }, 1000);

        // Ucapkan respons AI
        speakResponse(aiMessage);
    } catch (error) {
        console.error('Error:', error);
        aiBall.classList.remove('mic-listening');
        aiBall.classList.add('mic-talking');
        setTimeout(() => {
            aiBall.classList.remove('mic-talking');
        }, 1000);
    }
}

function displayMessage(message) {
    // Tampilkan percakapan AI
    console.log(message);
}

function speakResponse(text) {
    // Pastikan suara sebelumnya dihentikan sebelum memainkan suara baru
    speechSynthesis.cancel(); // Membatalkan semua suara sebelumnya
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.pitch = 1;
    utterance.rate = 1.1;

    // Mulai pemutaran suara
    speechSynthesis.speak(utterance);
}











// const aiBall = document.getElementById('ai-ball');

// // Cek apakah ada percakapan yang tersimpan di localStorage
// let conversationHistory = JSON.parse(localStorage.getItem('conversationHistory')) || [
//     {
//         role: "system",
//         content: "(Kamu adalah Hervis, kamu harus pake bahasa yang sederhana mudah di pahami. gunakan gaya bicara ini di setiap pembicaraan,)"
//     }
// ];

// // Simpan riwayat percakapan ke localStorage setiap ada perubahan
// function saveConversationHistory() {
//     localStorage.setItem('conversationHistory', JSON.stringify(conversationHistory));
// }

// // Mulai mendengarkan suara ketika bulat di klik
// aiBall.addEventListener('click', startListening);

// async function startListening() {
//     // Periksa apakah browser mendukung speech recognition
//     if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
//         const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
//         recognition.lang = 'id-ID';
//         recognition.interimResults = false;
//         recognition.maxAlternatives = 1;

//         // Mulai mendengarkan
//         recognition.start();

//         recognition.onstart = () => {
//             console.log('Mendengarkan...');
//             aiBall.classList.add('mic-listening'); // Tambahkan kelas listening
//             startAudioProcessing(); // Mulai audio processing untuk deteksi volume
//         };

//         recognition.onresult = async (event) => {
//             const userInput = event.results[0][0].transcript;
//             console.log('User berkata:', userInput);

//             // Tambahkan pesan user ke riwayat percakapan
//             conversationHistory.push({
//                 role: "user",
//                 content: userInput
//             });

//             // Simpan percakapan ke localStorage
//             saveConversationHistory();

//             // Tampilkan respons dari AI
//             await getAIResponse(userInput);
//         };

//         recognition.onerror = (event) => {
//             console.error('Terjadi kesalahan:', event.error);
//             aiBall.classList.remove('mic-listening'); // Hapus kelas listening saat error
//         };
//     } else {
//         alert('Speech recognition tidak didukung di browser ini.');
//     }
// }

// // Fungsi untuk memproses audio dan mengubah animasi berdasarkan volume suara
// let analyser, microphone;

// function startAudioProcessing() {
//     const audioContext = new (window.AudioContext || window.webkitAudioContext)();
//     analyser = audioContext.createAnalyser();
//     analyser.fftSize = 256; // Ukuran FFT (Fast Fourier Transform)

//     navigator.mediaDevices.getUserMedia({ audio: true })
//         .then((stream) => {
//             microphone = audioContext.createMediaStreamSource(stream);
//             microphone.connect(analyser);

//             const bufferLength = analyser.frequencyBinCount;
//             const dataArray = new Uint8Array(bufferLength);

//             function updateAnimation() {
//                 analyser.getByteFrequencyData(dataArray); // Ambil data frekuensi suara

//                 // Ambil nilai rata-rata dari intensitas suara
//                 const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
                
//                 // Skala volume menjadi angka antara 1 dan 2 untuk animasi
//                 const scale = Math.min(1 + average / 100, 2);

//                 // Update ukuran tombol berdasarkan volume
//                 aiBall.style.transform = `scale(${scale})`;

//                 // Perbarui animasi setiap frame
//                 requestAnimationFrame(updateAnimation);
//             }

//             updateAnimation(); // Mulai proses animasi
//         })
//         .catch((err) => {
//             console.error('Akses microphone ditolak:', err);
//         });
// }

// async function getAIResponse(userInput) {
//     try {
//         // Kirim input ke API untuk mendapatkan respons AI
//         const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': 'Bearer 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'
//             },
//             body: JSON.stringify({
//                 model: "llama3-8b-8192",
//                 messages: conversationHistory,
//                 max_tokens: 1024,
//                 temperature: 0.7
//             })
//         });

//         const data = await response.json();
//         const aiMessage = data.choices[0].message.content;

//         // Tambahkan respons AI ke riwayat percakapan
//         conversationHistory.push({
//             role: "assistant",
//             content: aiMessage
//         });

//         // Simpan percakapan ke localStorage
//         saveConversationHistory();

//         // Ucapkan balasan AI
//         speakResponse(aiMessage);

//     } catch (error) {
//         console.error('Error:', error);
//         speakResponse('Maaf, terjadi kesalahan. Coba lagi nanti.');
//     }
// }

// function speakResponse(text) {
//     // Pastikan suara sebelumnya dihentikan sebelum memainkan suara baru
//     speechSynthesis.cancel(); // Membatalkan semua suara sebelumnya

//     // Memecah teks menjadi bagian-bagian kecil agar bisa dibaca panjang
//     const textChunks = chunkText(text, 3000); // 3000 karakter per chunk

//     // Membaca setiap bagian secara terpisah
//     textChunks.forEach((chunk) => {
//         const utterance = new SpeechSynthesisUtterance(chunk);
//         utterance.lang = 'id-ID'; // Bahasa Indonesia
//         utterance.pitch = 5; // Nada suara
//         utterance.rate = 0.8; // Kecepatan suara

//         // Menambahkan event listener ketika suara selesai berbicara
//         utterance.onend = function () {
//             console.log('Suara selesai.');
//         };

//         // Mulai pemutaran suara
//         speechSynthesis.speak(utterance);
//     });
// }

// // Fungsi untuk memecah teks panjang menjadi bagian-bagian kecil
// function chunkText(text, maxLength) {
//     const chunks = [];
//     for (let i = 0; i < text.length; i += maxLength) {
//         chunks.push(text.slice(i, i + maxLength));
//     }
//     return chunks;
// }
