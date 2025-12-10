# Sistem Admin Toko Sederhana

Aplikasi manajemen transaksi dan stok toko berbasis web. Dibangun dengan Node.js dan MySQL, sistem ini menangani pencatatan penjualan, pengurangan stok otomatis, serta pembatalan transaksi dengan pengembalian stok (refund).

Sistem ini telah dilengkapi dengan **proteksi Race Condition** menggunakan database locking (`FOR UPDATE`) untuk mencegah stok menjadi minus saat terjadi pembelian bersamaan.

## Fitur Unggulan

* **Dashboard Monitoring:** Melihat sisa stok dan riwayat transaksi secara *real-time*.
* **Smart Input:** Validasi stok otomatis di frontend (input dibatasi sesuai sisa stok).
* **Secure Backend:** Validasi stok ganda di server dengan *Database Transaction*.
* **Cancel Transaction:** Fitur pembatalan yang otomatis mengembalikan stok ke inventori.
* **Responsive UI:** Tampilan modern menggunakan Tailwind CSS.

## Tech Stack

* **Backend:** Node.js, Express.js
* **Database:** MySQL (Library: `mysql2`)
* **Frontend:** EJS (Templating Engine)
* **Styling:** Tailwind CSS (via CDN)
* **Environment:** Dotenv

## Prasyarat (Prerequisites)

Sebelum menjalankan aplikasi, pastikan komputer Anda sudah terinstal:
1.  **Node.js** (v14 ke atas)
2.  **MySQL** (Bisa menggunakan XAMPP/MAMP/Laragon)

## Cara Instalasi

### 1. Persiapan Database
Buat database baru di MySQL dengan nama `toko_db`, lalu jalankan query SQL berikut di tab SQL (phpMyAdmin):

```sql
-- 1. Tabel Produk
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price INT NOT NULL
);

-- 2. Tabel Stok
CREATE TABLE stocks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    quantity INT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 3. Tabel Transaksi
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    quantity INT,
    total_price INT,
    status ENUM('completed', 'cancelled') DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 4. Data Dummy
INSERT INTO products (name, price) VALUES 
('Kopi Susu', 15000), ('Teh Manis', 5000), ('Roti Bakar', 12000),
('Nasi Goreng', 25000), ('Mie Goreng', 20000), ('Air Mineral', 3000),
('Jus Jeruk', 10000), ('Pisang Goreng', 8000), ('Ayam Penyet', 30000), ('Es Krim', 7000);

INSERT INTO stocks (product_id, quantity) VALUES 
(1, 50), (2, 50), (3, 50), (4, 50), (5, 50), 
(6, 50), (7, 50), (8, 50), (9, 50), (10, 50);
````

### 2\. Instalasi Project

Buka terminal di folder project, lalu jalankan perintah berikut:

```bash
# Install semua library yang dibutuhkan
npm install
```

### 3\. Konfigurasi Environment

Buat file bernama `.env` di folder root (sejajar dengan `server.js`). Salin konfigurasi di bawah ini:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=      
DB_NAME=toko_db
PORT=3000
```

> *Catatan: Isi `DB_PASSWORD` jika database Anda menggunakan password (default XAMPP biasanya kosong).*

### 4\. Menjalankan Aplikasi

Jalankan server dengan perintah:

```bash
node server.js
```

Buka browser dan akses alamat:
**http://localhost:3000**

## Struktur Folder

```text
admin-toko/
├── config/
│   └── database.js       # Koneksi MySQL
├── controllers/
│   └── adminController.js # Logika (Beli, Cancel, Validasi Stok)
├── routes/
│   └── index.js          # Routing URL
├── views/
│   └── index.ejs         # Tampilan (HTML + EJS + Tailwind)
├── .env                  # Variabel Rahasia
├── server.js             # Entry Point Aplikasi
└── package.json
```

## Catatan Keamanan

Sistem ini menggunakan logika **Database Transaction** (`db.beginTransaction`) dan **Row Locking** (`FOR UPDATE`).
Ini memastikan bahwa jika ada dua permintaan pembelian yang masuk di milidetik yang sama, database akan memprosesnya secara antrean, sehingga stok tidak akan pernah menjadi negatif (minus).
