// ==========================================
// 1. NAVBAR TOGGLE (MOBILE MENU)
// ==========================================
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');

toggle?.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen);
});

// ==========================================
// 2. ACCORDION LOGIC
// ==========================================
document.querySelectorAll('.accordion__header').forEach(header => {
    header.addEventListener('click', () => {
        const item = header.closest('.accordion__item');
        const isActive = item.classList.contains('accordion__item--active');

        document.querySelectorAll('.accordion__item').forEach(i => i.classList.remove('accordion__item--active'));
        if (!isActive) {
            item.classList.add('accordion__item--active');
        }
    });
});

// ==========================================
// 3. CUSTOM SELECT DROPDOWN LOGIC
// ==========================================
const customSelect = document.getElementById('customSelect');
const hiddenInput = document.getElementById('selectedProgram');

if (customSelect) {
    const trigger = customSelect.querySelector('.select-trigger');
    const options = customSelect.querySelectorAll('.option');
    const triggerText = trigger.querySelector('span');

    // Toggle Buka / Tutup Dropdown
    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        customSelect.classList.toggle('open');
    });

    // Pilih Opsi
    options.forEach(option => {
        option.addEventListener('click', () => {
            const value = option.getAttribute('value') || option.getAttribute('data-value') || option.textContent.trim();

            triggerText.textContent = option.textContent.trim();
            if (hiddenInput) hiddenInput.value = value;

            customSelect.classList.remove('open');
        });
    });

    // Tutup jika klik di luar area dropdown
    document.addEventListener('click', (e) => {
        if (!customSelect.contains(e.target)) {
            customSelect.classList.remove('open');
        }
    });
}

// ==========================================
// 4. PENANGANAN FORM PENDAFTARAN & WHATSAPP
// ==========================================
const ADMIN_WA_NUMBER = "6285602810366"; // Nomor WA Admin
const form = document.getElementById('registrationForm');
const submitBtn = document.getElementById('submitBtn');
const formMessage = document.getElementById('formMessage');

if (form) {
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const name = document.getElementById('formName').value.trim();
        const phone = document.getElementById('formPhone').value.trim();
        const program = hiddenInput ? hiddenInput.value.trim() : '';
        const age = document.getElementById('age').value;
        const location = document.getElementById('location').value;

        // Validasi program
        if (!program) {
            if (formMessage) formMessage.textContent = "Silakan pilih program belajar terlebih dahulu.";
            return;
        }

        // Tampilan Status Loading
        submitBtn.disabled = true;
        submitBtn.innerHTML = "<span>Memproses...</span>";
        if (formMessage) formMessage.textContent = "Membuka WhatsApp...";

        // Format Pesan WhatsApp
        const waMessage = `Halo El Khairi Academy, saya ingin mendaftar:%0A` +
            `• *Nama*: ${encodeURIComponent(name)}%0A` +
            `• *No. WA*: ${encodeURIComponent(phone)}%0A` +
            `• *Umur*: ${encodeURIComponent(age)}%0A` +
            `• *Domisili*: ${encodeURIComponent(location)}%0A` +
            `• *Program*: ${encodeURIComponent(program)}%0A%0A` +
            `Mohon informasi langkah pendaftaran berikutnya. Terima kasih!`;

        const waUrl = `https://wa.me/${ADMIN_WA_NUMBER}?text=${waMessage}`;

        // Reset Form & Custom Select tampilan
        form.reset();
        if (hiddenInput) hiddenInput.value = "";

        const triggerSpan = customSelect?.querySelector('.select-trigger span');
        if (triggerSpan) triggerSpan.textContent = "Pilih program";

        // Buka WhatsApp di tab baru
        setTimeout(() => {
            window.open(waUrl, '_blank');
            if (formMessage) formMessage.textContent = "";
            submitBtn.disabled = false;
            submitBtn.innerHTML = "<span>Mulai Pendaftaran →</span>";
        }, 500);
    });
}

