import { io } from "https://cdn.socket.io/4.5.4/socket.io.esm.min.js";

let socket;

/**Inicia la conexión WebSocket
 * @param {string} token - El JWT de Firebase
 * @param {object} callbacks - Funciones para actualizar la UI cuando llegan datos*/
export function conectarSocket(token, callbacks) {
    // 1. Conectar
    socket = io('http://localhost:3000', {
        auth: { token: token },
        transports: ['websocket', 'polling']
    });
    socket.on('connect_error', (err) => {
        console.error('Error de Socket:', err);
        alert("Error de conexión: " + err.message);
    });

    //  Escuchar eventos y llamar a las funciones de la UI (callbacks)
    
    socket.on('connect', () => {
        if (callbacks.onConnect) callbacks.onConnect();
    });

    socket.on('disconnect', () => {
        if (callbacks.onDisconnect) callbacks.onDisconnect();
    });

    socket.on('chat_message', (data) => {
        if (callbacks.onMessageReceived) callbacks.onMessageReceived(data);
    });

    socket.on('user connected', (data) => {
        if (callbacks.onSystemMessage) callbacks.onSystemMessage(data, 'green');
    });

    socket.on('user disconnected', (data) => {
        if (callbacks.onSystemMessage) callbacks.onSystemMessage(data, 'red');
    });

    socket.on('history_cleared', (data) => {
        if (callbacks.onHistoryCleared) callbacks.onHistoryCleared(data);
    });
}

/**
 * Enviar un mensaje al servidor
 */
export function enviarMensaje(texto) {
    if (socket) {
        socket.emit('chat_message', texto);
    }
}

/**
 * Borrar historial (Admin)
 */
export function borrarHistorial() {
    if (socket) {
        socket.emit('clear_history');
    }
}

/**
 * Desconectar manualmente
 */
export function desconectarSocket() {
    if (socket) {
        socket.disconnect();
    }
}