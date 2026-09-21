/*
 * Демонстрационный обработчик формы обратной связи.
 *
 * Сайт статический и размещён на GitHub Pages, backend'а у него нет.
 * Скрипт показывает форму (в разметке она отдаётся скрытой), проверяет
 * обязательные поля и после отправки выводит то же сообщение об успехе,
 * что показывал WordPress. Данные никуда не передаются.
 *
 * Кнопка отправки заблокирована, пока не отмечено согласие на обработку
 * персональных данных.
 */
(function () {
	'use strict';

	var SUCCESS_NOTICE = 'Ваша заявка успешно отправлена!';

	function fieldOf(input) {
		return input.closest('.guten-form-input');
	}

	function consentBox(form) {
		return form.querySelector('.gutenverse-input-checkbox');
	}

	function submitButton(form) {
		return form.querySelector('.gutenverse-input-submit');
	}

	function isFilled(input) {
		if (input.type === 'checkbox') {
			return input.checked;
		}
		return input.value.trim() !== '';
	}

	function isValid(input) {
		if (!isFilled(input)) {
			return false;
		}
		return input.type !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
	}

	// Без согласия отправлять нечего — блокируем кнопку, чтобы это было видно сразу.
	function syncSubmitState(form) {
		var consent = consentBox(form);
		var button = submitButton(form);

		if (!button) {
			return;
		}

		var allowed = !consent || consent.checked;

		button.disabled = !allowed;
		button.setAttribute('aria-disabled', String(!allowed));

		if (allowed) {
			button.removeAttribute('title');
		} else {
			button.title = 'Отметьте согласие на обработку персональных данных';
		}
	}

	function validate(form) {
		var ok = true;

		form.querySelectorAll('.guten-form-input').forEach(function (field) {
			var input = field.querySelector('input:not([hidden]), textarea');
			var required = field.querySelector('.required-badge') !== null;

			if (!input || !required) {
				return;
			}

			if (isValid(input)) {
				field.classList.remove('input-invalid');
			} else {
				field.classList.add('input-invalid');
				ok = false;
			}
		});

		return ok;
	}

	function notify(form, message) {
		var slot = form.querySelector('.guten-submit-wrapper .form-notification');

		if (!slot) {
			return;
		}

		slot.innerHTML = '<div class="notification-body guten-success">' + message + '</div>';
	}

	function reset(form) {
		form.reset();
		form.querySelectorAll('.input-invalid').forEach(function (field) {
			field.classList.remove('input-invalid');
		});
		// form.reset() снимает галочку согласия — кнопку нужно заблокировать снова.
		syncSubmitState(form);
	}

	function init(form) {
		// Разметка приходит с инлайновым display:none — раскрываем форму.
		form.removeAttribute('style');
		syncSubmitState(form);

		form.addEventListener('submit', function (event) {
			event.preventDefault();

			var consent = consentBox(form);

			if (consent && !consent.checked) {
				fieldOf(consent).classList.add('input-invalid');
				return;
			}

			if (!validate(form)) {
				return;
			}

			var button = submitButton(form);

			if (button) {
				button.disabled = true;
			}

			// Небольшая пауза, чтобы отправка ощущалась как настоящая.
			window.setTimeout(function () {
				notify(form, SUCCESS_NOTICE);
				reset(form);
			}, 600);
		});

		// Убираем подсветку ошибки, как только поле поправили.
		form.addEventListener('input', function (event) {
			var field = fieldOf(event.target);

			if (field && field.classList.contains('input-invalid') && isValid(event.target)) {
				field.classList.remove('input-invalid');
			}
		});

		form.addEventListener('change', function (event) {
			if (event.target.type !== 'checkbox') {
				return;
			}

			var field = fieldOf(event.target);

			if (field && event.target.checked) {
				field.classList.remove('input-invalid');
			}

			syncSubmitState(form);
		});
	}

	document.querySelectorAll('form.guten-form-builder').forEach(init);
})();
