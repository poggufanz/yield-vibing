# Skenario Demo — YIELD VIBING

> **Skill Referensi:** mobile-developer + blockchain-developer + cognitive-fluency-psychology
> **Versi:** 1.0 | **Tanggal:** 26 Mei 2026
> **Tujuan:** Panduan alur demo end-to-end untuk video submission hackathon

---

## 1. Tujuan Demo

Menunjukkan bahwa YIELD VIBING berhasil mengotomatisasi full vault deposit flow — dari connect wallet hingga deposit terkonfirmasi di Sepolia — dengan hanya satu interaksi permission dari user.

**Narasi inti demo:**
> "Kamu punya 100 USDC. Biasanya butuh 8 popup MetaMask dan 15 menit. Dengan YIELD VIBING: Venice AI rekomendasiin vault, kamu set permission sekali, agent eksekusi otomatis — tanpa bayar gas."

---

## 2. Persona Demo

| Persona | Nama | Profil |
|---------|------|--------|
| Yield Farmer Pemula | Arya | Punya 100 USDC, ingin mulai farming, tidak mau ribet multi-step |
| Observer (penonton video) | Juri / Developer | Mengevaluasi integrasi MetaMask + 1Shot + Venice AI |

---

## 3. Alur Demo Langkah Demi Langkah

### Step 0: Persiapan (Sebelum Record)

- MetaMask extension terinstall + akun Sepolia dengan sedikit ETH (untuk testnet, gas tetap 0 dari sisi user)
- Kontrak VaultDepositor + MockVault sudah deploy di Sepolia
- 100 USDC testnet sudah tersedia di wallet demo
- Venice AI API key sudah dikonfigurasi

---

### Step 1: Input Preferensi ke Venice AI (0:00–0:45)

1. Buka YIELD VIBING di browser
2. Tampilkan form input: "Berapa USDC kamu? Pilih risk level: Low / Medium / High"
3. Isi: 100 USDC, Low risk
4. Klik "Dapatkan Rekomendasi"
5. Venice AI memberikan respons:
   - **Vault terpilih:** MockVault USDC (APY: 8.2%)
   - **Reasoning:** "Vault ini menggunakan strategi lending konservatif. Cocok untuk risk profile kamu."
   - **Privacy note:** "Analisis ini berjalan di Venice AI — data kamu tidak disimpan."

**Visual yang ditampilkan:** Kartu rekomendasi vault + reasoning text + badge "Private by Venice AI"

---

### Step 2: Connect Wallet + EIP-7702 Upgrade (0:45–1:30)

1. Klik tombol "Connect Wallet"
2. MetaMask popup muncul — pilih akun
3. Aplikasi mendeteksi akun sebagai EOA biasa
4. Tampilkan info: "Akun kamu akan di-upgrade ke Smart Account via EIP-7702"
5. MetaMask menampilkan authorization request (EIP-7702 signature)
6. User sign → akun sekarang bertindak sebagai smart account
7. UI update: badge "Smart Account Active" ✓

**Visual yang ditampilkan:** MetaMask authorization dialog + status badge berubah dari "EOA" → "Smart Account"

---

### Step 3: Set Permission via ERC-7715 (1:30–2:15)

1. UI menampilkan permission request modal:
   - "Izinkan agent untuk: Swap maksimum **100 USDC** dan deposit ke vault **MockVault (0xABCD...)**"
   - "Permission ini bisa kamu cabut kapanpun"
2. User review: scope jelas, batas jelas
3. Klik "Grant Permission"
4. MetaMask menampilkan `wallet_requestExecutionPermissions` — user approve
5. UI update: "Permission aktif — agent siap eksekusi" ✓

**Visual yang ditampilkan:** Permission modal dengan detail scope + MetaMask permission dialog

---

### Step 4: Agent Eksekusi Otomatis via 1Shot (2:15–3:00)

1. Status dashboard muncul secara otomatis
2. Agent mulai eksekusi:
   - Step 1: "Swap 100 USDC → USDC (via DEX)" — pending → ✓
   - Step 2: "Approve vault" — pending → ✓
   - Step 3: "Deposit ke MockVault" — pending → ✓
3. Semua transaksi relay via 1Shot API (user tidak bayar gas)
4. Konfirmasi final: "Deposit berhasil! 100 USDC earning 8.2% APY"

**Visual yang ditampilkan:** Progress tracker 3 steps + status per step + Sepolia Etherscan link

---

### Step 5: Verifikasi di Sepolia Etherscan (3:00–3:30)

1. Klik link Etherscan yang muncul di UI
2. Tampilkan transaction hash di Sepolia
3. Tunjukkan:
   - Transaksi dari smart account (bukan EOA biasa)
   - Gas dibayar oleh 1Shot relayer (bukan user)
   - Vault balance bertambah

---

### Step 6: Closing (3:30–4:00)

- Ringkas: "Dari input preferensi hingga deposit terkonfirmasi: 1 permission, 0 gas, 4 menit."
- Tunjukkan qualification checklist terpenuhi semua

---

## 4. Checklist Kesiapan Demo

- [ ] VaultDepositor + MockVault sudah deploy di Sepolia (catat address)
- [ ] 100 USDC testnet tersedia di wallet demo
- [ ] MetaMask extension up-to-date + Smart Accounts Kit kompatibel
- [ ] Venice AI API key valid + respons teruji
- [ ] 1Shot relayer terkonfigurasi + relay test Sepolia berhasil
- [ ] Semua mock data vault (APY, TVL) sudah diset di frontend
- [ ] Koneksi internet stabil selama recording
- [ ] Script narasi sudah disiapkan
- [ ] Screen recorder siap (resolusi ≥ 1080p)

---

## 5. Expected Outcomes

| Outcome | Target |
|---------|--------|
| Full flow selesai tanpa error | ✓ (mandatory) |
| EIP-7702 upgrade visible di MetaMask | ✓ (qualification requirement) |
| ERC-7715 permission dialog tampil | ✓ (qualification requirement) |
| 1Shot relay tx visible di Etherscan | ✓ (qualification requirement) |
| Venice AI rekomendasi meaningful | ✓ (prize track requirement) |
| Durasi demo | ≤ 5 menit |
| User interactions (klik) selama demo | ≤ 5 klik |
