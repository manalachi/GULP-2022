"use strict"

// Проверка поддержки webpб добавление класса webp или no-webp для HTML
export function isWebp() {
    //Проверка поддержки webp
    function testWebP(callback) {
        let webP = new Image();
        webP.onload = webP.onerror = function () {
            callback(webP.height == 2);
        };
        webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
    }
    
    // Добавление класса
    testWebP(function (support) {        
        // if (support == true) {
        // document.querySelector('body').classList.add('webp');
        // }else{
        // document.querySelector('body').classList.add('no-webp');
        // }
        let className = support === true ? 'webp' : 'no-webp';
        document.querySelector('body').classList.add(className);
    });
}

/* Проверка мобильного браузера */ 
export let isMobile = {
    Android: function() {
		return navigator.userAgent.match(/Android/i);
	},
	BlackBerry: function() {
		return navigator.userAgent.match(/BlackBerry/i);
	},
	iOS: function() {
		return navigator.userAgent.match(/iPhone|iPad|iPod/i);
	},
	Opera: function() {
		return navigator.userAgent.match(/Opera Mini/i);
	},
	Windows: function() {
		return navigator.userAgent.match(/IEMobile/i);
	},
	any: function() {
		return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
	}
};

/* Добавление класса touch для HTML если браузер мобильный */
export function addTouchClass() {
    if (isMobile.any()) document.documentElement.classList.add('touch');
}

/* Добавление loaded для HTML после полной загрузки страницы  */
export function addLoadedClass() {
    window.addEventListener("load", function () {
        setTimeout(function () {
            document.documentElement.classList.add('loaded');
        }, 0) 
    });
}

/* Получение хэша в адресе сайта */
export function getHash() {
    if (location.storage) {return location.hash.replace('#', '')}
}

/* Указание хэша в адресе сайта */
export function setHash(hash) {
    history.pushState('', '', hash)
}

/* Учёт плавающей панелина мобильных устройствах при 100vh */
export function fulVHfix() {
    const fullScreens = document.querySelectorAll(['data-fulscreen']);
    if (fullScreens.length && isMobile.any()) {
        window.addEventListener('resize', fixHeight);
        function fixHeight() {
            let vh = window.innerHeight * 0.1;
            document.documentElement.style.setProperty('--vh', `${vh}px`)
        }
        fixHeight();
    }
}

