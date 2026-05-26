# User Stories — Vibing Farmer

> **Skill Referensi:** cognitive-fluency-psychology
> **Versi:** 2.0 | **Tanggal:** 27 Mei 2026
> **Tujuan:** User stories per fitur dengan acceptance criteria

---

## 1. Ringkasan Persona

### Persona 1: Yield Farmer Aktif — "Arya"

| Atribut | Detail |
|---------|--------|
| Usia | 26 tahun |
| Profil | Developer part-time, aktif di DeFi |
| AUM | ~$5,000 USDC |
| Pain | Harus approve 8+ tx per vault setiap rebalance, mau multi-vault tapi kelelahan |
| Goal | Otomatiskan multi-vault deposit paralel tanpa kasih full wallet access ke bot |

### Persona 2: DeFi Curious — "Sari"

| Atribut | Detail |
|---------|--------|
| Usia | 22 tahun |
| Profil | Mahasiswa, baru mulai DeFi |
| AUM | ~$100 USDC |
| Pain | Tidak tahu cara navigasi multi-step, takut salah vault, takut kasih full access |
| Goal | Mulai farming dengan cara yang simple, aman, dan dikontrol AI |

---

## 2. User Stories per Fitur

### Fitur: Venice AI Strategy + Skill Generation

**US-01**
> Sebagai yield farmer, saya ingin memasukkan jumlah USDC, risk level, dan jumlah vault yang saya inginkan, sehingga Venice AI bisa membuat strategi multi-vault dan skill set untuk setiap agent otomatis.

**Acceptance Criteria:**
- [ ] Form input tersedia: jumlah USDC (number), risk level (Low/Medium/High), jumlah vault (integer, min 2)
- [ ] Tombol "Generate Strategy" mengirim request ke Venice AI
- [ ] Respons menampilkan: alokasi per vault (nama, address, amount, APY)
- [ ] Respons menampilkan skill card per agent: swap params + deposit params
- [ ] Tampil badge "Coordinated by Venice AI — No data retention"
- [ ] Loading state tampil saat menunggu respons (max 10 detik)
- [ ] Error state + hardcoded fallback jika Venice AI tidak merespons

**US-02**
> Sebagai yield farmer, saya ingin memahami kenapa Venice AI merekomendasikan strategi ini, supaya saya bisa membuat keputusan yang informed sebelum approve.

**Acceptance Criteria:**
- [ ] Reasoning singkat tampil per vault (≤ 2 kalimat)
- [ ] APY estimasi per vault ditampilkan
- [ ] Total expected APY (weighted average) ditampilkan di summary card

---

### Fitur: Skill Review + Edit UI

**US-03**
> Sebagai yield farmer, saya ingin melihat dan mengedit skill set yang Venice AI generate untuk setiap agent, sehingga saya tetap punya kontrol atas parameter eksekusi.

**Acceptance Criteria:**
- [ ] Skill card ditampilkan per agent (satu card per Worker Agent)
- [ ] Setiap card menampilkan: agentId, vault target, maxSlippage, dexPreference, maxAmount
- [ ] User dapat mengedit: maxSlippage (input range 0–2%), maxRetries (dropdown 1–3)
- [ ] Tombol "Approve Skill Sets" mengunci semua skills dan menulis ke file
- [ ] Eksekusi tidak bisa dimulai sebelum approve

**US-04**
> Sebagai yield farmer, saya ingin tahu apa yang dimaksud "skill" untuk agent ini, supaya saya tidak approve sesuatu yang tidak saya mengerti.

**Acceptance Criteria:**
- [ ] Tooltip tersedia per skill parameter yang menjelaskan artinya dalam bahasa awam
- [ ] Contoh: "maxSlippage: berapa % perubahan harga yang masih diterima agent saat swap"

---

### Fitur: Wallet Connect + EIP-7702

**US-05**
> Sebagai user, saya ingin connect MetaMask Flask dan upgrade akun saya ke smart account, supaya agent bisa eksekusi dalam batas permission yang saya set.

**Acceptance Criteria:**
- [ ] Tombol "Connect Wallet" mendeteksi MetaMask Flask extension
- [ ] Jika MetaMask Flask tidak ada: tampilkan pesan "Install MetaMask Flask (bukan regular MetaMask)"
- [ ] Setelah connect: tampilkan address akun (format singkat: 0x1234...5678)
- [ ] Aplikasi mendeteksi apakah akun sudah smart account atau masih EOA
- [ ] Jika EOA: tampilkan info + trigger EIP-7702 authorization
- [ ] Setelah upgrade: badge "Smart Account Active" muncul
- [ ] Network Sepolia terdeteksi dan ditampilkan

---

### Fitur: ERC-7715 Permission per Agent

**US-06**
> Sebagai yield farmer, saya ingin set permission berbeda untuk setiap agent dengan batas yang jelas, sehingga setiap agent hanya bisa bertindak di vault yang saya izinkan dengan jumlah yang saya tentukan.

**Acceptance Criteria:**
- [ ] Permission card ditampilkan per agent (sesuai skill yang sudah diapprove)
- [ ] Setiap card menampilkan: agentId, vault address, maxAmount, expiry
- [ ] Tombol "Grant Permissions for All Agents" memanggil ERC-7715 per agent
- [ ] MetaMask Flask menampilkan permission dialog per agent (atau batch)
- [ ] Setelah approve semua: UI update ke "2 Agent Permissions Active"
- [ ] Tombol "Revoke All Permissions" tersedia setelah grant

