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
    Object.values(steps).forEach(step => step.classList.remove('active'));
    if (steps[stepNum]) {
        steps[stepNum].classList.add('active');
    } else if (stepNum === 'thankYou') {
        thankYouScreen.style.display = 'block';
        submitData();
        document.querySelector('.progress-container').style.display = 'none';
        state.currentStep = stepNum;
        return; 
    }
    state.currentStep = stepNum;
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
    slider.addEventListener('input', function() {
        state.answers.area = parseInt(this.value);
        areaValueDisplay.textContent = state.answers.area + ' м²';
    });

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

    // Восстановление состояния для одиночного выбора
    function restoreSingleSelectState(selector, value) {
        document.querySelectorAll(selector).forEach(card => {
            card.classList.toggle('selected', card.getAttribute('data-value') === value);
        });
    }

    steps[2].addEventListener('click', function(e) {
         if(e.target.closest('.option-card.multiple')) return; 
         restoreMultiSelectState(state.answers.zones);
    }, true);

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

    document.getElementById('backToHome')?.addEventListener('click', function() {
    window.location.href = 'index.html';
});
    document.getElementById('name').addEventListener('input', function() {
        state.answers.name = this.value.trim();
    });
    document.getElementById('phone').addEventListener('input', function() {
        state.answers.phone = this.value.trim();
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
        if (this.checked) {
            hideError('error-consent');
        }
    });

    document.getElementById('nextToStep2').addEventListener('click', function() {
        if (validateStep(1)) {
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
        e.preventDefault(); 
        if (validateStep(6) && !state.isSubmitting) {
            state.isSubmitting = true; 
            this.disabled = true;
            this.textContent = 'Отправка...';
            goToStep('thankYou');
        }
    });

    function submitData() {
        const formData = new FormData();
        Object.keys(state.answers).forEach(key => {
            if (Array.isArray(state.answers[key])) {
                state.answers[key].forEach(val => formData.append(key, val));
            } else {
                formData.append(key, state.answers[key]);
            }
        });
        state.answers.page_url = window.location.href;
        state.answers.timestamp = new Date().toISOString();

        console.log("Данные для отправки:", state.answers);


        setTimeout(() => {
            state.isSubmitting = false;
            const btn = document.getElementById('submitBtn');
            if(btn) {
                btn.disabled = false;
                btn.textContent = 'Получить консультацию';
            }
        }, 500);
    }

    updateProgressBar();
}); 