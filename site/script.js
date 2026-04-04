document.addEventListener('DOMContentLoaded', function () {
    // Состояние квиза
    const state = {
        currentStep: 1,
        answers: {
            room_type: '',
            zones: [],
            area: 60,
            style: '',
            budget: '',
            name: '',
            phone: '',
            email: '',
            comment: ''
        },
        isSubmitting: false // Флаг для предотвращения двойной отправки
    };

    // DOM Elements
    const steps = {
        1: document.getElementById('step1'),
        2: document.getElementById('step2'),
        3: document.getElementById('step3'),
        4: document.getElementById('step4'),
        5: document.getElementById('step5'),
        6: document.getElementById('step6')
    };
    const thankYouScreen = document.getElementById('thankYouScreen');
    const progressBarFill = document.getElementById('progressBarFill');
    const progressText = document.getElementById('progressText');

    // --- Утилиты ---
    function updateProgressBar() {
        const percentage = ((state.currentStep - 1) / (Object.keys(steps).length - 1)) * 100;
        progressBarFill.style.width = `${percentage}%`;
        progressText.textContent = `Шаг ${state.currentStep} из ${Object.keys(steps).length}`;
    }

    function goToStep(stepNum) {
    // Скрываем все шаги
    Object.values(steps).forEach(step => step.classList.remove('active'));
    // Показываем нужный
    if (steps[stepNum]) {
        steps[stepNum].classList.add('active');
    } else if (stepNum === 'thankYou') {
        thankYouScreen.style.display = 'block';
        // Отправляем данные
        submitData();
        // Не обновляем прогресс-бар для 'thankYou'
        // Скрываем прогресс-бар на экране "Спасибо"
        document.querySelector('.progress-container').style.display = 'none';
        state.currentStep = stepNum; // Устанавливаем текущий шаг
        return; // Выходим из функции, чтобы не выполнить updateProgressBar ниже
    }
    state.currentStep = stepNum;
    // Обновляем прогресс-бар только если это не 'thankYou'
    // (хотя с return выше эта строка не выполнится для 'thankYou', но на всякий случай)
    if (stepNum !== 'thankYou') {
        updateProgressBar();
    }
}

    function showError(elementId) {
        const el = document.getElementById(elementId);
        if (el) el.style.display = 'block';
    }

    function hideError(elementId) {
        const el = document.getElementById(elementId);
        if (el) el.style.display = 'none';
    }

    // --- Валидация ---
    function validateStep(stepNum) {
        let isValid = true;

        switch (stepNum) {
            case 1:
                if (!state.answers.room_type) {
                    showError('error-step1');
                    isValid = false;
                } else {
                    hideError('error-step1');
                }
                break;
            case 2:
                if (state.answers.zones.length === 0) {
                    showError('error-step2');
                    isValid = false;
                } else {
                    hideError('error-step2');
                }
                break;
            case 4:
                if (!state.answers.style) {
                    showError('error-step4');
                    isValid = false;
                } else {
                    hideError('error-step4');
                }
                break;
            case 5:
                if (!state.answers.budget) {
                    showError('error-step5');
                    isValid = false;
                } else {
                    hideError('error-step5');
                }
                break;
            case 6:
                const phoneInput = document.getElementById('phone');
                const consentCheckbox = document.getElementById('consent');
                const phoneRegex = /^(\+7|8)[\s-]?\(?[\d]{3}\)?[\s-]?[\d]{3}[\s-]?[\d]{2}[\s-]?[\d]{2}$/;

                if (!phoneRegex.test(phoneInput.value)) {
                    showError('error-phone');
                    isValid = false;
                } else {
                    hideError('error-phone');
                }

                if (!consentCheckbox.checked) {
                    showError('error-consent');
                    isValid = false;
                } else {
                    hideError('error-consent');
                }
                break;
        }
        return isValid;
    }

    // --- Обработчики событий ---
    // Шаг 1: Одиночный выбор
    document.querySelectorAll('#step1 .single-choice').forEach(card => {
        card.addEventListener('click', function() {
            // Снимаем выделение со всех карточек
            document.querySelectorAll('#step1 .single-choice').forEach(c => c.classList.remove('selected'));
            // Выделяем текущую
            this.classList.add('selected');
            // Сохраняем значение
            state.answers.room_type = this.getAttribute('data-value');
            // Валидируем и обновляем кнопку
            const nextButton = document.getElementById('nextToStep2');
            if (validateStep(1)) { // Вызов validateStep обновляет ошибки и возвращает true/false
                nextButton.disabled = false;
            } else {
                nextButton.disabled = true; // На всякий случай, если снова кликнули на другую и снова стало невалидно
            }
        });
    });

    // Шаг 2: Множественный выбор (обновлённая логика для div-ов)
    // Теперь слушаем клики на div-ах с классом .multiple внутри #step2
    document.querySelectorAll('#step2 .option-card.multiple').forEach(card => {
        card.addEventListener('click', function() {
            const value = this.getAttribute('data-value'); // Получаем значение из data-value
            const isSelected = this.classList.contains('selected');

            if (isSelected) {
                // Если уже выбрана, убираем из массива и снимаем класс
                state.answers.zones = state.answers.zones.filter(zone => zone !== value);
                this.classList.remove('selected');
            } else {
                // Если не выбрана, добавляем в массив и ставим класс
                state.answers.zones.push(value);
                this.classList.add('selected');
            }

            // Валидируем и обновляем кнопку "Далее"
            const nextButton = document.getElementById('nextToStep3');
            if (state.answers.zones.length > 0) {
                hideError('error-step2');
                nextButton.disabled = false;
            } else {
                showError('error-step2');
                nextButton.disabled = true;
            }
        });
    });

    // Функция для восстановления состояния множественного выбора при возврате на шаг 2
    function restoreMultiSelectState(zones) {
        document.querySelectorAll('#step2 .option-card.multiple').forEach(card => {
            const value = card.getAttribute('data-value');
            if (zones.includes(value)) {
                card.classList.add('selected'); // Выделяем карточку, если её значение есть в сохранённом списке
            } else {
                card.classList.remove('selected'); // Снимаем выделение, если нет
            }
        });
        // Также обновить состояние кнопки при восстановлении
        const nextButton = document.getElementById('nextToStep3');
        if (state.answers.zones.length > 0) {
            hideError('error-step2');
            nextButton.disabled = false;
        } else {
            showError('error-step2');
            nextButton.disabled = true;
        }
    }

    // Шаг 3: Ползунок
    const slider = document.getElementById('areaSlider');
    const areaValueDisplay = document.getElementById('areaValue');
    slider.addEventListener('input', function() {
        state.answers.area = parseInt(this.value);
        areaValueDisplay.textContent = state.answers.area + ' м²';
    });

    // Шаг 4: Одиночный выбор
    document.querySelectorAll('#step4 .single-choice').forEach(card => {
        card.addEventListener('click', function() {
            document.querySelectorAll('#step4 .single-choice').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            state.answers.style = this.getAttribute('data-value');
            const nextButton = document.getElementById('nextToStep5');
            if (validateStep(4)) {
                nextButton.disabled = false;
            } else {
                nextButton.disabled = true;
            }
        });
    });

    // Шаг 5: Одиночный выбор
    document.querySelectorAll('#step5 .single-choice').forEach(card => {
        card.addEventListener('click', function() {
            document.querySelectorAll('#step5 .single-choice').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            state.answers.budget = this.getAttribute('data-value');
            const nextButton = document.getElementById('nextToStep6');
            if (validateStep(5)) {
                nextButton.disabled = false;
            } else {
                nextButton.disabled = true;
            }
        });
    });

    // Восстановление состояния для одиночного выбора
    function restoreSingleSelectState(selector, value) {
        document.querySelectorAll(selector).forEach(card => {
            card.classList.toggle('selected', card.getAttribute('data-value') === value);
        });
    }

    // Восстановление состояния при показе шага (например, при возврате)
    steps[2].addEventListener('click', function(e) {
         if(e.target.closest('.option-card.multiple')) return; // Не срабатывать на клик по карточке при восстановлении
         restoreMultiSelectState(state.answers.zones);
    }, true);

    steps[1].addEventListener('click', function(e) {
         if(e.target.closest('.single-choice')) return;
         restoreSingleSelectState('#step1 .single-choice', state.answers.room_type);
         // Также обновить состояние кнопки при восстановлении
         const nextButton = document.getElementById('nextToStep2');
         if (state.answers.room_type) {
             hideError('error-step1');
             nextButton.disabled = false;
         } else {
             showError('error-step1');
             nextButton.disabled = true;
         }
    }, true);

    steps[4].addEventListener('click', function(e) {
         if(e.target.closest('.single-choice')) return;
         restoreSingleSelectState('#step4 .single-choice', state.answers.style);
         const nextButton = document.getElementById('nextToStep5');
         if (state.answers.style) {
             hideError('error-step4');
             nextButton.disabled = false;
         } else {
             showError('error-step4');
             nextButton.disabled = true;
         }
    }, true);

    steps[5].addEventListener('click', function(e) {
         if(e.target.closest('.single-choice')) return;
         restoreSingleSelectState('#step5 .single-choice', state.answers.budget);
         const nextButton = document.getElementById('nextToStep6');
         if (state.answers.budget) {
             hideError('error-step5');
             nextButton.disabled = false;
         } else {
             showError('error-step5');
             nextButton.disabled = true;
         }
    }, true);


    // Форма финального шага
    document.getElementById('name').addEventListener('input', function() {
        state.answers.name = this.value.trim();
    });
    document.getElementById('phone').addEventListener('input', function() {
        state.answers.phone = this.value.trim();
        // Скрыть ошибку при вводе
        if (validateStep(6)) {
            hideError('error-phone');
        }
    });
    document.getElementById('email').addEventListener('input', function() {
        state.answers.email = this.value.trim();
    });
    document.getElementById('comment').addEventListener('input', function() {
        state.answers.comment = this.value.trim();
    });
    document.getElementById('consent').addEventListener('change', function() {
        // Скрыть ошибку при изменении
        if (this.checked) {
            hideError('error-consent');
        }
    });


    // Навигация - теперь кнопки просто переходят, валидация происходит в обработчиках выбора
    document.getElementById('nextToStep2').addEventListener('click', function() {
        if (validateStep(1)) { // Проверка на всякий случай, если как-то обойти UI
            goToStep(2);
        }
    });

    document.getElementById('backToStep1').addEventListener('click', function() {
        goToStep(1);
    });

    document.getElementById('nextToStep3').addEventListener('click', function() {
        if (validateStep(2)) {
            goToStep(3);
        }
    });

    document.getElementById('backToStep2').addEventListener('click', function() {
        goToStep(2);
    });

    document.getElementById('nextToStep4').addEventListener('click', function() {
        goToStep(4);
    });

    document.getElementById('backToStep3').addEventListener('click', function() {
        goToStep(3);
    });

    document.getElementById('nextToStep5').addEventListener('click', function() {
        if (validateStep(4)) {
            goToStep(5);
        }
    });

    document.getElementById('backToStep4').addEventListener('click', function() {
        goToStep(4);
    });

    document.getElementById('nextToStep6').addEventListener('click', function() {
        if (validateStep(5)) {
            goToStep(6);
        }
    });

    document.getElementById('backToStep5').addEventListener('click', function() {
        goToStep(5);
    });

    document.getElementById('submitBtn').addEventListener('click', function(e) {
        e.preventDefault(); // Предотвращаем стандартное поведение формы
        if (validateStep(6) && !state.isSubmitting) {
            state.isSubmitting = true; // Блокируем повторный клик
            this.disabled = true;
            this.textContent = 'Отправка...';
            goToStep('thankYou');
        }
    });

    // Отправка данных (для демонстрации в консоль)
    function submitData() {
        // Собираем все данные
        const formData = new FormData();
        Object.keys(state.answers).forEach(key => {
            if (Array.isArray(state.answers[key])) {
                state.answers[key].forEach(val => formData.append(key, val));
            } else {
                formData.append(key, state.answers[key]);
            }
        });
        // Добавляем метаданные
        state.answers.page_url = window.location.href;
        state.answers.timestamp = new Date().toISOString();

        console.log("Данные для отправки:", state.answers);


        setTimeout(() => {
            // Разблокируем кнопку после "отправки"
            state.isSubmitting = false;
            const btn = document.getElementById('submitBtn');
            if(btn) {
                btn.disabled = false;
                btn.textContent = 'Получить консультацию';
            }
        }, 500);
    }


    // Инициализация
    updateProgressBar();
}); 