import { projectsData } from './data/projects'

// --- КОНСТАНТЫ И ПЕРЕМЕННЫЕ ---
const getProjectsPerPage = () => window.innerWidth <= 480 ? 2 : 4;

// Состояние для каждой строки
let currentPageRow0 = 0;
let currentPageRow1 = 0;

// Элементы для строки 0 (проекты 0,1,2,3 / 4,5,6,7 / ...)
const row0 = document.getElementById('project-row-0') as HTMLElement;
const dotsRow0 = document.getElementById('pag-dots-row-0') as HTMLElement;
const prevBtnRow0 = document.getElementById('prev-btn-row-0') as HTMLButtonElement;
const nextBtnRow0 = document.getElementById('next-btn-row-0') as HTMLButtonElement;

// Элементы для строки 1 (проекты 4,5,6,7 / 8,9,10,11 / ...)
const row1 = document.getElementById('project-row-1') as HTMLElement;
const dotsRow1 = document.getElementById('pag-dots-row-1') as HTMLElement;
const prevBtnRow1 = document.getElementById('prev-btn-row-1') as HTMLButtonElement;
const nextBtnRow1 = document.getElementById('next-btn-row-1') as HTMLButtonElement;

const openBtn = document.getElementById('menu-open');
const closeBtn = document.getElementById('menu-close');
const menu = document.getElementById('mobile-menu');
const meetingBtn = document.querySelector('.meeting-btn') as HTMLButtonElement;

// --- ЛОГИКА ПАГИНАЦИИ ПРОЕКТОВ ---
const modal = document.getElementById('project-modal') as HTMLElement;
const modalClose = modal.querySelector('.modal__close');
const modalOverlay = modal.querySelector('.modal__overlay');