// ==========================================
// 5. OPSI: PILIH PAKET DARI KARTU PRICING
// ==========================================
document.querySelectorAll('.select-package-btn').forEach(button => {
    button.addEventListener('click', function () {
        const selectedProgram = this.getAttribute('data-program');
        const triggerSpan = customSelect?.querySelector('.select-trigger span');

        if (selectedProgram) {
            if (hiddenInput) hiddenInput.value = selectedProgram;
            if (triggerSpan) triggerSpan.textContent = selectedProgram;

            // Fokus otomatis ke input nama setelah scroll ke form
            setTimeout(() => {
                const nameInput = document.getElementById('formName');
                if (nameInput) nameInput.focus();
            }, 400);
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.getElementById('activityCarousel');
    let cards = Array.from(carousel.querySelectorAll('.activity-card'));
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');

    let autoPlayTimer = null;
    const autoPlayInterval = 3000; // Durasi auto scroll (3 detik)

    // 1. SETUP INFINITE LOOP (Duplikasi slide di awal & akhir)
    function setupInfiniteLoop() {
        // Clone 3 elemen pertama ke belakang & 3 elemen terakhir ke depan
        const firstClones = cards.slice(0, 3).map(card => card.cloneNode(true));
        const lastClones = cards.slice(-3).map(card => card.cloneNode(true));

        firstClones.forEach(clone => carousel.appendChild(clone));
        lastClones.reverse().forEach(clone => carousel.insertBefore(clone, carousel.firstChild));

        // Update list cards setelah diduplikasi
        cards = Array.from(carousel.querySelectorAll('.activity-card'));
    }

    setupInfiniteLoop();

    // 2. HITUNG JARAK ANTAK KARTU (Card Width + Gap)
    function getScrollAmount() {
        const cardWidth = cards[0].offsetWidth;
        const gap = parseInt(window.getComputedStyle(carousel).gap) || 20;
        return cardWidth + gap;
    }

    // Set posisi awal ke kartu asli pertama (bukan clone depan)
    setTimeout(() => {
        carousel.scrollLeft = getScrollAmount() * 3;
        updateCenterCard();
    }, 50);

    // 3. FUNGSI MENENTUKAN KARTU TENGAH (AKTIF)
    function updateCenterCard() {
        const carouselCenter = carousel.getBoundingClientRect().left + carousel.offsetWidth / 2;
        let closestCard = null;
        let minDistance = Infinity;

        cards.forEach((card) => {
            const cardRect = card.getBoundingClientRect();
            const cardCenter = cardRect.left + cardRect.width / 2;
            const distance = Math.abs(carouselCenter - cardCenter);

            if (distance < minDistance) {
                minDistance = distance;
                closestCard = card;
            }
        });

        cards.forEach((card) => card.classList.remove('active'));
        if (closestCard) {
            closestCard.classList.add('active');
        }
    }

    // 4. PENANGANAN EFEK LOOP TANPA PATAS (Infinite Reset)
    carousel.addEventListener('scroll', () => {
        updateCenterCard();

        const scrollAmount = getScrollAmount();
        const maxScroll = scrollAmount * (cards.length - 3);

        // Jika scroll sudah di paling ujung kanan -> pindah instan ke depan
        if (carousel.scrollLeft >= maxScroll - 10) {
            carousel.style.scrollBehavior = 'auto';
            carousel.scrollLeft = scrollAmount * 3;
        }
        // Jika scroll di paling ujung kiri -> pindah instan ke belakang
        else if (carousel.scrollLeft <= 10) {
            carousel.style.scrollBehavior = 'auto';
            carousel.scrollLeft = scrollAmount * (cards.length - 6);
        }
    });

    // 5. FUNGSI GESER (NEXT / PREV)
    function slideNext() {
        carousel.style.scrollBehavior = 'smooth';
        carousel.scrollBy({ left: getScrollAmount() });
    }

    function slidePrev() {
        carousel.style.scrollBehavior = 'smooth';
        carousel.scrollBy({ left: -getScrollAmount() });
    }

    // 6. AUTOPLAY & HOVER PAUSE
    function startAutoPlay() {
        stopAutoPlay();
        autoPlayTimer = setInterval(slideNext, autoPlayInterval);
    }

    function stopAutoPlay() {
        if (autoPlayTimer) clearInterval(autoPlayTimer);
    }

    // Hentikan autoplay saat kursor di atas carousel (Hover)
    carousel.addEventListener('mouseenter', stopAutoPlay);
    carousel.addEventListener('mouseleave', startAutoPlay);
    carousel.addEventListener('touchstart', stopAutoPlay);
    carousel.addEventListener('touchend', startAutoPlay);

    // Tombol Navigasi
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            stopAutoPlay();
            slideNext();
            startAutoPlay();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            stopAutoPlay();
            slidePrev();
            startAutoPlay();
        });
    }

    // Jalankan Autoplay Pertama Kali
    startAutoPlay();
});

