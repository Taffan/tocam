# Фото Отчёты / Photo Reports

PWA for creating technical maintenance reports for Magnit retail stores.

**[RU]**
PWA для создания отчётов о техническом обслуживании торговых точек сети «Магнит».

**[EN]**
PWA for creating technical maintenance reports for Magnit retail stores.

---

## Installation / Установка

**Online:** [https://taffan.github.io/tocam/](https://taffan.github.io/tocam/)

**[RU]** На телефоне: меню браузера → «Добавить на главный экран»

**[EN]** On mobile: browser menu → "Add to Home Screen"

---

## Features / Возможности

| [EN] | [RU] |
|-------|-------|
| 3 report types: MK, MM, MA | 3 типа отчётов: МК, ММ, МА |
| Equipment configuration | Конфигурация оборудования |
| Photo capture (camera + gallery) | Фотофиксация (камера + галерея) |
| KE (inventory numbers) — barcode scanner | КЕ (инвентарные номера) — сканер ШК |
| SN (serial numbers) — barcode scanner | СН (серийные номера) — сканер ШК |
| Offline auto-save | Автосохранение офлайн |
| ZIP export with XLSX | Экспорт в ZIP с XLSX |

---

## Equipment / Оборудование

| [EN] | [RU] |
|-------|-------|
| Checkout | Касса |
| Self-checkout | КСО |
| Distribution node | ТД |
| Handheld terminal | ТСД |
| Universal checkout table | УКС |
| Scales | Весы |
| Mobile printer | МП |
| Other | Прочее |

---

## Report Types / Типы отчётов

| Type | [EN] | [RU] | Equipment |
|------|-------|------|-----------|
| MK | Cosmetics | Косметик | Checkout, TD, Handheld, UKS, Printer |
| MM | Supermarket | Супермаркет | Checkout zone, Self-checkout, TD, Handheld, UKS, Scales, Printer |
| MA | Pharmacy | Аптека | Checkout zone, TD, Handheld, UKS |

---

## Photo Types / Типы фото

```
Photos (required)
├── ...

KE (inventory numbers) | Serial numbers
├── (paired rows, equal-height buttons) — optional
```

| [EN] | [RU] | Required | Scanner |
|-------|-------|---------|---------|
| Photos | Фото | ✅ | — |
| KE (inventory) | КЕ (инвентарные) | ❌ | Barcode (13/4 digits) |
| SN (serial) | СН (серийные) | ❌ | Barcode (any) |

---

## Export Format / Формат экспорта

```
ZIP Archive/
├── XLSX Report
├── Photos
├── KE/ (inventory photos)
├── Serial Numbers/ (serial photos)
├── Codes.txt
└── report.json
```

### Codes.txt

```
Photo Report — Store Name
Date: 2026-07-14
Technician: Name

Total photos: 24
KE: 3 of 6
Serial numbers: 2 of 6

KE (inventory numbers):
  1234567890123
  ...

Serial numbers:
  KE Serial ККТ
  KE Serial ИБП
  ...
```

---

## Offline / Офлайн

**[RU]** После первой загрузки работает полностью офлайн.

**[EN]** Works fully offline after first load.

---

## Sharing / Отправка

| Platform | Status |
|----------|--------|
| **iOS (15+)** | ✅ AirDrop, WhatsApp, Telegram |
| **Android** | ⚠️ Save → send manually |
| **PC** | ⚠️ Save to Downloads (share unsupported) |

---

## Barcode Scanner / Сканер

- BarcodeDetector API (Android Chrome 83+, iOS Safari 16.4+) — offline
- ZXing fallback (iOS < 16.4, старые Android)
- Interactive selection: yellow boxes → tap to select → green/red tracking
- Confirmed code tracking: green frame (found), red frame (lost)
- **KE mode:** 13-digit EAN-13 or 4-digit codes only (digits)
- **SN mode:** any barcode or QR code accepted
- Flicker-free overlays (cached code set, no DOM rebuild on unchanged frames)
- Sound + vibration

---

## Project Structure / Структура проекта

```
├── index.html     — UI
├── styles.css     — styles
├── app.js        — logic
├── data.js       — configs
├── sw.js         — Service Worker
├── manifest.json — PWA manifest
└── lib/
    ├── jszip.min.js — ZIP
    ├── zxing.min.js — scanner
    └── xlsx.min.js  — Excel
```

---

## Resources / Ресурсы

- **Online:** https://taffan.github.io/tocam/
- **GitHub:** https://github.com/Taffan/tocam
