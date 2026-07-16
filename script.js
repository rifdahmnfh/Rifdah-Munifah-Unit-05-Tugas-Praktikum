let semuaTugas = [];
let urutanAktif = "terbaru"; // ✅ Tantangan 1: Nilai awal urutan

document.addEventListener("DOMContentLoaded", function () {

    const dataLokal = localStorage.getItem("dataSiTugas");
    if (dataLokal) {
        semuaTugas = JSON.parse(dataLokal);
    } else {

        semuaTugas = [
            { namaTugas: "Mengerjakan Modul 4 PTI", kategori: "Kuliah", prioritas: "tinggi", tenggat: "2026-07-06", status: "belum", catatan: "Baca materi dan kerjakan soal latihan" },
            { namaTugas: "Beli Token Listrik", kategori: "Pribadi", prioritas: "sedang", tenggat: "", status: "selesai", catatan: "Cek nomor meter terlebih dahulu" }
        ];
        simpanData();
    }

    perbaruiTampilan();

    const form = document.getElementById("formTugas");

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!form.checkValidity()) {
            form.classList.add("was-validated");
            return;
        }

        const idx = parseInt(document.getElementById("inputIndeksEdit").value);
        const tugasBaru = {
            namaTugas: document.getElementById("inputNama").value.trim(),
            kategori: document.getElementById("inputKategori").value,
            prioritas: document.querySelector('input[name="prioritas"]:checked').value,
            tenggat: document.getElementById("inputTenggat").value,
            catatan: document.getElementById("inputCatatan").value.trim(),
            status: idx === -1 ? "belum" : semuaTugas[idx].status
        };

        if (idx === -1) {
            semuaTugas.push(tugasBaru);
            tampilkanNotif("✅ Tugas berhasil ditambahkan", "bg-success text-white");
        } else {
            semuaTugas[idx] = tugasBaru;
            tampilkanNotif("✏️ Tugas berhasil diperbarui", "bg-info text-dark");
        }

        simpanData();
        perbaruiTampilan();
        bootstrap.Offcanvas.getInstance(document.getElementById("offcanvasTambah")).hide();
        form.reset();
        form.classList.remove("was-validated");
    });


    document.getElementById("tombolBukaForm").addEventListener("click", function () {
        document.getElementById("judulForm").textContent = "Tambah Tugas Baru";
        document.getElementById("inputIndeksEdit").value = "-1";
        form.reset();
        form.classList.remove("was-validated");
    });


    document.querySelectorAll("#grupFilterStatus button").forEach(btn => {
        btn.addEventListener("click", function () {
            document.querySelectorAll("#grupFilterStatus button").forEach(b => {
                b.classList.replace("btn-primary", "btn-outline-primary");
                b.classList.remove("active");
            });
            this.classList.replace("btn-outline-primary", "btn-primary");
            this.classList.add("active");
            perbaruiTampilan();
        });
    });

    document.getElementById("filterPrioritas").addEventListener("change", perbaruiTampilan);

    //  TANTANGAN 1: Ubah jenis urutan
    document.getElementById("pilihanUrut").addEventListener("change", function () {
        urutanAktif = this.value;
        perbaruiTampilan();
    });

    //  TANTANGAN 2: Hapus semua tugas yang sudah selesai
    document.getElementById("tombolBersihkanSelesai").addEventListener("click", function () {
        if (confirm("Apakah Anda yakin ingin menghapus SEMUA tugas yang sudah selesai?")) {
            semuaTugas = semuaTugas.filter(tugas => tugas.status === "belum");
            simpanData();
            perbaruiTampilan();
            tampilkanNotif("🧹 Semua tugas selesai berhasil dihapus", "bg-secondary text-white");
        }
    });
});


function simpanData() {
    localStorage.setItem("dataSiTugas", JSON.stringify(semuaTugas));
}


function tampilkanNotif(pesan, kelas) {
    const elIsi = document.getElementById("isiNotif");
    elIsi.textContent = pesan;
    const elToast = document.getElementById("toastNotif");
    elToast.className = `toast ${kelas}`;
    new bootstrap.Toast(elToast).show();
}

//  TANTANGAN 1: Fungsi mengurutkan data
function urutkanData(arr) {
    switch (urutanAktif) {
        case "terbaru":
            arr.sort((a, b) => b.indeksAsli - a.indeksAsli);
            break;
        case "terlama":
            arr.sort((a, b) => a.indeksAsli - b.indeksAsli);
            break;
        case "az":
            arr.sort((a, b) => {
                if (a.data.namaTugas < b.data.namaTugas) return -1;
                if (a.data.namaTugas > b.data.namaTugas) return 1;
                return 0;
            });
            break;
        case "prioritas":
            const nilaiPrioritas = { tinggi: 3, sedang: 2, rendah: 1 };
            arr.sort((a, b) => nilaiPrioritas[b.data.prioritas] - nilaiPrioritas[a.data.prioritas]);
            break;
    }
}


