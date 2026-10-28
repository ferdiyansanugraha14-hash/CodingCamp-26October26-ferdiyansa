# Tech — Expense & Budget Visualizer

## Stack Teknologi
Aplikasi ini sepenuhnya berjalan di sisi klien. Tidak ada framework, tidak ada build tool, tidak ada dependensi eksternal.

| Layer      | Teknologi                        |
|------------|----------------------------------|
| Markup     | HTML5 semantik                   |
| Styling    | CSS3 (Custom Properties / Variables) |
| Logika     | Vanilla JavaScript (ES6+, `'use strict'`) |
| Grafik     | HTML5 Canvas API (2D Context)    |
| Persistensi| Browser `localStorage`           |

## Struktur JavaScript (`js/script.js`)

### Inisialisasi
Fungsi `init()` dipanggil saat skrip dimuat. Urutan: muat transaksi → muat budget → terapkan tema → render UI.

### State Global
Dua variabel di scope modul:
- `transactions` — array objek transaksi `{ id, name, amount, category, date }`.
- `budget` — angka float, default `1000`.

### LocalStorage
Tiga key dengan helper masing-masing:
- `ebv_transactions` — `loadTransactions()` / `saveTransactions()`
- `ebv_budget` — `loadBudget()` / `saveBudget()`
- `ebv_theme` — `loadTheme()` / `saveTheme()`

### Validasi Form
Fungsi `validateForm()` memeriksa secara berurutan:
1. Nama tidak kosong dan minimal 2 karakter.
2. Amount tidak kosong dan merupakan angka positif.
3. Kategori telah dipilih (bukan string kosong).

Pesan error ditampilkan di elemen `<span class="error-msg">` tepat di bawah field yang bermasalah. Class `is-invalid` ditambahkan ke field untuk styling merah.

### Render
`render()` adalah fungsi pusat yang:
1. Menghitung `totalSpent` dan `remaining`.
2. Memperbarui tiga kartu ringkasan.
3. Menampilkan/menyembunyikan warning banner (threshold 80%).
4. Memanggil `renderList()` dan `drawPieChart()`.

### Donut Chart
`drawPieChart()` menggambar langsung ke Canvas 260×260px:
- Akumulasi total per kategori dari array `transactions`.
- Menggambar irisan dengan `arc()`, dipisahkan stroke tipis 2px.
- Label persentase ditampilkan di koordinat tengah irisan jika irisan ≥ 8%.
- Lubang donut dibuat dengan `arc()` putih/gelap di atas irisan.
- Total nominal ditampilkan di tengah donut.
- Warna kategori: Food `#f6ad55`, Transport `#63b3ed`, Fun `#fc8181`.

### Tema Gelap/Terang
`applyTheme(theme)` toggle class `dark`/`light` di `<body>`. Semua warna dikendalikan lewat CSS Custom Properties — tidak ada perubahan style inline di JS kecuali warna Canvas yang bergantung pada state `isDark`.

### Keamanan
Semua teks yang berasal dari input pengguna dilewatkan melalui `escapeHtml()` sebelum dimasukkan ke `innerHTML`, mencegah XSS.

### ID Transaksi
`generateId()` menggunakan `crypto.randomUUID()` jika tersedia, dengan fallback `Date.now().toString(36) + Math.random().toString(36)` untuk kompatibilitas browser lama.

## Styling (`css/style.css`)

### CSS Custom Properties
Semua token warna, jarak, dan shadow didefinisikan di `:root`. Dark mode di-override di `body.dark` — tidak ada file CSS terpisah untuk dark mode.

### Layout
- Top bar: `position: sticky; top: 0` dengan `z-index: 100`.
- Summary: CSS Grid 3 kolom → 1 kolom di bawah 720px.
- Main area (form + chart): CSS Grid 2 kolom → 1 kolom di bawah 720px.
- Daftar transaksi: `max-height: 400px; overflow-y: auto` dengan custom scrollbar.

### Animasi
Entry transaksi baru menggunakan keyframe `slide-in` (opacity 0→1, translateY -6px→0, durasi 0.2s).

### Responsif
Dua breakpoint:
- `max-width: 720px` — grid berubah jadi 1 kolom, canvas dikecilkan ke 180px.
- `max-width: 480px` — font ukuran top bar dan summary value dikecilkan.

## Kompatibilitas Browser
Berjalan di semua browser modern yang mendukung:
- CSS Custom Properties
- HTML5 Canvas 2D
- `localStorage`
- `Intl.NumberFormat`
- ES6 (`const`, `let`, arrow function, template literal, `Array.forEach`)
