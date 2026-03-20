import { projectsData } from './data/projects'

// --- КОНСТАНТЫ И ПЕРЕМЕННЫЕ ---
const getItemsPerPage = () => window.innerWidth <= 480 ? 4 : 8;

let ITEMS_PER_PAGE = getItemsPerPage();
let currentPage = 0;
let scrollY = 0;

const container = document.getElementById('projects-container') as HTMLElement;
const dotsContainer = document.getElementById('pag-dots') as HTMLElement;
const prevBtn = document.getElementById('prev-btn') as HTMLButtonElement;
const nextBtn = document.getElementById('next-btn') as HTMLButtonElement;

const openBtn = document.getElementById('menu-open');
const closeBtn = document.getElementById('menu-close');
const menu = document.getElementById('mobile-menu');
const meetingBtn = document.querySelector('.meeting-btn') as HTMLButtonElement;

// --- ЛОГИКА ПАГИНАЦИИ ПРОЕКТОВ ---
const modal = document.getElementById('project-modal') as HTMLElement;
const modalClose = modal.querySelector('.modal__close');
const modalOverlay = modal.querySelector('.modal__overlay');

const toggleBodyScroll = (isFixed: boolean) => {
  const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
  const body = document.body;

  if (isFixed) {
    // Сохраняем текущую позицию, чтобы не скроллило вверх (актуально для iOS)
    body.dataset.scrollY = window.scrollY.toString();

    body.style.overflow = 'hidden';
    body.style.paddingRight = `${scrollBarWidth}px`; // Компенсация исчезнувшего скролла

    // Специфично для мобилок: фиксируем позицию
    if (window.innerWidth <= 768) {
      body.style.position = 'fixed';
      body.style.top = `-${body.dataset.scrollY}px`;
      body.style.width = '100%';
    }
  } else {
    if (window.innerWidth <= 768) {
      // Сначала восстанавливаем скролл, пока ещё position: fixed
      const savedScroll = parseInt(body.dataset.scrollY || '0');
      window.scrollTo(0, savedScroll);
      
      // Даем браузеру применить скролл, потом убираем fixed
      requestAnimationFrame(() => {
        body.style.position = '';
        body.style.top = '';
        body.style.width = '';
        body.style.overflow = '';
        body.style.paddingRight = '';
      });
    } else {
      body.style.overflow = '';
      body.style.paddingRight = '';
    }
  }
};

// Функция открытия (добавь к остальным функциям)
function openProjectDetails(projectId: number) {
  const project = projectsData.find(p => p.id === projectId);
  if (!project) return;

  const title = document.getElementById('modal-title');
  const img = document.getElementById('modal-img') as HTMLImageElement;
  const desc = document.getElementById('modal-desc-full');
  const featuresList = document.getElementById('modal-features');

  if (title) title.innerText = project.title;
  if (img) img.src = project.image;
  
  // Используем полное описание из твоего интерфейса
  if (desc) {
    // Проверяем: если fullDescription существует и не пустой — рендерим HTML, 
    // иначе выводим обычный description как обычный текст
    if (project.fullDescription && project.fullDescription.trim() !== "") {
      desc.innerHTML = project.fullDescription;
    } else {
      desc.innerText = project.description;
    }
  }

  // Очищаем список фич, так как в интерфейсе их нет
  if (featuresList) featuresList.innerHTML = '';

  modal.classList.add('active');
  // Для мобилок можно добавить небольшой класс на body, чтобы зафиксировать фон
  toggleBodyScroll(true);
  document.body.classList.add('modal-open');
}

// Закрытие
const closeModal = () => {
  if (window.innerWidth <= 768) {
    modal.classList.add('closing');

    setTimeout(() => {
      modal.classList.remove('active');
      modal.classList.remove('closing');
      toggleBodyScroll(false);
    }, 300);
  } else {
    modal.classList.remove('active');
    toggleBodyScroll(false);
  }
};

modalClose?.addEventListener('click', closeModal);
modalOverlay?.addEventListener('click', closeModal);