**US-07**
> Sebagai yield farmer, saya ingin bisa mencabut permission semua agent kapanpun, sehingga saya tetap pegang kendali penuh bahkan setelah agent sudah dijalankan.

**Acceptance Criteria:**
- [ ] Tombol "Revoke All Permissions" tersedia setelah permissions aktif
- [ ] Setelah revoke: status update ke "No Active Permissions"
- [ ] Agent yang sudah berjalan tidak bisa lanjut setelah revoke

---

### Fitur: Agent Swarm (Orchestrator + Workers)

**US-08**
> Sebagai yield farmer, saya ingin agent swarm mengeksekusi deposit ke semua vault secara paralel setelah saya approve skill dan set permissions, sehingga saya tidak perlu intervensi manual di setiap langkah.

**Acceptance Criteria:**
- [ ] Setelah permissions aktif + klik "Launch Swarm": Orchestrator dispatch semua Workers secara paralel
- [ ] vis.js graph menampilkan Orchestrator di pusat + N Worker Agents
- [ ] Worker Agents mulai berjalan simultan (terlihat di graph: nodes berubah ke warna "running")
- [ ] Setiap Worker Agent: Swap → Approve → Deposit tanpa interaksi user tambahan
- [ ] Jika satu Worker gagal: Workers lain tetap berjalan (tidak abort)

**US-09**
> Sebagai yield farmer, saya tidak ingin membayar gas, sehingga saya bisa mencoba multi-vault farming tanpa biaya transaksi apapun.

**Acceptance Criteria:**
- [ ] Semua tx relay via 1Shot Permissionless Relayer
- [ ] Tidak ada prompt MetaMask untuk konfirmasi gas dari user selama eksekusi
- [ ] Sepolia Etherscan menunjukkan bahwa `from` = 1Shot relayer address, bukan user wallet

**US-10**
> Sebagai yield farmer, saya ingin tahu jika agent mencoba melakukan sesuatu di luar batas permission, sehingga saya merasa aman.

**Acceptance Criteria:**
- [ ] Kontrak memanggil revert (bukan silent fail) jika amount exceed maxAmount
- [ ] vis.js graph: node agent yang gagal berubah ke warna merah
- [ ] Detail panel menampilkan error yang jelas: "Execution rejected: amount exceeds permission"
- [ ] Agents lain tidak terpengaruh oleh failure satu agent

---

### Fitur: Agent Memory System

**US-11**
> Sebagai yield farmer, saya ingin melihat apa yang sudah dilakukan setiap agent, berapa slippage aktual, dan berapa lama eksekusi, sehingga saya punya visibility penuh atas aktivitas agent.

**Acceptance Criteria:**
- [ ] Klik node agent di vis.js graph → panel detail muncul
- [ ] Panel menampilkan: step yang dilakukan, status, gasUsed, slippageActual, executionTimeMs
- [ ] Panel menampilkan "lesson" yang agent catat (jika ada)
- [ ] Memory tersimpan di `agents/memory/agent-{n}-memory.json` setelah eksekusi

**US-12**
> Sebagai yield farmer, saya ingin agent menggunakan pengalaman eksekusi sebelumnya, sehingga agent semakin baik dari waktu ke waktu.

**Acceptance Criteria (Could Have):**
- [ ] Memory dari sesi sebelumnya di-feed ke Venice AI prompt sebagai context
- [ ] Venice AI menyebutkan: "Berdasarkan eksekusi sebelumnya, vault A reliable dengan slippage 0.5%"

---

### Fitur: vis.js Graph Monitoring

**US-13**
> Sebagai yield farmer, saya ingin melihat status semua agent secara visual dan real-time, sehingga saya tahu apa yang sedang terjadi tanpa perlu baca log.

**Acceptance Criteria:**
- [ ] vis.js Network graph tampil setelah "Launch Swarm" diklik
- [ ] Node Orchestrator di tengah, nodes Workers di sekitarnya, nodes Vaults di luar
- [ ] Edges terlihat jelas antara Orchestrator→Worker dan Worker→Vault
- [ ] Node warna berubah real-time: gray → blue → green / red
- [ ] Update terjadi saat on-chain events masuk (tanpa refresh page)
- [ ] Klik node → detail panel muncul dengan informasi agent

---

## 3. Non-Functional Notes

| Aspek | Requirement |
|-------|-------------|
| Privacy | Venice AI tidak menyimpan data user (no data retention) |
| Security | Permission dibatasi per-agent scope — tidak ada akses wallet penuh |
| UX | Maksimum 8 klik dari landing page sampai agent swarm launched |
| Performance | Venice AI response ≤ 10 detik; vis.js graph update ≤ 1 detik dari event |
| Reliability | Satu Worker Agent failure tidak abort Workers lain (Promise.allSettled) |
| Testability | Full flow bisa didemonstrasikan di Sepolia testnet dengan ≥ 2 parallel Workers |
| Parallelism | Minimal 2 Worker Agents berjalan benar-benar simultan (tidak sequential) |
