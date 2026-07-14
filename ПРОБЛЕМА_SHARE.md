# Статус: Web Share API

## Текущее поведение

| Платформа | Шаринг файла | Статус |
|-----------|--------------|--------|
| iOS Safari/Chrome | ✅ Файл прикрепляется | ✅ Работает |
| Android Chrome | ❌ Файл не передаётся | ⚠️ Сохраняет локально |
| ПК (Chrome/Яндекс) | ✅ Работает | ✅ Работает |

## Android

**Проблема:** Android Chrome не передаёт файлы через `navigator.share` в Telegram/Email.

**Решение:** Файл сохраняется в загрузки, пользователь отправляет вручную.

## Решения

| Решение | Сложность | Результат |
|---------|-----------|-----------|
| **Capacitor** | Высокая | 100% работа на Android |
| **Оставить как есть** | Минимальная | Файл в загрузки |

## iOS

**Работает:** AirDrop, WhatsApp, Telegram, Mail и т.д.

## ПК

**Работает:** Chrome, Яндекс Браузер.

## Текущая реализация

```javascript
navigator.share({ title, text, files: [file] }).catch(err => {
  if (err?.name === 'AbortError') return;
  downloadBlob(cachedZipBlob, filename);
});
```
