/**
 * ACCA — PERSONAL PORTFOLIO JAVASCRIPT
 * Fully modular, framework-free vanilla JavaScript
 * Handles interactivity, animations, accessibility, and form validation.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // =========================================================================
  // 1. DYNAMIC FOOTER YEAR
  // =========================================================================
  const currentYearSpan = document.getElementById('current-year');
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  // =========================================================================
  // 2. THEME TOGGLER (DARK / LIGHT MODE WITH LOCALSTORAGE)
  // =========================================================================
  const themeToggleBtn = document.getElementById('theme-toggle');
  const rootElement = document.documentElement;

  // Check saved preference or default to dark
  const savedTheme = localStorage.getItem('acca_theme') || 'dark';
  rootElement.setAttribute('data-theme', savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = rootElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      rootElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('acca_theme', newTheme);
      showToast(`Switched to ${newTheme} mode`);
    });
  }

  // =========================================================================
  // 3. MOBILE DRAWER NAVIGATION
  // =========================================================================
  const mobileToggleBtn = document.getElementById('mobile-menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link, .mobile-cta-link');

  const closeMobileNav = () => {
    if (mobileNav && mobileToggleBtn) {
      mobileNav.classList.remove('open');
      mobileToggleBtn.setAttribute('aria-expanded', 'false');
      mobileNav.setAttribute('aria-hidden', 'true');
    }
  };

  if (mobileToggleBtn && mobileNav) {
    mobileToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = mobileNav.classList.contains('open');
      if (isOpen) {
        closeMobileNav();
      } else {
        mobileNav.classList.add('open');
        mobileToggleBtn.setAttribute('aria-expanded', 'true');
        mobileNav.setAttribute('aria-hidden', 'false');
      }
    });

    mobileNavLinks.forEach((link) => {
      link.addEventListener('click', () => {
        closeMobileNav();
      });
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (mobileNav.classList.contains('open') && !mobileNav.contains(e.target) && !mobileToggleBtn.contains(e.target)) {
        closeMobileNav();
      }
    });
  }

  // =========================================================================
  // 4. SCROLLSPY (ACTIVE NAVBAR INDICATOR)
  // =========================================================================
  const sections = document.querySelectorAll('section[id]');
  const desktopNavLinks = document.querySelectorAll('.nav-link');

  const handleScrollSpy = () => {
    const scrollPosition = window.scrollY + 140;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        desktopNavLinks.forEach((link) => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  };

  window.addEventListener('scroll', handleScrollSpy, { passive: true });

  // =========================================================================
  // 5. SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
  // =========================================================================
  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    // Fallback for older browsers
    revealElements.forEach((el) => el.classList.add('revealed'));
  }

  // =========================================================================
  // 6. ANIMATED NUMERIC STAT COUNTER
  // =========================================================================
  const statCards = document.querySelectorAll('.stat-card');
  let animatedStats = false;

  const animateCounters = () => {
    const counters = document.querySelectorAll('.stat-counter');
    const speed = 40; // lower is slower

    counters.forEach((counter) => {
      const target = +counter.getAttribute('data-count');
      let count = 0;
      const increment = Math.max(1, Math.ceil(target / speed));

      const updateCount = () => {
        count += increment;
        if (count < target) {
          counter.innerText = count;
          requestAnimationFrame(updateCount);
        } else {
          counter.innerText = target;
        }
      };

      updateCount();
    });
  };

  if ('IntersectionObserver' in window && statCards.length > 0) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !animatedStats) {
          animatedStats = true;
          animateCounters();
          statsObserver.disconnect();
        }
      });
    }, { threshold: 0.3 });

    statCards.forEach((card) => statsObserver.observe(card));
  } else {
    animateCounters();
  }

  // =========================================================================
  // 7. PROJECT FILTERING
  // =========================================================================
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      // Set active button
      filterButtons.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const filterValue = btn.getAttribute('data-filter');

      projectCards.forEach((card) => {
        const categories = card.getAttribute('data-category') || '';
        if (filterValue === 'all' || categories.includes(filterValue)) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 20);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(16px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 200);
        }
      });
    });
  });

  // =========================================================================
  // 8. PROJECT DETAIL MODAL DIALOG
  // =========================================================================
  const projectModal = document.getElementById('project-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalBody = document.getElementById('modal-dynamic-body');
  const openModalBtns = document.querySelectorAll('.open-modal-btn');

  // Rich data dictionary for projects (Mesakh Agung Reiwan)
  const projectData = {
    'web-sistem': {
      category: 'Web Programming & Database',
      title: 'Sistem Informasi & Manajemen Data (PHP & MySQL)',
      description: 'Aplikasi sistem informasi berbasis web dengan fitur manajemen data dinamis, CRUD interaktif, autentikasi multi-level, serta pelaporan otomatis.',
      highlights: [
        'Dibangun menggunakan PHP dan arsitektur database relasional MySQL yang terstruktur rapi.',
        'Antarmuka responsif dan modern berbasis HTML5, CSS3, dan JavaScript interaktif.',
        'Menerapkan enkripsi password dan validasi input sisi server untuk keamanan data.',
        'Fitur filter data cepat, pencarian dinamis, dan ekspor laporan ke format cetak/PDF.'
      ],
      techStack: ['PHP', 'MySQL', 'JavaScript', 'HTML5', 'CSS3', 'Bootstrap / Tailwind'],
      links: {
        demo: 'https://github.com/mesakh-agung',
        repo: 'https://github.com/mesakh-agung'
      }
    },
    'ftth-cluster': {
      category: 'FTTH & Fiber Optic Infrastructure',
      title: 'Perancangan & Dokumentasi Jaringan FTTH Cluster',
      description: 'Proyek perancangan skema distribusi fiber optik skala cluster, mulai dari sentral OLT, pembagian ODC, terminasi ODP, hingga penarikan kabel drop core pelanggan.',
      highlights: [
        'Perhitungan Link Loss Budget untuk memastikan redaman sinyal optik berada di bawah batas standar (< -24 dBm).',
        'Dokumentasi skema penyambungan core (fiber fusion splicing) dengan pembagian warna standar TIA/EIA-598.',
        'Pemetaan titik ODP dan estimasi kebutuhan kabel drop optic per blok perumahan.',
        'Pengujian redaman menggunakan Optical Power Meter (OPM) dan Optical Time Domain Reflectometer (OTDR).'
      ],
      techStack: ['FTTH', 'Fiber Splicer', 'OTDR', 'Optical Power Meter', 'ODP/ODC', 'Topologi Jaringan'],
      links: {
        demo: '#experience',
        repo: 'https://github.com/mesakh-agung'
      }
    },
    'portfolio-web': {
      category: 'Frontend & Interactive Web',
      title: 'Portofolio Web Interaktif & Responsif',
      description: 'Website portofolio pribadi modern berkinerja tinggi yang dibangun dengan HTML5 murni, CSS modern, dan JavaScript tanpa framework tambahan.',
      highlights: [
        'Latar belakang canvas partikel interaktif yang terhubung dinamis dengan gerakan kursor mouse.',
        'Efek spotlight kursor pada kartu (Linear / Vercel modern design style).',
        'Dukungan penuh tema gelap (Dark Mode) dan terang (Light Mode) dengan penyimpanan otomatis di localStorage.',
        'Desain 100% responsif di smartphone, tablet, maupun layar monitor desktop.'
      ],
      techStack: ['HTML5', 'Modern CSS3', 'JavaScript ES6+', 'Canvas API', 'Responsive UI'],
      links: {
        demo: '#hero',
        repo: 'https://github.com/mesakh-agung'
      }
    }
  };

  const openProjectModal = (projectId) => {
    const data = projectData[projectId];
    if (!data || !projectModal || !modalBody) return;

    modalBody.innerHTML = `
      <div class="modal-header-tag">${data.category}</div>
      <h3 class="modal-title" id="modal-title">${data.title}</h3>
      <p class="modal-desc">${data.description}</p>
      
      <div class="modal-highlight-box">
        <div class="modal-highlight-title">Key Engineering & Research Highlights</div>
        <ul class="modal-list">
          ${data.highlights.map(h => `<li>${h}</li>`).join('')}
        </ul>
      </div>

      <div class="project-tech-stack" style="margin-bottom: 24px;">
        ${data.techStack.map(t => `<span class="tech-tag">${t}</span>`).join('')}
      </div>

      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        <a href="${data.links.repo}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
          <span>View Source Code</span>
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
        </a>
        <button class="btn btn-outline btn-sm" id="modal-copy-link-btn">
          <span>Copy Project Info</span>
        </button>
      </div>
    `;

    // Hook copy button inside modal
    const modalCopyBtn = document.getElementById('modal-copy-link-btn');
    if (modalCopyBtn) {
      modalCopyBtn.addEventListener('click', () => {
        copyToClipboard(`${data.title} - ${data.description}`);
        showToast('Project summary copied to clipboard!');
      });
    }

    if (typeof projectModal.showModal === 'function') {
      projectModal.showModal();
    } else {
      projectModal.setAttribute('open', '');
    }
  };

  openModalBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const projectId = btn.getAttribute('data-project');
      openProjectModal(projectId);
    });
  });

  if (modalCloseBtn && projectModal) {
    modalCloseBtn.addEventListener('click', () => {
      if (typeof projectModal.close === 'function') {
        projectModal.close();
      } else {
        projectModal.removeAttribute('open');
      }
    });

    // Close when clicking dialog backdrop
    projectModal.addEventListener('click', (e) => {
      const rect = projectModal.getBoundingClientRect();
      const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height
        && rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
      if (!isInDialog) {
        projectModal.close();
      }
    });
  }

  // =========================================================================
  // 9. PUBLICATIONS ACTIONS (BIBTEX & READ PAPER)
  // =========================================================================
  const copyBibtexBtns = document.querySelectorAll('.copy-bibtex-btn');
  const readPaperBtns = document.querySelectorAll('.read-paper-btn');

  copyBibtexBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const bibtex = btn.getAttribute('data-bibtex');
      if (bibtex) {
        copyToClipboard(bibtex);
        showToast('BibTeX citation copied to clipboard!');
      }
    });
  });

  readPaperBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const url = btn.getAttribute('data-url');
      showToast('Opening preprint / manuscript link...');
      // In production, opens the genuine DOI or arXiv link:
      setTimeout(() => {
        window.open(url, '_blank', 'noopener,noreferrer');
      }, 400);
    });
  });

  // Resume download links
  const resumeLinks = document.querySelectorAll('.download-resume-link, a[title*="curriculum vitae"]');
  resumeLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      // Show informative feedback
      showToast('Demo: Resume download simulated. Replace with your actual PDF link!');
    });
  });

  // =========================================================================
  // 10. CONTACT FORM CLIENT-SIDE VALIDATION & FEEDBACK
  // =========================================================================
  const contactForm = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');

  if (contactForm) {
    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const messageInput = document.getElementById('contact-message');

    const nameError = document.getElementById('name-error');
    const emailError = document.getElementById('email-error');
    const messageError = document.getElementById('message-error');

    // Email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Clear individual error
    const clearError = (input, errorSpan) => {
      input.classList.remove('input-error');
      errorSpan.textContent = '';
    };

    // Set individual error
    const setError = (input, errorSpan, message) => {
      input.classList.add('input-error');
      errorSpan.textContent = message;
    };

    nameInput.addEventListener('input', () => clearError(nameInput, nameError));
    emailInput.addEventListener('input', () => clearError(emailInput, emailError));
    messageInput.addEventListener('input', () => clearError(messageInput, messageError));

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      // Validate name
      if (!nameInput.value.trim() || nameInput.value.trim().length < 2) {
        setError(nameInput, nameError, 'Please provide your name (at least 2 characters).');
        isValid = false;
      } else {
        clearError(nameInput, nameError);
      }

      // Validate email
      if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
        setError(emailInput, emailError, 'Please enter a valid email address.');
        isValid = false;
      } else {
        clearError(emailInput, emailError);
      }

      // Validate message
      if (!messageInput.value.trim() || messageInput.value.trim().length < 10) {
        setError(messageInput, messageError, 'Please enter a message of at least 10 characters.');
        isValid = false;
      } else {
        clearError(messageInput, messageError);
      }

      if (isValid) {
        // Simulate submitting
        submitBtn.classList.add('loading');
        submitBtn.setAttribute('disabled', 'true');

        setTimeout(() => {
          submitBtn.classList.remove('loading');
          submitBtn.removeAttribute('disabled');

          showToast('Message validated! (Demo mode: Connect Formspree/EmailJS to deliver live emails)');
          contactForm.reset();
        }, 1200);
      }
    });
  }

  // =========================================================================
  // 11. UTILITIES: TOAST & CLIPBOARD
  // =========================================================================
  let toastTimer = null;
  function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    if (!toast || !toastMessage) return;

    toastMessage.textContent = message;
    toast.classList.add('active');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('active');
    }, 3800);
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => {
        fallbackCopyText(text);
      });
    } else {
      fallbackCopyText(text);
    }
  }

  // =========================================================================
  // 12. DYNAMIC CANVAS CONSTELLATION & PARTICLE BACKGROUND
  // =========================================================================
  const canvas = document.getElementById('bg-canvas');
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = 0;
    let height = 0;
    let particles = [];
    const mouse = { x: null, y: null, radius: 160 };

    const resizeCanvas = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      createParticles();
    };

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.85;
        this.vy = (Math.random() - 0.5) * 0.85;
        this.radius = Math.random() * 2 + 1;
        this.pulse = Math.random() * Math.PI;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.pulse += 0.03;

        // Bounce on boundary with subtle dampening
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Physics-based mouse interaction: gentle repulsion & elasticity
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            this.x -= (dx / dist) * force * 2.4;
            this.y -= (dy / dist) * force * 2.4;
          }
        }
      }

      draw(isDark) {
        const glowRadius = this.radius + Math.sin(this.pulse) * 0.6;
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.max(0.5, glowRadius), 0, Math.PI * 2);
        ctx.fillStyle = isDark ? '#00f2fe' : '#0284c7';
        ctx.shadowBlur = isDark ? 8 : 4;
        ctx.shadowColor = isDark ? '#00f2fe' : '#0284c7';
        ctx.fill();
        ctx.shadowBlur = 0; // reset shadow for performance
      }
    }

    const createParticles = () => {
      particles = [];
      const count = Math.min(95, Math.floor((width * height) / 14000));
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    };

    const animateParticles = () => {
      const isDark = rootElement.getAttribute('data-theme') !== 'light';
      ctx.clearRect(0, 0, width, height);

      // Draw particle interconnected laser filaments
      const maxDist = 120;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const opacity = (1 - dist / maxDist) * 0.28;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = isDark
              ? `rgba(0, 242, 254, ${opacity})`
              : `rgba(2, 132, 199, ${opacity * 0.85})`;
            ctx.lineWidth = 0.85;
            ctx.stroke();
          }
        }
      }

      // Draw laser web to mouse position
      if (mouse.x !== null && mouse.y !== null) {
        for (let i = 0; i < particles.length; i++) {
          const dx = mouse.x - particles[i].x;
          const dy = mouse.y - particles[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const opacity = (1 - dist / mouse.radius) * 0.42;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = isDark
              ? `rgba(0, 242, 254, ${opacity})`
              : `rgba(2, 132, 199, ${opacity})`;
            ctx.lineWidth = 1.1;
            ctx.stroke();
          }
        }
      }

      // Update & draw particles
      particles.forEach((p) => {
        p.update();
        p.draw(isDark);
      });

      if (!document.hidden) {
        animationFrameId = requestAnimationFrame(animateParticles);
      }
    };

    window.addEventListener('resize', resizeCanvas, { passive: true });
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }, { passive: true });
    window.addEventListener('mouseout', () => {
      mouse.x = null;
      mouse.y = null;
    });

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(animateParticles);
      }
    });

    resizeCanvas();
    animateParticles();
  }

  // =========================================================================
  // 13. HERO TERMINAL TYPING ANIMATION (BLOCK CURSOR)
  // =========================================================================
  const typingElement = document.getElementById('typing-text');
  if (typingElement) {
    const roles = [
      'Network Administrator & Web Developer',
      'Debian 12 & Apache2 Server Setup',
      'Siswa TKJ - SMK Sore Tulungagung',
      'Founder AccaStore & BimbingPKL',
      'Fokus di Debian Server & Website Jualan Cepat'
    ];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 80;

    const typeLoop = () => {
      const currentRole = roles[roleIndex];

      if (isDeleting) {
        typingElement.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 40;
      } else {
        typingElement.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 80;
      }

      if (!isDeleting && charIndex === currentRole.length) {
        // Pause at end of phrase
        typingSpeed = 2200;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        typingSpeed = 450;
      }

      setTimeout(typeLoop, typingSpeed);
    };

    setTimeout(typeLoop, 700);
  }

  // =========================================================================
  // 14. CARD SPOTLIGHT & 3D PERSPECTIVE TILT
  // =========================================================================
  const spotlightCards = document.querySelectorAll('.spotlight-card');
  spotlightCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      // 3D perspective tilt
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
    }, { passive: true });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  });
});

