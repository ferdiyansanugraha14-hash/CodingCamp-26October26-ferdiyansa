# Structure — Expense & Budget Visualizer

## Pohon Direktori

```
CodingCamp-26October26-ferdiyansa/
│
├── index.html              # Satu-satunya halaman HTML (single-page app)
│
├── css/
│   └── style.css           # Seluruh styling: layout, tema, komponen
│
├── js/
│   └── script.js           # Seluruh logika aplikasi
│
├── .kiro/
│   └── steering/
│       ├── product.md      # Dokumentasi produk & fitur
│       ├── tech.md         # Dokumentasi stack & implementasi teknis
│       └── structure.md    # Dokumentasi ini
│
├── README.md               # Deskripsi singkat repositori
└── .git/                   # Metadata Git (jangan diubah manual)
```

## Penjelasan Per File

### `index.html`
Dokumen HTML5 tunggal yang menyusun seluruh antarmuka. Struktur utama:

```
<head>
  └── <link> css/style.css

<body class="light">
  ├── <header class="top-bar">          — Judul app + tombol toggle tema
  └── <main class="container">
      ├── <section class="summary-grid"> — 3 kartu: Budget / Remaining / Total Spent
      ├── <div id="warning-banner">      — Banner peringatan 80% budget
      ├── <div class="main-grid">
      │   ├── <section> form             — Form tambah transaksi
      │   └── <section> chart-card       — Canvas donut chart + legenda
      └── <section> card                 — Daftar transaksi + dropdown sortir

  <script> js/script.js                  — Dimuat di akhir <body>
```

### `css/style.css`
Satu file CSS tanpa preprocessor. Dibagi menjadi bagian-bagian dengan komentar separator:

| Bagian                    | Isi                                                      |
|---------------------------|----------------------------------------------------------|
| CSS Custom Properties     | Token warna light & dark, radius, shadow, transition     |
| Reset & Base              | Box-sizing reset, body font, utilitas `.hidden`, `.sr-only` |
| Top Bar                   | Header sticky, judul, tombol ikon                        |
| Layout                    | `.container`, `.summary-grid`, `.main-grid`              |
| Summary Cards             | Kartu ringkasan budget + input edit budget               |
| Warning Banner            | Banner kuning peringatan pengeluaran                     |
| Cards                     | Container kartu generik                                  |
| Form                      | Form group, input field, select, pesan error, tombol     |
| Pie Chart                 | Wrapper canvas, legenda                                  |
| Transaction List          | List item, dot warna kategori, badge kategori, tombol hapus |
| Responsive                | Media query 720px dan 480px                              |

### `js/script.js`
Satu file JavaScript tanpa modul atau bundler. Dibagi menjadi bagian-bagian dengan komentar separator:

| Bagian                  | Fungsi / Variabel Utama                                         |
|-------------------------|-----------------------------------------------------------------|
| Constants               | `STORAGE_KEY_*`, `WARNING_THRESHOLD`, `CATEGORY_COLORS`, `CATEGORY_EMOJIS` |
| State                   | `transactions[]`, `budget`                                      |
| DOM References          | Semua `getElementById` / `querySelector` di-cache di sini       |
| Initialise              | `init()`                                                        |
| Storage helpers         | `loadTransactions`, `saveTransactions`, `loadBudget`, `saveBudget`, `loadTheme`, `saveTheme` |
| Theme                   | `applyTheme()`, event listener tombol toggle                    |
| Budget edit             | `saveBudgetValue()`, event listeners edit/save budget           |
| Form Validation         | `validateForm()`, `setError()`, `clearErrors()`                 |
| Delete                  | `deleteTransaction(id)`                                         |
| Sort                    | `getSortedTransactions()`, event listener sort dropdown         |
| Render                  | `render()` — fungsi pusat yang memanggil semua sub-render       |
| Transaction List        | `renderList()` — mengisi `<ul id="transaction-list">`           |
| Pie / Donut Chart       | `drawPieChart()` — menggambar ke Canvas 2D                      |
| Utilities               | `formatCurrency()`, `formatCurrencyShort()`, `escapeHtml()`, `generateId()` |
| Boot                    | `init()` — entry point                                          |

## Konvensi Penamaan

| Konteks          | Konvensi                                     | Contoh                        |
|------------------|----------------------------------------------|-------------------------------|
| CSS class        | kebab-case                                   | `.transaction-item`, `.btn-primary` |
| CSS variable     | `--clr-*`, `--radius*`, `--shadow`, `--transition` | `--clr-primary`, `--radius-sm` |
| JS fungsi        | camelCase, verb-first                        | `renderList()`, `loadBudget()` |
| JS konstanta     | SCREAMING_SNAKE_CASE                         | `STORAGE_KEY_TXN`             |
| JS variabel state| camelCase                                    | `transactions`, `budget`      |
| HTML id          | kebab-case                                   | `#transaction-form`, `#pie-chart` |

## Alur Data

```
localStorage
    │
    ▼ (saat load)
init()
    ├── loadTransactions() → transactions[]
    ├── loadBudget()       → budget
    └── applyTheme() + render()
                                │
                                ▼
                           render()
                           ├── update summary cards
                           ├── toggle warning banner
                           ├── renderList()    → <ul>
                           └── drawPieChart()  → <canvas>

User action (tambah / hapus / sortir / edit budget)
    └── update transactions[] atau budget
        └── saveTransactions() / saveBudget() → localStorage
            └── render()  ← siklus berulang
```

## Catatan Penting
- Tidak ada file HTML kedua, tidak ada routing, tidak ada halaman lain.
- Tidak ada file JavaScript tambahan selain `script.js`.
- Tidak ada file CSS tambahan selain `style.css`.
- Semua dependensi bersifat native browser — tidak ada `node_modules`, tidak ada `package.json`.
