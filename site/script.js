document.addEventListener('DOMContentLoaded', function () {
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
        isSubmitting: false 
    };

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

    function updateProgressBar() {
        const percentage = ((state.currentStep - 1) / (Object.keys(steps).length - 1)) * 100;
        progressBarFill.style.width = `${percentage}%`;
        progressText.textContent = `Шаг ${state.currentStep} из ${Object.keys(steps).length}`;
    }

    function goToStep(stepNum) {
        if (stepNum === 'thankYou') {
            if (thankYouScreen) thankYouScreen.style.display = 'block';
            const progressContainer = document.querySelector('.progress-container');
            if (progressContainer) progressContainer.style.display = 'none';
            Object.values(steps).forEach(step => {
                if (step) step.classList.remove('active');
            });
            submitData();
            state.currentStep = 'thankYou';
            return;
        }

        Object.values(steps).forEach(step => {
            if (step) step.classList.remove('active');
        });

        if (steps[stepNum]) {
            steps[stepNum].classList.add('active');
        }

        state.currentStep = stepNum;
        updateProgressBar();
    }

    function showError(elementId) {
        const el = document.getElementById(elementId);
        if (el) el.style.display = 'block';
    }

    function hideError(elementId) {
        const el = document.getElementById(elementId);
        if (el) el.style.display = 'none';
    }

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

    document.querySelectorAll('#step1 .single-choice').forEach(card => {
        card.addEventListener('click', function() {
            document.querySelectorAll('#step1 .single-choice').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            state.answers.room_type = this.getAttribute('data-value');
            const nextButton = document.getElementById('nextToStep2');
            if (validateStep(1)) {
                nextButton.disabled = false;
            } else {
                nextButton.disabled = true;
            }
        });
    });

    document.querySelectorAll('#step2 .option-card.multiple').forEach(card => {
        card.addEventListener('click', function() {
            const value = this.getAttribute('data-value');
            const isSelected = this.classList.contains('selected');

            if (isSelected) {
                state.answers.zones = state.answers.zones.filter(zone => zone !== value);
                this.classList.remove('selected');
            } else {
                state.answers.zones.push(value);
                this.classList.add('selected');
            }

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

    function restoreMultiSelectState(zones) {
        document.querySelectorAll('#step2 .option-card.multiple').forEach(card => {
            const value = card.getAttribute('data-value');
            if (zones.includes(value)) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }
        });
        const nextButton = document.getElementById('nextToStep3');
        if (state.answers.zones.length > 0) {
            hideError('error-step2');
            nextButton.disabled = false;
        } else {
            showError('error-step2');
            nextButton.disabled = true;
        }
    }

    const slider = document.getElementById('areaSlider');
    const areaValueDisplay = document.getElementById('areaValue');
    if (slider && areaValueDisplay) {
        slider.addEventListener('input', function() {
            state.answers.area = parseInt(this.value);
            areaValueDisplay.textContent = state.answers.area + ' м²';
        });
    }

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

    function restoreSingleSelectState(selector, value) {
        document.querySelectorAll(selector).forEach(card => {
            card.classList.toggle('selected', card.getAttribute('data-value') === value);
        });
    }

    if (steps[2]) {
        steps[2].addEventListener('click', function(e) {
            if(e.target.closest('.option-card.multiple')) return;
            restoreMultiSelectState(state.answers.zones);
        }, true);
    }

    if (steps[1]) {
        steps[1].addEventListener('click', function(e) {
            if(e.target.closest('.single-choice')) return;
            restoreSingleSelectState('#step1 .single-choice', state.answers.room_type);
            const nextButton = document.getElementById('nextToStep2');
            if (state.answers.room_type) {
                hideError('error-step1');
                nextButton.disabled = false;
            } else {
                showError('error-step1');
                nextButton.disabled = true;
            }
        }, true);
    }

    if (steps[4]) {
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
    }

    if (steps[5]) {
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
    }

    const backToHome = document.getElementById('backToHome');
    if (backToHome) {
        backToHome.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    }

    const nameInput = document.getElementById('name');
    if (nameInput) {
        nameInput.addEventListener('input', function() {
            state.answers.name = this.value.trim();
        });
    }

    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            state.answers.phone = this.value.trim();
            if (validateStep(6)) {
                hideError('error-phone');
            }
        });
    }

    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            state.answers.email = this.value.trim();
        });
    }

    const commentInput = document.getElementById('comment');
    if (commentInput) {
        commentInput.addEventListener('input', function() {
            state.answers.comment = this.value.trim();
        });
    }

    const consentCheckbox = document.getElementById('consent');
    if (consentCheckbox) {
        consentCheckbox.addEventListener('change', function() {
            if (this.checked) {
                hideError('error-consent');
            }
        });
    }

    const nextToStep2 = document.getElementById('nextToStep2');
    if (nextToStep2) {
        nextToStep2.addEventListener('click', function() {
            if (validateStep(1)) {
                goToStep(2);
            }
        });
    }

    const backToStep1 = document.getElementById('backToStep1');
    if (backToStep1) {
        backToStep1.addEventListener('click', function() {
            goToStep(1);
        });
    }

    const nextToStep3 = document.getElementById('nextToStep3');
    if (nextToStep3) {
        nextToStep3.addEventListener('click', function() {
            if (validateStep(2)) {
                goToStep(3);
            }
        });
    }

    const backToStep2 = document.getElementById('backToStep2');
    if (backToStep2) {
        backToStep2.addEventListener('click', function() {
            goToStep(2);
        });
    }

    const nextToStep4 = document.getElementById('nextToStep4');
    if (nextToStep4) {
        nextToStep4.addEventListener('click', function() {
            goToStep(4);
        });
    }

    const backToStep3 = document.getElementById('backToStep3');
    if (backToStep3) {
        backToStep3.addEventListener('click', function() {
            goToStep(3);
        });
    }

    const nextToStep5 = document.getElementById('nextToStep5');
    if (nextToStep5) {
        nextToStep5.addEventListener('click', function() {
            if (validateStep(4)) {
                goToStep(5);
            }
        });
    }

    const backToStep4 = document.getElementById('backToStep4');
    if (backToStep4) {
        backToStep4.addEventListener('click', function() {
            goToStep(4);
        });
    }

    const nextToStep6 = document.getElementById('nextToStep6');
    if (nextToStep6) {
        nextToStep6.addEventListener('click', function() {
            if (validateStep(5)) {
                goToStep(6);
            }
        });
    }

    const backToStep5 = document.getElementById('backToStep5');
    if (backToStep5) {
        backToStep5.addEventListener('click', function() {
            goToStep(5);
        });
    }

    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (validateStep(6) && !state.isSubmitting) {
                state.isSubmitting = true;
                this.disabled = true;
                this.textContent = 'Отправка...';
                goToStep('thankYou');
            }
        });
    }

