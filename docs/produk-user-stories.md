# User Stories — YIELD VIBING

> **Skill Referensi:** cognitive-fluency-psychology
> **Versi:** 1.0 | **Tanggal:** 26 Mei 2026
> **Tujuan:** User stories per fitur dengan acceptance criteria

---

## 1. Ringkasan Persona

### Persona 1: Yield Farmer Aktif — "Arya"

| Atribut | Detail |
|---------|--------|
| Usia | 26 tahun |
| Profil | Developer part-time, aktif di DeFi |
| AUM | ~$5,000 USDC |
| Pain | Harus approve 8+ tx setiap rebalance, sering salah klik |
| Goal | Otomatiskan deposit tanpa kasih full wallet access ke bot |

### Persona 2: DeFi Curious — "Sari"

| Atribut | Detail |
|---------|--------|
| Usia | 22 tahun |
| Profil | Mahasiswa, baru mulai DeFi |
| AUM | ~$100 USDC |
| Pain | Tidak tahu cara navigasi flow multi-step, takut salah |
| Goal | Mulai farming dengan cara yang simple dan aman |

---

## 2. User Stories per Fitur

### Fitur: Venice AI Recommendation

**US-01**
> Sebagai yield farmer, saya ingin memasukkan jumlah USDC dan preferensi risiko saya, sehingga Venice AI bisa merekomendasikan vault yang paling cocok.

**Acceptance Criteria:**
- [ ] Form input tersedia: jumlah USDC (number) + risk level (Low/Medium/High)
- [ ] Tombol "Dapatkan Rekomendasi" mengirim request ke Venice AI
- [ ] Respons menampilkan: nama vault, APY, dan reasoning ≤ 3 kalimat
- [ ] Tampil badge "Powered by Venice AI — No data retention"
- [ ] Loading state tampil saat menunggu respons (max 10 detik)
- [ ] Error state tampil jika Venice AI tidak merespons

**US-02**
> Sebagai yield farmer, saya ingin tahu kenapa AI merekomendasikan vault ini, supaya saya bisa membuat keputusan yang informed.

**Acceptance Criteria:**
- [ ] Reasoning AI ditampilkan dalam bahasa yang mudah dimengerti
- [ ] APY dan catatan risiko ditampilkan berdampingan dengan reasoning

---

### Fitur: Wallet Connect + EIP-7702 Upgrade

**US-03**
> Sebagai user, saya ingin connect MetaMask dan upgrade akun saya ke smart account, supaya bisa menggunakan fitur permission otomatis.

**Acceptance Criteria:**
- [ ] Tombol "Connect Wallet" mendeteksi MetaMask extension
- [ ] Jika MetaMask tidak ada: tampilkan pesan "Install MetaMask dulu"
- [ ] Setelah connect: tampilkan address akun (format singkat: 0x1234...5678)
- [ ] Aplikasi mendeteksi apakah akun sudah smart account atau masih EOA
- [ ] Jika EOA: tampilkan info dan trigger EIP-7702 authorization
- [ ] Setelah upgrade: badge "Smart Account Active" muncul
- [ ] Network Sepolia terdeteksi dan ditampilkan

**US-04**
> Sebagai user, saya ingin tahu apa yang dimaksud "Smart Account" sebelum saya approve, supaya saya tidak bingung dengan permintaan MetaMask.

**Acceptance Criteria:**
- [ ] Sebelum trigger EIP-7702, tampilkan tooltip/modal penjelasan singkat
- [ ] Penjelasan menggunakan bahasa awam, bukan istilah EIP

---

### Fitur: Permission Grant via ERC-7715

**US-05**
> Sebagai yield farmer, saya ingin set permission dengan batas yang jelas (vault tertentu, jumlah maksimum), sehingga agent tidak bisa bertindak di luar yang saya izinkan.

**Acceptance Criteria:**
- [ ] Modal permission menampilkan: vault address, max amount USDC, expiry time
- [ ] Tombol "Grant Permission" memanggil `wallet_requestExecutionPermissions`
- [ ] MetaMask menampilkan permission dialog yang bisa di-approve atau cancel
- [ ] Setelah approve: UI update ke "Permission Active"
- [ ] Jika user cancel: UI tetap di state sebelumnya

**US-06**
> Sebagai yield farmer, saya ingin bisa mencabut permission kapanpun, sehingga saya tetap pegang kendali penuh.

**Acceptance Criteria:**
- [ ] Tombol "Revoke Permission" tersedia setelah permission aktif
- [ ] Setelah revoke: status update ke "No Active Permission"
- [ ] Agent tidak bisa eksekusi setelah permission dicabut

---

### Fitur: Automated Execution via 1Shot

**US-07**
> Sebagai yield farmer, saya ingin agent mengeksekusi deposit otomatis setelah saya set permission, sehingga saya tidak perlu approve setiap transaksi manual.

**Acceptance Criteria:**
- [ ] Setelah permission aktif, eksekusi mulai tanpa interaksi user tambahan
- [ ] Status dashboard menampilkan setiap step: Swap → Approve → Deposit
- [ ] Setiap step menampilkan status: pending / confirmed / failed
- [ ] TX hash dan Etherscan link tampil setelah setiap step confirmed
- [ ] Summary akhir tampil: "X USDC berhasil didepositkan"

**US-08**
> Sebagai yield farmer, saya tidak ingin membayar gas, sehingga saya bisa mencoba farming tanpa biaya transaksi.

**Acceptance Criteria:**
- [ ] Semua tx relay via 1Shot API
- [ ] Tidak ada prompt MetaMask untuk konfirmasi gas dari user
- [ ] Etherscan menunjukkan bahwa gas dibayar oleh relayer address, bukan user

**US-09**
> Sebagai yield farmer, saya ingin tahu jika agent mencoba melakukan sesuatu di luar batas permission saya, sehingga saya merasa aman.

**Acceptance Criteria:**
- [ ] Kontrak memanggil revert (bukan silent fail) jika amount exceed maxAmount
- [ ] Frontend menampilkan error yang jelas jika eksekusi gagal karena permission violation
- [ ] Tidak ada transaksi yang terjadi di luar scope permission

---

## 3. Non-Functional Notes

| Aspek | Requirement |
|-------|-------------|
| Privacy | Venice AI tidak menyimpan data user (no data retention) |
| Security | Permission harus dalam batas ketat — tidak ada akses wallet penuh |
| UX | Maksimum 5 klik dari landing page sampai deposit berhasil |
| Performance | Venice AI response ≤ 10 detik, tx confirmation ≤ 30 detik |
| Reliability | Handle MetaMask tidak ada / network salah / API timeout dengan pesan jelas |
| Testability | Semua flow bisa didemonstrasikan di Sepolia testnet |