const toggleBodyScroll = (isFixed: boolean) => {
  const body = document.body;

  if (isFixed) {
    // Блокируем скролл страницы
    body.classList.add('modal-open');
  } else {
    // Разблокируем скролл
    body.classList.remove('modal-open');
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
  toggleBodyScroll(true);
  
  // Сбрасываем скролл ПОСЛЕ показа модалки (иначе не сработает)
  // На десктопе скроллится .modal__info-side, на мобильных — .modal__body
  requestAnimationFrame(() => {
    const infoSide = modal.querySelector('.modal__info-side');
    const modalBody = modal.querySelector('.modal__body');
    
    if (infoSide) {
      infoSide.scrollTop = 0;
    }
    if (modalBody) {
      modalBody.scrollTop = 0;
    }
  });
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

// Рендер проектов для строки
function renderRow(rowElement: HTMLElement, page: number, rowOffset: number) {
  rowElement.innerHTML = '';
  // На десктопе (perPage=4): Строка 0: 0-3, 8-11... | Строка 1: 4-7, 12-15...
  // На мобиле (perPage=2): Строка 0: 0-1, 4-5... | Строка 1: 2-3, 6-7...
  const perPage = getProjectsPerPage();
  const start = page * (perPage * 2) + rowOffset * perPage;
  const end = start + perPage;
  const rowProjects = projectsData.slice(start, end);

  rowProjects.forEach(item => {
    const cardHTML = `
      <div class="project-card" style="cursor: pointer" onclick="openProjectDetails(${item.id})">
        <div class="project-card__inner">
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
      </div>
    `;
    rowElement.insertAdjacentHTML('beforeend', cardHTML);
  });
}

// Чтобы TypeScript не ругался на onclick в строке, прокинем функцию в window
(window as any).openProjectDetails = openProjectDetails;

// Обновление контролов для строки
function updateRowControls(
  dotsContainer: HTMLElement,
  prevBtn: HTMLButtonElement,
  nextBtn: HTMLButtonElement,
  currentPage: number,
  rowOffset: number
) {
  // Считаем сколько страниц доступно для этой строки
  const perPage = getProjectsPerPage();
  const startForRow = rowOffset * perPage;
  const projectsRemaining = projectsData.length - startForRow;
  const totalPagesForRow = Math.ceil(projectsRemaining / (perPage * 2));

  if (prevBtn) prevBtn.disabled = currentPage === 0;
  if (nextBtn) nextBtn.disabled = currentPage >= totalPagesForRow - 1;

  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    for (let i = 0; i < totalPagesForRow; i++) {
      const dot = document.createElement('div');
      dot.className = `dot ${i === currentPage ? 'active' : ''}`;
      dot.onclick = () => {
        if (rowOffset === 0) {
          currentPageRow0 = i;
          renderRow(row0, currentPageRow0, 0);
          updateRowControls(dotsRow0, prevBtnRow0, nextBtnRow0, currentPageRow0, 0);
        } else {
          currentPageRow1 = i;
          renderRow(row1, currentPageRow1, 1);
          updateRowControls(dotsRow1, prevBtnRow1, nextBtnRow1, currentPageRow1, 1);
        }
      };
      dotsContainer.appendChild(dot);
    }
  }
}

// Инициализация
renderRow(row0, currentPageRow0, 0);
renderRow(row1, currentPageRow1, 1);
updateRowControls(dotsRow0, prevBtnRow0, nextBtnRow0, currentPageRow0, 0);
updateRowControls(dotsRow1, prevBtnRow1, nextBtnRow1, currentPageRow1, 1);

// Обработчики для строки 0
if (prevBtnRow0) prevBtnRow0.onclick = () => {
  if (currentPageRow0 > 0) {
    currentPageRow0--;
    renderRow(row0, currentPageRow0, 0);
    updateRowControls(dotsRow0, prevBtnRow0, nextBtnRow0, currentPageRow0, 0);
  }
};

if (nextBtnRow0) nextBtnRow0.onclick = () => {
  const perPage = getProjectsPerPage();
  const startForRow = 0 * perPage;
  const projectsRemaining = projectsData.length - startForRow;
  const totalPagesForRow = Math.ceil(projectsRemaining / (perPage * 2));
  
  if (currentPageRow0 < totalPagesForRow - 1) {
    currentPageRow0++;
    renderRow(row0, currentPageRow0, 0);
    updateRowControls(dotsRow0, prevBtnRow0, nextBtnRow0, currentPageRow0, 0);
  }
};

// Обработчики для строки 1
if (prevBtnRow1) prevBtnRow1.onclick = () => {
  if (currentPageRow1 > 0) {
    currentPageRow1--;
    renderRow(row1, currentPageRow1, 1);
    updateRowControls(dotsRow1, prevBtnRow1, nextBtnRow1, currentPageRow1, 1);
  }
};

if (nextBtnRow1) nextBtnRow1.onclick = () => {
  const perPage = getProjectsPerPage();
  const startForRow = 1 * perPage;
  const projectsRemaining = projectsData.length - startForRow;
  const totalPagesForRow = Math.ceil(projectsRemaining / (perPage * 2));

  if (currentPageRow1 < totalPagesForRow - 1) {
    currentPageRow1++;
    renderRow(row1, currentPageRow1, 1);
    updateRowControls(dotsRow1, prevBtnRow1, nextBtnRow1, currentPageRow1, 1);
  }
};

// --- СВАЙП ДЛЯ МОБИЛЬНЫХ ---

const addSwipeSupport = (
  rowElement: HTMLElement,
  wrapperElement: HTMLElement,
  getCurrentPage: () => number,
  setCurrentPage: (page: number) => void,
  rowOffset: number
) => {
  let touchStartX = 0;
  let touchStartY = 0;
  let isSwiping = false;

  wrapperElement.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isSwiping = true;
  }, { passive: true });

  wrapperElement.addEventListener('touchmove', (e) => {
    if (!isSwiping) return;
    const diffX = Math.abs(e.touches[0].clientX - touchStartX);
    const diffY = Math.abs(e.touches[0].clientY - touchStartY);
    // Если горизонтальное движение сильнее вертикального — блокируем скролл
    if (diffX > diffY && diffX > 10) {
      e.preventDefault();
    }
  }, { passive: false });

  wrapperElement.addEventListener('touchend', (e) => {
    if (!isSwiping) return;
    isSwiping = false;

    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    const threshold = 50; // Минимальное расстояние для срабатывания

    if (Math.abs(diff) < threshold) return;

    const perPage = getProjectsPerPage();
    const startForRow = rowOffset * perPage;
    const projectsRemaining = projectsData.length - startForRow;
    const totalPagesForRow = Math.ceil(projectsRemaining / (perPage * 2));
    const currentPage = getCurrentPage();

    if (diff > 0) {
      // Свайп влево — следующая страница
      if (currentPage < totalPagesForRow - 1) {
        setCurrentPage(currentPage + 1);
        renderRow(rowElement, currentPage + 1, rowOffset);
        updateRowControls(
          rowOffset === 0 ? dotsRow0 : dotsRow1,
          rowOffset === 0 ? prevBtnRow0 : prevBtnRow1,
          rowOffset === 0 ? nextBtnRow0 : nextBtnRow1,
          currentPage + 1,
          rowOffset
        );
      }
    } else {
      // Свайп вправо — предыдущая страница
      if (currentPage > 0) {
        setCurrentPage(currentPage - 1);
        renderRow(rowElement, currentPage - 1, rowOffset);
        updateRowControls(
          rowOffset === 0 ? dotsRow0 : dotsRow1,
          rowOffset === 0 ? prevBtnRow0 : prevBtnRow1,
          rowOffset === 0 ? nextBtnRow0 : nextBtnRow1,
          currentPage - 1,
          rowOffset
        );
      }
    }
  }, { passive: true });
};