export function spollers() {
        //SPOLLERS
    const spollersArray = document.querySelectorAll('[data-spollers]');
    if (spollersArray.length > 0) {
        //Получение обычных спойлеров
        const spollersRegular = Array.from(spollersArray).filter(function(item, index, self) {
            return !item.dataset.spollers.split(",")[0];
        
        });
        //Инициализация обычных спойлеров
        if (spollersRegular.length > 0) {
            initSpollers(spollersRegular);
        }

        //Получение обычных спойлеров с медиа запросами
        const spollersMedia = Array.from(spollersArray).filter(function(item, index, self) {
            return item.dataset.spollers.split(",")[0];       
        });
        //Инициализация обычных спойлеров с медиа запросом
        if (spollersMedia.length > 0) {
            const breakpointsArray = []; 
            spollersMedia.forEach(item => {
            const params = item.dataset.spollers;
            const breakpoint = {};
            const paramsArray = params.split(",");
            breakpoint.value = paramsArray[0];
            breakpoint.type = paramsArray[1] ? paramsArray[1].trim() : "max";
            breakpoint.item = item;
            breakpointsArray.push(breakpoint)
            });

            // Получаем уникальные брейкпоинты
            let mediaQueries = breakpointsArray.map(function(item) {
                return `(${item.type}-width: ${item.value}px),${item.value},${item.type}`;            
            });
            mediaQueries = mediaQueries.filter(function(item, index, self) {
                return self.indexOf(item) === index;
            });

            // Работаем с каждым брейкпоинтом
            mediaQueries.forEach(breakpoint => {
                const paramsArray = breakpoint.split(',');
                const mediaBreakpoint = paramsArray[1];
                const mediaType = paramsArray[2];
                const matchMedia = window.matchMedia(paramsArray[0]);

                //Объекты с нужными условиями
                const spollersArray = breakpointsArray.filter(function(item) {
                    if (item.value === mediaBreakpoint && item.type === mediaType) {
                        return true;
                    }
                });
                // Событие
                matchMedia.addListener(function () {
                    initSpollers(spollersArray, matchMedia);
                });
                initSpollers(spollersArray, matchMedia);
            });
        }
        // Инициализация
        function initSpollers(spollersArray, matchMedia = false) {
            spollersArray.forEach(spollersBlock => {
                spollersBlock = matchMedia ? spollersBlock.item : spollersBlock;
                if (matchMedia.matches || !matchMedia) {
                    spollersBlock.classList.add('_init');
                    initSpollerBody(spollersBlock);
                    spollersBlock.addEventListener('click', setSpollerAction);
                } else {
                    spollersBlock.classList.remove("_init");
                    initSpollerBody(spollersBlock, false);
                    spollersBlock.removeEventListener('click', setSpollerAction);
                }
            });
        }
        // Работа с контентом 
        function initSpollerBody(spollersBlock, hideSpollerBlock = true) {
            const spollerTitles = spollersBlock.querySelectorAll('[data-spoller]');
            if (spollerTitles.length > 0) {
                spollerTitles.forEach(spollerTitle => {
                    if (hideSpollerBlock) {
                        spollerTitle.removeAttribute('tabindex');
                        if (!spollerTitle.classList.contains('_active')) {
                            spollerTitle.nextElementSibling.hidden = true;
                        }
                    } else {
                        spollerTitle.setAttribute('tabindex', '-1');
                        spollerTitle.nextElementSibling.hidden = false;
                    }
                });
            }
        } 
        function setSpollerAction(e) {
            const el = e.target;
            if (el.hasAttribute('data-spoller') || el.closest('[data-spoller]')) {
                const spollerTitle = el.hasAttribute('data-spoller') ? el : el.closest('[data-spoller]');
                const spollersBlock = spollerTitle.closest('[data-spollers]');
                const oneSpoller = spollersBlock.hasAttribute('data-one-spoller') ? true : false;
                if (!spollersBlock.querySelectorAll('._slide').length) {
                    if (oneSpoller && !spollerTitle.classList.contains('_active')) {
                        hideSpollersBody(spollersBlock);
                    }
                    spollerTitle.classList.toggle('_active');
                    _slideToggle(spollerTitle.nextElementSibling, 500);
                }
                e.preventDefault();
            }
        }
        function hideSpollersBody(spollersBlock) {
            const spollerActiveTitle = spollersBlock.querySelector('[data-spoller] ._active');
            if (spollerActiveTitle) {
                spollerActiveTitle.classList.remove('_active');
                _slideUp(spollerActiveTitle.nextElementSibling, 500);
            }
        }
    }

    // =========================================================================================================================
    // SlideToggle
    let _slideUp = (target, duration = 500, showmore = 0) => {
        if (!target.classList.contains('_slide')) {
            target.classList.add('_slide');
            target.style.transitionProperty = 'height, margin, padding';
            target.style.transitionDuration = duration + 'ms';
            target.style.height = target.offsetHeight + 'px';
            target.offsetHeight;
            target.style.overflow = 'hidden';
            target.style.height = showmore ? `${showmore}px` : `0px` ;
            target.style.paddingTop = 0;
            target.style.paddingBottom = 0;
            target.style.marginTop = 0;
            target.style.marginBottom = 0;
            window.setTimeout(() => {
                target.hidden = !showmore ? true : false;
                !showmore ? target.style.removeProperty('height') : null;
                target.style.removeProperty('padding-top');
                target.style.removeProperty('padding-bottom');
                target.style.removeProperty('margin-top');
                target.style.removeProperty('margin-bottom');
                !showmore ? target.style.removeProperty('overflow') : null;
                target.style.removeProperty('transition-duration');
                target.style.removeProperty('transition-property');
                target.classList.remove('_slide');
            }, duration);
        }
    }
    let _slideDown = (target, duration = 500, showmore = 0) => {
        if (!target.classList.contains('_slide')) {
            target.classList.add('_slide');
            target.hidden = target.hidden ? false : null;
            showmore ? target.style.removeProperty('height') : null;
            let height = target.offsetHeight;
            target.style.overflow = 'hidden';
            target.style.height = showmore ? `${showmore}px` : '0px';
            target.style.paddingTop = 0;
            target.style.paddingBottom = 0;
            target.style.marginTop = 0;
            target.style.marginBottom = 0;
            target.offsetHeight;
            target.style.transitionProperty = 'height, margin, padding';
            target.style.transitionDuration = duration + 'ms';
            target.style.height = height + 'px';
            target.style.removeProperty('padding-top');
            target.style.removeProperty('padding-bottom');
            target.style.removeProperty('margin-top');
            target.style.removeProperty('margin-bottom');        
            
            window.setTimeout(() => {
                target.style.removeProperty('height');            
                target.style.removeProperty('overflow');
                target.style.removeProperty('transition-duration');
                target.style.removeProperty('transition-property');
                target.classList.remove('_slide');
            }, duration);
        }
    }
    let _slideToggle = (target, duration = 500) => {
        if (target.hidden) {
            return _slideDown(target, duration);
        } else {
            return _slideUp(target, duration);
        }
    }
}



