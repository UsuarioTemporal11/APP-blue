# Configurar y compilar en GitHub Codespaces

## 1. Sube todos estos archivos a tu repositorio
Mantén la estructura de carpetas tal cual (`screens/`, `components/` como subcarpetas).

## 2. Abre un Codespace
En tu repo de GitHub: botón verde **"Code"** → pestaña **"Codespaces"** → **"Create codespace on main"**.

## 3. En la terminal del Codespace, instala dependencias
```bash
npm install
```

## 4. Revisa que las versiones sean compatibles
```bash
npm run doctor
```
Si marca algo desactualizado, corrige el número en `package.json` según lo que te indique.

## 5. Inicia sesión en Expo y conecta el proyecto
```bash
npx eas login
npx eas init
```
Esto **completa automáticamente** el `projectId` en tu `app.json` — no necesitas copiarlo a mano.

## 6. Edita `app.json` manualmente
Reemplaza estos dos valores con los tuyos:
- `"owner"`: tu usuario de Expo
- `"android.package"`: un identificador único, ej. `com.tunombre.cronometrosbluetooth`

## 7. Compila el APK directo desde la terminal
```bash
npx eas build --platform android --profile preview
```
Sigue las instrucciones en pantalla (te dará un link para descargar el `.apk` cuando termine, normalmente 5-10 minutos).

## Nota importante
El Bluetooth real (conexión al HC-06) **no se puede probar dentro de Codespaces** — es un entorno en la nube sin hardware. Compila el `.apk`, instálalo en tu celular Android, y prueba la conexión ahí, cerca del Arduino.