addSwipeSupport(
  row0,
  row0.parentElement as HTMLElement,
  () => currentPageRow0,
  (page) => { currentPageRow0 = page; },
  0
);

addSwipeSupport(
  row1,
  row1.parentElement as HTMLElement,
  () => currentPageRow1,
  (page) => { currentPageRow1 = page; },
  1
);

// Перерисовка при ресайзе (смена количества колонок)
let resizeTimeout: ReturnType<typeof setTimeout>;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    currentPageRow0 = 0;
    currentPageRow1 = 0;
    renderRow(row0, currentPageRow0, 0);
    renderRow(row1, currentPageRow1, 1);
    updateRowControls(dotsRow0, prevBtnRow0, nextBtnRow0, currentPageRow0, 0);
    updateRowControls(dotsRow1, prevBtnRow1, nextBtnRow1, currentPageRow1, 1);
  }, 200);
});

// --- ЛОГИКА МОБИЛЬНОГО МЕНЮ (FIXED VERSION) ---

const openMobileMenu = () => {
  // Блокируем прокрутку
  toggleBodyScroll(true);
  menu?.classList.add('active');
  document.body.classList.add('menu-open');
};

const closeMobileMenu = () => {
  // Возвращаем как было
  toggleBodyScroll(false);
  menu?.classList.remove('active');
  document.body.classList.remove('menu-open');
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

    // Показываем модальное окно успеха
    const successModal = document.getElementById('success-modal');
    if (successModal) {
      successModal.classList.add('active');
      document.body.classList.add('modal-open');
    }

    contactForm.reset();
  });
}

// --- ВАЛИДАЦИЯ ТЕЛЕФОНА И EMAIL (основная форма + модалка) ---

const applyPhoneMask = (input: HTMLInputElement) => {
  input.addEventListener('input', (e: Event) => {
    const el = e.target as HTMLInputElement;
    let value = el.value.replace(/\D/g, "");

    if (value.length >= 11) {
      value = value.slice(-10);
    } else if (value.startsWith('7') || value.startsWith('8')) {
      value = value.substring(1);
    }

    value = value.substring(0, 10);

    let result = "+7";
    if (value.length > 0) result += " (" + value.substring(0, 3);
    if (value.length >= 4) result += ") " + value.substring(3, 6);
    if (value.length >= 7) result += " " + value.substring(6, 8);
    if (value.length >= 9) result += " " + value.substring(8, 10);

    el.value = result;
  });

  input.addEventListener('keydown', (e: KeyboardEvent) => {
    const el = e.target as HTMLInputElement;
    if (e.key === "Backspace" && el.value.length <= 4) {
      e.preventDefault();
    }
  });

  input.addEventListener('focus', () => {
    if (!input.value) input.value = "+7 (";
  });
};

const applyEmailLimit = (input: HTMLInputElement) => {
  input.addEventListener('input', () => {
    if (input.value.length > 200) {
      input.value = input.value.substring(0, 200);
    }
  });
};

// Основная форма
const phoneInput = document.querySelector('.contact-form input[name="phone"]') as HTMLInputElement;
const emailInput = document.querySelector('.contact-form input[name="email"]') as HTMLInputElement;

if (phoneInput) applyPhoneMask(phoneInput);
if (emailInput) applyEmailLimit(emailInput);

// Модалка
const modalPhoneInput = document.querySelector('.contact-form-modal input[name="phone"]') as HTMLInputElement;
const modalEmailInput = document.querySelector('.contact-form-modal input[name="email"]') as HTMLInputElement;

if (modalPhoneInput) applyPhoneMask(modalPhoneInput);
if (modalEmailInput) applyEmailLimit(modalEmailInput);

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