export function menuInit() {
    let iconMenu = document.querySelector(".icon-menu");
    if (iconMenu) {
        // const menuBody = document.querySelector(".menu__body");
        iconMenu.addEventListener("click", function(e) {
            document.body.classList.toggle('_lock');
            iconMenu.classList.toggle('icon-menu_menu-open');
            document.documentElement.classList.toggle('menu-open');
            if (document.documentElement.classList.contains('catalog-open')) {
                document.documentElement.classList.remove('catalog-open');
            }
            if (document.documentElement.classList.contains('sub-menu-open')) {
                document.documentElement.classList.remove('sub-menu-open');
            }
        });
    }
}

export function initPopups() {
    const popupLinks = document.querySelectorAll('[data-popup]');
    const body = document.querySelector('body');
    const lockPadding = document.querySelectorAll('.lock-padding');

    let unlock = true;

    const timeout = 800;

    if (popupLinks.length > 0) {
        for (let i = 0; i < popupLinks.length; i++) {
            const popupLink = popupLinks[i];
            popupLink.addEventListener('click', function (e) {
                const popupName = popupLink.dataset.popup.replace('#', '');
                const currentPopup = document.getElementById(popupName);
                popupOpen(currentPopup);
                e.preventDefault();
            })
        }
    }

    const popupCloseIcon = document.querySelectorAll('.popup__close');
    if ( popupCloseIcon.length > 0 ) {
        for (let i = 0; i < popupCloseIcon.length; i++) {
            const el = popupCloseIcon[i];
            el.addEventListener('click', function(e) {
                popupClose(el.closest('.popup'));
                e.preventDefault();
            });
        }
    }
    function popupOpen(currentPopup) {
        if (currentPopup && unlock) {
            const popupActive = document.querySelector('.popup-open');
            if (popupActive) {
                popupClose(popupActive, false)
            } else {
                bodyLock();
            }
            currentPopup.classList.add('open');
            currentPopup.addEventListener('click', function(e) {
                if (!e.target.closest('.popup__content')) {
                    popupClose(e.target.closest('.popup'));
                }
            });
        }
    }
    function popupClose(popupActive, doUnlock = true) {
        if (unlock) {
            popupActive.classList.remove('open');
            if (doUnlock) {
                bodyUnLock();
            }
        }
    }

    function bodyLock() {
        const lockPaddingValue = window.innerWidth - document.querySelector('.popup__wrapper').offsetWidth + 'px';

        if (lockPadding.length > 0) {
            for (let i = 0; i < lockPadding.length; i++) {
                const el = lockPadding[i];
                el.style.paddingRight = lockPaddingValue;
            }  
        }      
        body.style.paddingRight = lockPaddingValue
        body.classList.add('_lock');

        unlock = false;
        setTimeout(function () {
            unlock = true;
        }, timeout);
    }

    function bodyUnLock() {
        setTimeout(function () {
            if (lockPadding.length > 0) {
                for (let i = 0; i < lockPadding.length; i++) {
                    const el = lockPadding[i];
                    el.style.paddingRight = '0px';
                }
            }
            body.style.paddingRight = '0px';
            body.classList.remove('_lock');
        }, timeout);
        unlock = false;
        setTimeout(function () {
            unlock = true;
        }, timeout);
    }

    document.addEventListener('keydown', function(e) {
        if (e.which === 27) {
            const popupActive = document.querySelector('.popup.open')
            popupClose(popupActive);
        }
    });

    (function () {
        // проверяем поддержку
        if (!Element.prototype.closest) {
            // релизуем
            Element.prototype.closest = function(css) {
                var node = this;
                while (node) {
                    if (node.matches(css)) return node;
                    else node = node.parentElement;
                }
            }
        }
    })();
    (function() {
        // проверяем поддержку
        if (!Element.prototype.matches) {
            // оределяем свойство
            Element.prototype.matches = Element.prototype.matchesSelector ||
                                        Element.prototype.webkitMatchesSelector ||
                                        Element.prototype.mozMatchesSelector ||
                                        Element.prototype.msMatchesSelector;
        }
    })();
}