function perbaruiTampilan() {
    const kontainer = document.getElementById("kontainerKartuTugas");
    kontainer.innerHTML = "";
    document.getElementById("pesanKosong").classList.toggle("d-none", semuaTugas.length > 0);

    const filterStatus = document.querySelector("#grupFilterStatus button.active").dataset.filter;
    const filterPrio = document.getElementById("filterPrioritas").value;
    let dataTampil = [];
    let jumlahSelesai = 0;


    for (let i = 0; i < semuaTugas.length; i++) {
        const tugas = semuaTugas[i];
        if (tugas.status === "selesai") jumlahSelesai++;

        const cocokStatus = filterStatus === "semua" || tugas.status === filterStatus;
        const cocokPrioritas = filterPrio === "semua" || tugas.prioritas === filterPrio;

        if (cocokStatus && cocokPrioritas) {
            dataTampil.push({ data: tugas, indeksAsli: i });
        }
    }

    urutkanData(dataTampil);
    periksaTenggatMendekat();


    document.getElementById("tombolBersihkanSelesai").classList.toggle("d-none", jumlahSelesai === 0);


    dataTampil.forEach(item => {
        const t = item.data;
        const idx = item.indeksAsli;
        const warnaBadge = t.prioritas === "tinggi" ? "danger" : t.prioritas === "sedang" ? "warning text-dark" : "success";
        const coret = t.status === "selesai" ? "tugas-selesai" : "";
        const teksTombolStatus = t.status === "selesai" ? "🔄 Buka Lagi" : "✅ Selesai";
        const warnaBatas = t.prioritas === "tinggi" ? "danger" : "primary";

        kontainer.innerHTML += `
            <div class="col-12 col-md-6">
                <div class="card shadow-sm border-start border-4 border-${warnaBatas}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <h5 class="card-title ${coret}">${t.namaTugas}</h5>
                            <span class="badge bg-${warnaBadge}">${t.prioritas.toUpperCase()}</span>
                        </div>
                        <h6 class="text-muted small mb-2">📂 Kategori: ${t.kategori}</h6>
                        <p class="small text-secondary mb-2">${t.catatan || "<i>Tidak ada catatan</i>"}</p>
                        <p class="small text-muted mb-3">📅 Tenggat: ${t.tenggat || "-"}</p>
                        <div class="d-flex gap-1 justify-content-end">
                            <button class="btn btn-sm btn-light" onclick="ubahStatus(${idx})">${teksTombolStatus}</button>
                            <button class="btn btn-sm btn-outline-primary" onclick="bukaEdit(${idx})">✏️ Edit</button>
                            <button class="btn btn-sm btn-outline-danger" onclick="hapusTugas(${idx})">🗑️ Hapus</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });


    const total = semuaTugas.length;
    const persen = total > 0 ? Math.round((jumlahSelesai / total) * 100) : 0;
    document.getElementById("statTotal").textContent = total;
    document.getElementById("statBelum").textContent = total - jumlahSelesai;
    document.getElementById("statSelesai").textContent = jumlahSelesai;
    document.getElementById("statPersen").textContent = persen + "%";
    document.getElementById("badgeNavbar").textContent = total - jumlahSelesai;
    document.getElementById("labelProgres").textContent = `${jumlahSelesai} dari ${total} selesai`;
    document.getElementById("barProgres").style.width = persen + "%";
}


window.ubahStatus = function (idx) {
    semuaTugas[idx].status = semuaTugas[idx].status === "belum" ? "selesai" : "belum";
    simpanData();
    perbaruiTampilan();
};


window.bukaEdit = function (idx) {
    const t = semuaTugas[idx];
    document.getElementById("judulForm").textContent = "Edit Tugas";
    document.getElementById("inputIndeksEdit").value = idx;
    document.getElementById("inputNama").value = t.namaTugas;
    document.getElementById("inputKategori").value = t.kategori;
    document.querySelector(`input[name="prioritas"][value="${t.prioritas}"]`).checked = true;
    document.getElementById("inputTenggat").value = t.tenggat;
    document.getElementById("inputCatatan").value = t.catatan;
    new bootstrap.Offcanvas(document.getElementById("offcanvasTambah")).show();
};


window.hapusTugas = function (idx) {
    if (confirm("Yakin ingin menghapus tugas ini?")) {
        semuaTugas.splice(idx, 1);
        simpanData();
        perbaruiTampilan();
    }
};

//  TANTANGAN 3: Cek tugas yang mendekati tenggat (<= 2 hari)
function periksaTenggatMendekat() {
    const areaPeringatan = document.getElementById("areaPeringatan");
    areaPeringatan.innerHTML = "";
    const hariIni = new Date();
    hariIni.setHours(0, 0, 0, 0);
    const daftarMendesak = [];

    semuaTugas.forEach(tugas => {
        if (tugas.status === "belum" && tugas.tenggat) {
            const tglTenggat = new Date(tugas.tenggat);
            tglTenggat.setHours(0, 0, 0, 0);
            const selisihHari = Math.ceil((tglTenggat - hariIni) / (1000 * 60 * 60 * 24));
            if (selisihHari >= 0 && selisihHari <= 2) {
                daftarMendesak.push(tugas.namaTugas);
            }
        }
    });

    if (daftarMendesak.length > 0) {
        areaPeringatan.innerHTML = `
            <div class="alert alert-warning alert-dismissible fade show" role="alert">
                <strong>⚠️ Perhatian!</strong> Tugas yang mendekati batas waktu (≤ 2 hari):
                <ul class="mb-0 mt-1">${daftarMendesak.map(nama => `<li>${nama}</li>`).join("")}</ul>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
    }
}