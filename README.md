# convertor

convertor is a tauri v2 mobile-first utility app with 4 modules:
- convert
- calc
- notes
- clock


## stack

- react + typescript + vite
- tauri v2
- framer motion
- tauri plugin store
- tauri plugin http

## local setup

install dependencies:

```bash
npm install
```

start the web app:

```bash
npm run dev
```

build the web app:

```bash
npm run build
```

## android testing (usb)

on the android device:
- enable developer options
- enable usb debugging
- approve the usb debugging prompt

on the development machine:

```bash
adb devices
npm run tauri android dev
```


## apk build

build a debug apk:

```bash
npm run tauri android build --debug
```

apk output:

src-tauri/gen/android/app/build/outputs/apk/universal/debug/app-universal-debug.apk

## appetize link

public demo link:

add appetize url [here](https://appetize.io/app/b_xhe42egqjaljsa5m5rf2irbegq)