// --- МОДАЛЬНЫЕ ОКНА ФУТЕРА ---

const openInfoModal = (modalId: string) => {
  const modal = document.getElementById(modalId) as HTMLElement;
  if (!modal) return;

  modal.classList.add('active');
  document.body.classList.add('modal-open');

  // Сброс скролла
  requestAnimationFrame(() => {
    const modalBody = modal.querySelector('.info-modal__body');
    if (modalBody) {
      modalBody.scrollTop = 0;
    }
  });
};

const closeInfoModal = (modal: HTMLElement) => {
  modal.classList.remove('active');
  document.body.classList.remove('modal-open');
};

// Политика конфиденциальности
const privacyLink = document.getElementById('privacy-link');
const privacyModal = document.getElementById('privacy-modal');
privacyLink?.addEventListener('click', (e) => {
  e.preventDefault();
  openInfoModal('privacy-modal');
});

// Условия использования
const termsLink = document.getElementById('terms-link');
const termsModal = document.getElementById('terms-modal');
termsLink?.addEventListener('click', (e) => {
  e.preventDefault();
  openInfoModal('terms-modal');
});

// Настройки cookie — просто скрываем баннер и сбрасываем согласие
const cookieSettingsLink = document.getElementById('cookie-settings-link');
cookieSettingsLink?.addEventListener('click', (e) => {
  e.preventDefault();
  localStorage.removeItem('cookieAccepted');
  const banner = document.getElementById('cookie-banner');
  banner?.classList.add('active');
});

// Закрытие модальных окон футера
[privacyModal, termsModal].forEach(modal => {
  if (!modal) return;

  const closeBtn = modal.querySelector('.modal__close');
  const overlay = modal.querySelector('.modal__overlay');

  closeBtn?.addEventListener('click', () => closeInfoModal(modal));
  overlay?.addEventListener('click', () => closeInfoModal(modal));
});

// --- МОДАЛЬНОЕ ОКНО АНКЕТЫ (иконка телефона) ---

const contactModal = document.getElementById('contact-modal') as HTMLElement;
const phoneIcon = document.querySelector('.hero-scroll-hint');
const contactModalClose = contactModal?.querySelector('.modal__close');
const contactModalOverlay = contactModal?.querySelector('.modal__overlay');

const openContactModal = () => {
  if (!contactModal) return;
  contactModal.classList.add('active');
  document.body.classList.add('modal-open');

  requestAnimationFrame(() => {
    const body = contactModal.querySelector('.contact-modal__body');
    if (body) body.scrollTop = 0;
  });
};

const closeContactModal = () => {
  if (!contactModal) return;
  contactModal.classList.remove('active');
  document.body.classList.remove('modal-open');
};

phoneIcon?.addEventListener('click', openContactModal);
contactModalClose?.addEventListener('click', closeContactModal);
contactModalOverlay?.addEventListener('click', closeContactModal);

// Обработка отправки формы в модальном окне
const contactFormModal = document.querySelector('.contact-form-modal') as HTMLFormElement;
if (contactFormModal) {
  contactFormModal.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(contactFormModal);
    const data = Object.fromEntries(formData);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneDigits = (data.phone as string).replace(/\D/g, '');

    const inputs = contactFormModal.querySelectorAll('.form-input');
    inputs.forEach(input => input.classList.remove('error'));

    if (data.email && !emailRegex.test(data.email as string)) {
      alert('Пожалуйста, введите корректный E-mail');
      return;
    }

    if (phoneDigits.length < 10) {
      alert('Номер телефона слишком короткий');
      return;
    }

    console.log('Данные валидны, отправка:', data);

    // Закрываем анкету и показываем успех
    closeContactModal();

    const successModal = document.getElementById('success-modal');
    if (successModal) {
      successModal.classList.add('active');
      document.body.classList.add('modal-open');
    }

    contactFormModal.reset();
  });
}

// Закрытие success-modal
const successModal = document.getElementById('success-modal');
const successModalClose = successModal?.querySelector('.modal__close');
const successModalOverlay = successModal?.querySelector('.modal__overlay');

const closeSuccessModal = () => {
  if (!successModal) return;
  successModal.classList.remove('active');
  document.body.classList.remove('modal-open');
};

successModalClose?.addEventListener('click', closeSuccessModal);
successModalOverlay?.addEventListener('click', closeSuccessModal);