// ОБНОВЛЕННЫЙ RENDER (добавь onclick в шаблон строки)
function renderProjects(page: number) {
  container.classList.add('fade-out');

  setTimeout(() => {
    container.innerHTML = '';
    const start = page * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const pageItems = projectsData.slice(start, end);

    pageItems.forEach(item => {
      const cardHTML = `
        <div class="project-card" style="cursor: pointer" onclick="openProjectDetails(${item.id})">
          <div class="project-card__image-wrapper">
            <img src="${item.image}" alt="${item.title}">
          </div>
          <div class="project-card__info">
            <div class="project-card__text">
              <span class="project-card__category">${item.category}:</span> 
              ${item.title}
            </div>
          </div>
        </div>
      `;
      container.insertAdjacentHTML('beforeend', cardHTML);
    });

    container.classList.remove('fade-out');
    updateControls();
  }, 400);
}

// Чтобы TypeScript не ругался на onclick в строке, прокинем функцию в window
(window as any).openProjectDetails = openProjectDetails;

// Слушатель изменения размера окна, чтобы пересчитать количество карточек
window.addEventListener('resize', () => {
  const newLimit = getItemsPerPage();
  if (newLimit !== ITEMS_PER_PAGE) {
    ITEMS_PER_PAGE = newLimit;
    currentPage = 0; // Сбрасываем на первую страницу, чтобы избежать ошибок индекса
    renderProjects(currentPage);
  }
});

function updateControls() {
  const totalPages = Math.ceil(projectsData.length / ITEMS_PER_PAGE);
  
  if (prevBtn) prevBtn.disabled = currentPage === 0;
  if (nextBtn) nextBtn.disabled = currentPage === totalPages - 1;

  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    for (let i = 0; i < totalPages; i++) {
      const dot = document.createElement('div');
      dot.className = `dot ${i === currentPage ? 'active' : ''}`;
      dot.onclick = () => goToPage(i);
      dotsContainer.appendChild(dot);
    }
  }
}

function goToPage(page: number) {
  if (page === currentPage) return;
  currentPage = page;
  renderProjects(currentPage);
}

if (prevBtn) prevBtn.onclick = () => {
  if (currentPage > 0) goToPage(currentPage - 1);
};

if (nextBtn) nextBtn.onclick = () => {
  if (currentPage < Math.ceil(projectsData.length / ITEMS_PER_PAGE) - 1) {
    goToPage(currentPage + 1);
  }
};

// --- ЛОГИКА МОБИЛЬНОГО МЕНЮ (FIXED VERSION) ---

const openMobileMenu = () => {
  // Просто блокируем прокрутку
  document.body.style.overflow = 'hidden';
  document.body.style.touchAction = 'none'; // Запрещает свайпы мимо меню
  
  menu?.classList.add('active');
  document.body.classList.add('menu-open');
};

const closeMobileMenu = () => {
  // Возвращаем как было
  document.body.style.overflow = '';
  document.body.style.touchAction = '';
  
  menu?.classList.remove('active');
  document.body.classList.remove('menu-open');
  
  // УДАЛИТЕ window.scrollTo(0, scrollY) и document.body.style.top = '';
  // Они больше не нужны, так как страница никуда не уходила
};

openBtn?.addEventListener('click', openMobileMenu);
closeBtn?.addEventListener('click', closeMobileMenu);

// Кнопка "назначить встречу"
meetingBtn?.addEventListener('click', () => {
  closeMobileMenu();
  document.getElementById('contacts')?.scrollIntoView({ behavior: 'smooth' });
});

// Плавный скролл + закрытие меню
const allLinks = document.querySelectorAll('a[href^="#"]');

allLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();

    const id = link.getAttribute('href');
    if (!id || id === '#') return;

    const target = document.querySelector(id);
    if (target) {
      closeMobileMenu();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// --- ЛОГИКА ФОРМЫ ---

const contactForm = document.querySelector('.contact-form') as HTMLFormElement;

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);
    
    // 1. Валидация почты (простой Regex для структуры x@x.x)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // 2. Валидация телефона (только цифры, минимум 10 штук)
    const phoneDigits = (data.phone as string).replace(/\D/g, '');

    // Сброс предыдущих ошибок (если есть стили)
    const inputs = contactForm.querySelectorAll('.form-input');
    inputs.forEach(input => input.classList.remove('error'));

    // Проверка почты (если заполнена)
    if (data.email && !emailRegex.test(data.email as string)) {
      alert('Пожалуйста, введите корректный E-mail');
      return;
    }

    // Проверка телефона
    if (phoneDigits.length < 10) {
      alert('Номер телефона слишком короткий');
      return;
    }

    // Если всё ок — отправляем
    console.log('Данные валидны, отправка:', data);

    const btn = contactForm.querySelector('.submit-btn') as HTMLButtonElement;
    const originalText = btn.innerText;
    
    btn.innerText = 'ОТПРАВЛЕНО';
    btn.style.background = '#4ade80'; 
    
    setTimeout(() => {
      btn.innerText = originalText;
      btn.style.background = '#0DFFF7';
      contactForm.reset();
    }, 3000);
  });
}

const scrollHint = document.querySelector('.hero-scroll-hint');

scrollHint?.addEventListener('click', () => {
  const contactSection = document.querySelector('#contacts');
  contactSection?.scrollIntoView({ behavior: 'smooth' });
});


const phoneInput = document.querySelector('input[name="phone"]') as HTMLInputElement;

if (phoneInput) {
  phoneInput.addEventListener('input', (e: Event) => {
    const el = e.target as HTMLInputElement;
    let value = el.value.replace(/\D/g, ""); // Только цифры

    // ЛОГИКА ОЧИСТКИ ПРИ ВСТАВКЕ
    // Если вставили 11 цифр (например, 7917...) и в инпуте уже была 7
    // получается строка типа 77917... — нам нужно оставить только последние 10 цифр
    if (value.length >= 11) {
      // Отрезаем всё, кроме последних 10 цифр
      value = value.slice(-10);
    } else if (value.startsWith('7') || value.startsWith('8')) {
      // Если ввели меньше 11, но начали с 7 или 8 — тоже убираем префикс
      value = value.substring(1);
    }

    // Ограничиваем до 10 знаков (917 406 01 63)
    value = value.substring(0, 10);

    // ФОРМИРОВАНИЕ МАСКИ
    let result = "+7";
    if (value.length > 0) result += " (" + value.substring(0, 3);
    if (value.length >= 4) result += ") " + value.substring(3, 6);
    if (value.length >= 7) result += " " + value.substring(6, 8);
    if (value.length >= 9) result += " " + value.substring(8, 10);

    el.value = result;
  });

  // Защита от стирания +7
  phoneInput.addEventListener('keydown', (e: KeyboardEvent) => {
    const el = e.target as HTMLInputElement;
    if (e.key === "Backspace" && el.value.length <= 4) {
      e.preventDefault();
    }
  });

  // При фокусе, если пусто, ставим заготовку
  phoneInput.addEventListener('focus', () => {
    if (!phoneInput.value) phoneInput.value = "+7 (";
  });
}
// Валидация Email на 200 символов (если вдруг атрибут maxlength не сработает)
const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;
emailInput?.addEventListener('input', () => {
  if (emailInput.value.length > 200) {
    emailInput.value = emailInput.value.substring(0, 200);
  }
});

const initCookieBanner = () => {
  const banner = document.getElementById('cookie-banner');
  const acceptBtn = document.getElementById('cookie-accept');

  if (!banner || !acceptBtn) return;

  // Проверяем, принимал ли пользователь куки ранее
  const isCookieAccepted = localStorage.getItem('cookieAccepted');

  if (!isCookieAccepted) {
    // Показываем через 2 секунды после загрузки для мягкого эффекта
    setTimeout(() => {
      banner.classList.add('active');
    }, 2000);
  }

  acceptBtn.addEventListener('click', () => {
    banner.classList.remove('active');
    // Сохраняем выбор в браузере
    localStorage.setItem('cookieAccepted', 'true');
  });
};

// Вызови эту функцию при инициализации приложения
initCookieBanner();

// --- ИНИЦИАЛИЗАЦИЯ ---
renderProjects(currentPage);