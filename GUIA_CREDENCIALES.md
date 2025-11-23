# 🔐 Guía para Obtener Credenciales de Firebase

Esta guía te explica paso a paso cómo obtener las credenciales necesarias para que tu aplicación funcione.

## 📋 Requisitos Previos

1. Tener una cuenta de Google
2. Acceder a [Firebase Console](https://console.firebase.google.com/)

---

## 🎯 Paso 1: Crear un Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en **"Agregar proyecto"** o **"Crear un proyecto"**
3. Ingresa un nombre para tu proyecto (ej: "p0chita-chat")
4. Sigue los pasos del asistente:
   - Desactiva Google Analytics si no lo necesitas (opcional)
   - Haz clic en **"Crear proyecto"**
5. Espera a que se cree el proyecto y haz clic en **"Continuar"**

---

## 🌐 Paso 2: Configurar Firebase Authentication

1. En el menú lateral, haz clic en **"Authentication"** (Autenticación)
2. Haz clic en **"Comenzar"** o **"Get started"**
3. Ve a la pestaña **"Sign-in method"** (Métodos de inicio de sesión)
4. Haz clic en **"Google"**
5. Activa el toggle y selecciona un **correo de soporte del proyecto**
6. Haz clic en **"Guardar"**

---

## 📱 Paso 3: Registrar una Aplicación Web (Para el Frontend)

1. En la página principal del proyecto, haz clic en el ícono **`</>`** (Web)
2. Registra tu app con un nombre (ej: "P0chita Web App")
3. **NO marques** "También configurar Firebase Hosting" (a menos que lo necesites)
4. Haz clic en **"Registrar app"**
5. **¡IMPORTANTE!** Copia la configuración que aparece. Se verá así:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

6. **Pega esta configuración** en el archivo `FROND/index.html` (líneas 42-48)

---

## 🔑 Paso 4: Obtener Credenciales de Servicio (Para el Backend)

1. En Firebase Console, haz clic en el ícono de **⚙️ Configuración** (Settings) > **"Configuración del proyecto"**
2. Ve a la pestaña **"Cuentas de servicio"** (Service accounts)
3. Haz clic en **"Generar nueva clave privada"** o **"Generate new private key"**
4. Se descargará un archivo JSON (ej: `tu-proyecto-firebase-adminsdk-xxxxx.json`)
5. **Renombra este archivo** a `serviceaccount.json`
6. **Muévelo a la raíz de tu proyecto** (donde está `servidor.js`)

⚠️ **IMPORTANTE**: 
- **NUNCA** subas este archivo a GitHub o repositorios públicos
- Agrégalo a `.gitignore` para proteger tus credenciales

---

## 📝 Resumen de Archivos a Configurar

### 1. `FROND/index.html` (líneas 42-48)
```javascript
const firebaseConfig = {
    apiKey: "AIzaSy...",           // ← De la configuración web
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto-id",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:..."
};
```

### 2. `serviceaccount.json` (en la raíz del proyecto)
```json
{
  "type": "service_account",
  "project_id": "tu-proyecto-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@tu-proyecto.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

---

## ✅ Verificación

Una vez configurado todo:

1. **Frontend**: Abre `FROND/index.html` y verifica que `firebaseConfig` tenga todos los valores
2. **Backend**: Verifica que `serviceaccount.json` esté en la raíz del proyecto (mismo nivel que `servidor.js`)
3. Ejecuta el servidor: `node servidor.js`
4. Abre `http://localhost:3000` en tu navegador
5. Deberías poder hacer clic en "Iniciar Sesión con Google" y autenticarte

---

## 🛡️ Seguridad

- **NO compartas** tus credenciales públicamente
- Agrega `serviceaccount.json` a `.gitignore`:
  ```
  serviceaccount.json
  ```
- Si accidentalmente subiste credenciales a GitHub, **revócalas inmediatamente** en Firebase Console y genera nuevas

---

## ❓ Problemas Comunes

**Error: "autenticacion requerida"**
- Verifica que `serviceaccount.json` esté en la raíz del proyecto
- Verifica que el archivo JSON sea válido

**Error: "Firebase no está configurado"**
- Verifica que `firebaseConfig` en `index.html` tenga todos los campos completos

**Error al hacer login con Google**
- Verifica que Google Authentication esté habilitado en Firebase Console
- Verifica que el dominio esté autorizado (localhost está permitido por defecto)