// --- LOGIKA FULL VIEW MODAL ---
const modal = document.getElementById('imageModal');
const fullImg = document.getElementById('fullImage');
const captionText = document.getElementById('modalCaption');
const closeBtn = document.querySelector('.modal-close');

// Event Delegation: Menangani klik gambar pada kartu (termasuk hasil clone loop)
document.getElementById('activityCarousel').addEventListener('click', (e) => {
    if (e.target.tagName === 'IMG') {
        modal.style.display = 'block';
        fullImg.src = e.target.src;
        fullImg.alt = e.target.alt;
        captionText.innerHTML = e.target.alt; // Menampilkan alt image sebagai caption
    }
});

// Tutup modal saat tombol 'X' diklik
if (closeBtn) {
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
}

// Tutup modal saat area di luar gambar diklik
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Tutup modal saat menekan tombol 'Esc' pada keyboard
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'block') {
        modal.style.display = 'none';
    }
});

document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".feature-card");

  if (!cards.length) return;

  // 1. SET TRANSISI HALUS UNTUK KARTU, TEKS, DAN GAMBAR
  cards.forEach((card) => {
    card.style.transition = "background-color 0.3s ease";

    const title = card.querySelector(".feature-card__title");
    const desc = card.querySelector(".feature-card__desc");
    const img = card.querySelector(".feature-card__media img");

    if (title) title.style.transition = "color 0.3s ease";
    if (desc) desc.style.transition = "color 0.3s ease";
    if (img) img.style.transition = "transform 0.3s ease"; // Transisi untuk gambar
  });

  // Fungsi untuk mengaktifkan 1 kartu dan mereset kartu lainnya
  function activateCard(cardToActivate) {
    cards.forEach((card) => {
      const title = card.querySelector(".feature-card__title");
      const desc = card.querySelector(".feature-card__desc");
      const img = card.querySelector(".feature-card__media img");

      if (card === cardToActivate) {
        // Terapkan warna aktif & efek zoom gambar
        card.style.setProperty("background-color", "#eb9b32", "important");
        if (title) title.style.setProperty("color", "#ffffff", "important");
        if (desc) desc.style.setProperty("color", "#f3f2f2", "important");
        if (img) img.style.setProperty("transform", "scale(1.08)", "important"); // Gambar zoom 8%
      } else {
        // Reset warna & posisi gambar ke awal
        card.style.removeProperty("background-color");
        if (title) title.style.removeProperty("color");
        if (desc) desc.style.removeProperty("color");
        if (img) img.style.removeProperty("transform");
      }
    });
  }

  // 2. SET KARTU AKTIF PERTAMA KALI
  const initialActiveCard = document.querySelector(".card-actived") || cards[0];

  requestAnimationFrame(() => {
    activateCard(initialActiveCard);
  });

  // 3. PINDAHKAN STATUS AKTIF & ZOOM GAMBAR SAAT HOVER
  cards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      activateCard(card);
    });
  });
});