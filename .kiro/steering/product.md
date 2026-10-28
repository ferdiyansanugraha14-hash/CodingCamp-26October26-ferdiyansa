# Product — Expense & Budget Visualizer

## Tujuan
Aplikasi web satu halaman (single-page) yang membantu pengguna mencatat pengeluaran harian, memantau sisa anggaran bulanan, dan memahami pola belanja melalui visualisasi grafik.

## Target Pengguna
Individu yang ingin mengelola keuangan pribadi secara sederhana di browser, tanpa perlu akun atau koneksi internet setelah halaman dimuat.

## Fitur Utama

### Manajemen Transaksi
- Formulir tambah transaksi dengan tiga field: **Item Name**, **Amount ($)**, dan **Category**.
- Tiga kategori yang tersedia: **Food** 🍔, **Transport** 🚌, **Fun** 🎉.
- Validasi sisi klien: semua field wajib diisi, nama minimal 2 karakter, amount harus angka positif.
- Setiap transaksi disimpan dengan ID unik, nama, jumlah, kategori, dan timestamp ISO 8601.
- Tombol **Delete** (✕) di setiap baris transaksi untuk menghapus entri secara individual.

### Ringkasan Anggaran
- Tiga kartu ringkasan di bagian atas: **Monthly Budget** (dapat diedit), **Remaining**, dan **Total Spent**.
- Budget default $1.000; pengguna bisa mengubah nilainya melalui tombol ✏️ lalu menekan "Save" atau Enter.
- Nilai "Remaining" ditampilkan merah jika anggaran sudah terlampaui (nilai negatif).

### Visualisasi Grafik
- **Donut chart** berbasis Canvas HTML5 yang menampilkan proporsi pengeluaran per kategori.
- Persentase ditampilkan di dalam irisan (hanya jika irisan ≥ 8%).
- Total pengeluaran ditampilkan di tengah donut.
- Legenda di bawah chart menampilkan nama kategori, nominal, dan persentase.
- Chart otomatis diperbarui setiap kali transaksi ditambah atau dihapus.

## Tiga Fitur Opsional

### 1. Sortir Transaksi
Dropdown di header daftar transaksi dengan enam pilihan urutan:
- Terbaru / Terlama (berdasarkan timestamp)
- Jumlah terbesar / terkecil
- Nama A→Z / Z→A

### 2. Peringatan Batas Pengeluaran
Banner kuning muncul otomatis ketika total pengeluaran mencapai **80% atau lebih** dari budget yang ditetapkan. Banner menampilkan persentase pemakaian secara real-time.

### 3. Togel Tema Gelap/Terang
Tombol 🌙/☀️ di pojok kanan atas untuk berpindah antara light mode dan dark mode. Pilihan tema disimpan di LocalStorage sehingga tetap aktif saat halaman di-refresh.

## Penyimpanan Data
Semua data disimpan di `localStorage` browser — tidak ada backend, tidak ada server, tidak ada database eksternal. Data tetap ada selama LocalStorage browser tidak dibersihkan.

| Key LocalStorage     | Isi                          |
|----------------------|------------------------------|
| `ebv_transactions`   | Array JSON seluruh transaksi |
| `ebv_budget`         | Nilai budget (angka)         |
| `ebv_theme`          | `"light"` atau `"dark"`      |