function submitData() {
    const quizData = {
        room_type: state.answers.room_type,
        zones: state.answers.zones,
        area: state.answers.area,
        style: state.answers.style,
        budget: state.answers.budget,
        name: state.answers.name || '',
        phone: state.answers.phone,
        email: state.answers.email || '',
        comment: state.answers.comment || '',
        consent_accepted: document.getElementById('consent') ? document.getElementById('consent').checked ? 1 : 0 : 1,
        page_url: window.location.href,
        timestamp: new Date().toISOString()
    };

    console.log("Отправка данных:", quizData);

    var scriptPath = '';
    var currentPath = window.location.pathname;
    var pathParts = currentPath.split('/');
    pathParts.pop(); // Удаляем имя файла
    scriptPath = pathParts.join('/') + '/';

    if (window.location.protocol === 'file:') {
        scriptPath = '';
    }

    var ajaxUrl = scriptPath + 'save_quiz_data.php';
    console.log("URL для AJAX:", ajaxUrl);

    fetch('http://localhost:8000/save_quiz_data.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(quizData),
    })
    .then(response => response.json())
    .then(data => {
        console.log("Ответ сервера:", data);
        if (data.success) {
            console.log("Заявка успешно сохранена! ID:", data.lead_id);
        } else {
            console.error("Ошибка от сервера:", data.message);
            alert("Произошла ошибка при отправке: " + data.message);
            goToStep(6);
            state.isSubmitting = false;
            const btn = document.getElementById('submitBtn');
            if(btn) {
                btn.disabled = false;
                btn.textContent = 'Получить консультацию';
            }
        }
    })
    .catch(error => {
        console.error("Ошибка сети:", error);
        alert("Произошла ошибка при отправке заявки. Пожалуйста, проверьте подключение к интернету и попробуйте ещё раз.");
        goToStep(6);
        state.isSubmitting = false;
        const btn = document.getElementById('submitBtn');
        if(btn) {
            btn.disabled = false;
            btn.textContent = 'Получить консультацию';
        }
    });
}

    updateProgressBar();
});