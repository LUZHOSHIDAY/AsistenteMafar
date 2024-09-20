document.addEventListener('DOMContentLoaded', function() {
    // Variables
    const sendButton = document.getElementById('send-button');
    const voiceButton = document.getElementById('voice-button');
    const stopButton = document.getElementById('stop-button');
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');
    const chatBody = document.querySelector('.chat-body');
    const stopIcon = document.getElementById('stop-icon');

    let recognition;
    let synth = window.speechSynthesis;
    let isSpeaking = false;
    let isVoiceReading = false;

    // Función para enviar un mensaje
    function sendMessage() {
        const message = userInput.value.trim();
        if (message.length === 0) {
            showError('No puedes enviar un mensaje vacío');
            return;
        }

        // Crear mensaje del usuario
        createMessage('user-message alert alert-primary', message);
        userInput.value = '';

        // Agregar mensaje de carga
        const loadingMessage = createMessage('loading-message alert alert-info', 'Esperando respuesta...');

        // Enviar mensaje al servidor
        fetch('/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({ question: message }).toString(),
        })
        .then(response => response.ok ? response.json() : Promise.reject('Error en la respuesta del servidor: ' + response.statusText))
        .then(data => {
            chatBody.removeChild(loadingMessage);
            createMessage('assistant-message alert alert-secondary', data.response);
            scrollToBottom();
            speakText(data.response);
        })
        .catch(error => {
            chatBody.removeChild(loadingMessage);
            showError('Ocurrió un error: ' + error.message);
        });
    }

    // Función para mostrar errores
    function showError(message) {
        createMessage('error-message alert alert-danger', message);
    }

    // Crear un mensaje y agregarlo al chat
    function createMessage(className, text) {
        const message = document.createElement('div');
        message.className = 'message ' + className;
        message.innerText = text;
        chatBody.appendChild(message);
        scrollToBottom();
        return message;
    }

    // Función para leer el texto en voz alta
    function speakText(text) {
        if (synth.speaking) {
            synth.cancel();
        }
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-MX';
        utterance.volume = 1;
        utterance.rate = 1;
        utterance.pitch = 1;
        const voices = synth.getVoices();
        utterance.voice = voices.find(voice => voice.name === 'Microsoft Raúl - Spanish (Mexico)') || voices[0];
        utterance.onstart = () => isSpeaking = true;
        utterance.onend = () => isSpeaking = false;
        utterance.onerror = () => isSpeaking = false; // Asegurarse de actualizar el estado en caso de error
        synth.speak(utterance);
    }

    // Función para iniciar el reconocimiento de voz
    function startRecognition() {
        if (!('webkitSpeechRecognition' in window)) {
            alert('Tu navegador no soporta la API de reconocimiento de voz.');
            return;
        }

        recognition = new webkitSpeechRecognition();
        recognition.lang = 'es-PE'; 
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            userInput.value = transcript;
            sendMessage();
        };

        recognition.onerror = function(event) {
            console.error('Error en reconocimiento de voz:', event.error);
        };

        recognition.onend = function() {
            console.log('Reconocimiento de voz detenido.');
            stopButton.classList.remove('reading');
            stopButton.classList.add('paused');
            stopIcon.classList.remove('fa-pause');
            stopIcon.classList.add('fa-stop');
            isVoiceReading = false;
        };

        recognition.start();
        stopButton.classList.remove('paused');
        stopButton.classList.add('reading');
        stopIcon.classList.remove('fa-stop');
        stopIcon.classList.add('fa-pause');
        isVoiceReading = true;
    }

    // Función para detener el reconocimiento de voz
    function stopRecognition() {
        if (recognition && recognition.stop) {
            recognition.stop();
        }
    }

    // Función para alternar entre pausar y reanudar la lectura de voz
    function toggleVoice() {
        if (isSpeaking) {
            stopSpeaking();
            stopButton.classList.add('paused');
            stopIcon.classList.remove('fa-stop');
            stopIcon.classList.add('fa-pause');
        } else {
            speakText(userInput.value.trim());
            stopButton.classList.remove('paused');
            stopIcon.classList.remove('fa-pause');
            stopIcon.classList.add('fa-stop');
        }
    }

    // Función para detener la lectura de voz
    function stopSpeaking() {
        if (synth.speaking) {
            synth.cancel();
            isSpeaking = false;
        }
    }

    // Función para desplazar al final del chat
    function scrollToBottom() {
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    // Eventos
    sendButton.addEventListener('click', sendMessage);
    voiceButton.addEventListener('click', startRecognition);
    stopButton.addEventListener('click', toggleVoice);

    // Escuchar Enter para enviar mensajes
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    });

    // Cargar historial de chat
    function loadChatHistory() {
        const chatHistory = localStorage.getItem('chatHistory');
        if (chatHistory) {
            chatBox.innerHTML = chatHistory;
            scrollToBottom();
        }
    }

    // Guardar historial de chat
    function saveChatHistory() {
        localStorage.setItem('chatHistory', chatBox.innerHTML);
    }

    // Guardar historial de chat antes de salir
    window.addEventListener('beforeunload', saveChatHistory);

    loadChatHistory();
});
