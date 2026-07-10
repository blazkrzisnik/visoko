// mobilni meni
const burger = document.getElementById('burger');
const mobileNav = document.getElementById('mobileNav');
if (burger && mobileNav) {
  burger.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
  });
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', false);
  }));
}

// scroll reveal
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('is-visible'));
}

// header shadow on scroll
const header = document.querySelector('.site-header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 12);
  });
}

// interaktivni izbirnik rezervacij (leva lista -> drseča slika desno)
const bookingItems = document.querySelectorAll('.booking-item');
const bookingVisual = document.querySelector('.booking-visual');
const bookingImage = document.getElementById('bookingImage');
const bookingTitle = document.getElementById('bookingTitle');
const bookingDesc = document.getElementById('bookingDesc');

if (bookingItems.length && bookingVisual && bookingImage) {
  bookingItems.forEach(item => {
    item.addEventListener('click', () => {
      if (item.classList.contains('active')) return;
      bookingItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      bookingVisual.classList.add('is-switching');
      setTimeout(() => {
        bookingImage.src = item.dataset.img;
        bookingImage.alt = item.dataset.title;
        bookingTitle.textContent = item.dataset.title;
        bookingDesc.textContent = item.dataset.desc;
        bookingVisual.classList.remove('is-switching');
      }, 220);
    });
  });
}

// oddaja obrazca za povpraševanja (Formspree, brez lastnega strežnika)
const visitForm = document.getElementById('visitForm');
const formStatus = document.getElementById('formStatus');

if (visitForm && formStatus) {
  visitForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = visitForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    formStatus.hidden = false;
    formStatus.textContent = 'Pošiljam …';
    formStatus.className = 'form-status';

    try {
      const response = await fetch(visitForm.action, {
        method: 'POST',
        body: new FormData(visitForm),
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        formStatus.textContent = 'Hvala za vaše povpraševanje — kmalu se vam oglasimo osebno.';
        formStatus.className = 'form-status form-status-ok';
        visitForm.reset();
      } else {
        throw new Error('send failed');
      }
    } catch (err) {
      formStatus.textContent = 'Ojoj, sporočilo ni bilo poslano. Poskusite znova ali nam pišite na dvorec.visoko@poljanskadolina.com.';
      formStatus.className = 'form-status form-status-error';
    } finally {
      submitBtn.disabled = false;
    }
  });
}
