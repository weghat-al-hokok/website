(function () {
    'use strict';

    const API_URL = 'https://script.google.com/macros/s/AKfycbxLqx0tReMbe1tbU0j-05h0dvEFFvMFASC5nD9QQxkhvwd4yG9g6t3LKjc7ncVVDeAz/exec';

    const elements = {
        form: document.getElementById('contactForm'),
        submitBtn: document.getElementById('cf-submit-btn'),
        btnText: document.querySelector('#cf-submit-btn .cf-btn-text'),
        btnLoading: document.querySelector('#cf-submit-btn .cf-btn-loading'),
        dropzone: document.getElementById('cf-dropzone'),
        fileInput: document.getElementById('cf-files'),
        fileList: document.getElementById('cf-file-list'),
        errorMsg: document.getElementById('cf-error-msg'),
        successMsg: document.getElementById('cf-success-msg'),
        successModal: document.getElementById('cf-success-modal'),
        modalCloseBtn: document.getElementById('cf-modal-close'),
        clientIdDisplay: document.getElementById('cf-client-id'),
        fields: {
            name: document.getElementById('cf-name'),
            phone: document.getElementById('cf-phone'),
            clientType: document.getElementById('cf-client-type'),
            caseType: document.getElementById('cf-case-type'),
            details: document.getElementById('cf-details')
        },
        errors: {
            name: document.getElementById('cf-name-error'),
            phone: document.getElementById('cf-phone-error'),
            clientType: document.getElementById('cf-client-type-error'),
            caseType: document.getElementById('cf-case-type-error'),
            details: document.getElementById('cf-details-error')
        }
    };

    let selectedFiles = [];

    // Helper functions
    const formatBytes = (bytes, decimals = 2) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    const getFileIcon = (type) => {
        if (type.startsWith('image/')) return 'fas fa-file-image';
        if (type === 'application/pdf') return 'fas fa-file-pdf';
        if (type.includes('word')) return 'fas fa-file-word';
        if (type.includes('excel') || type.includes('spreadsheet')) return 'fas fa-file-excel';
        if (type.includes('zip') || type.includes('compressed')) return 'fas fa-file-archive';
        return 'fas fa-file';
    };

    const renderFileList = () => {
        if (!elements.fileList) return;
        elements.fileList.innerHTML = '';
        selectedFiles.forEach((file, index) => {
            const item = document.createElement('div');
            item.className = 'cf-file-item';
            item.innerHTML = `
                <i class="${getFileIcon(file.type)} cf-file-icon"></i>
                <div class="cf-file-info">
                    <span class="cf-file-name">${file.name}</span>
                    <span class="cf-file-size">${formatBytes(file.size)}</span>
                </div>
                <button type="button" class="cf-file-remove" data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            elements.fileList.appendChild(item);
        });

        // Add event listeners to remove buttons
        document.querySelectorAll('.cf-file-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.getAttribute('data-index'), 10);
                selectedFiles.splice(index, 1);
                renderFileList();
            });
        });
    };

    const handleFiles = (files) => {
        Array.from(files).forEach(file => {
            selectedFiles.push(file);
        });
        renderFileList();
    };

    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve({
                name: file.name,
                type: file.type,
                data: reader.result.split(',')[1]
            });
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    };

    const showError = (message) => {
        if (elements.errorMsg) {
            elements.errorMsg.textContent = message;
            elements.errorMsg.style.display = 'block';
        } else {
            alert(message);
        }
    };

    const hideError = () => {
        if (elements.errorMsg) {
            elements.errorMsg.style.display = 'none';
        }
    };

    const setLoading = (isLoading) => {
        if (elements.submitBtn) elements.submitBtn.disabled = isLoading;
        if (elements.btnText) elements.btnText.style.display = isLoading ? 'none' : 'inline';
        if (elements.btnLoading) elements.btnLoading.style.display = isLoading ? 'inline' : 'none';
    };

    const validateForm = () => {
        let isValid = true;

        const setFieldError = (fieldKey, errorMsg) => {
            if (elements.fields[fieldKey]) elements.fields[fieldKey].classList.add('invalid');
            if (elements.errors[fieldKey]) {
                elements.errors[fieldKey].textContent = errorMsg;
                elements.errors[fieldKey].style.display = 'block';
            }
            isValid = false;
        };

        const clearFieldError = (fieldKey) => {
            if (elements.fields[fieldKey]) elements.fields[fieldKey].classList.remove('invalid');
            if (elements.errors[fieldKey]) {
                elements.errors[fieldKey].style.display = 'none';
            }
        };

        // Reset errors
        Object.keys(elements.fields).forEach(clearFieldError);

        // Name validation
        const nameVal = elements.fields.name?.value.trim();
        if (!nameVal || nameVal.length < 3) {
            setFieldError('name', 'الاسم مطلوب ويجب أن يكون 3 أحرف على الأقل');
        }

        // Phone validation
        const phoneVal = elements.fields.phone?.value.trim();
        const phoneRegex = /^(05\d{8}|\+9665\d{8})$/;
        if (!phoneVal || !phoneRegex.test(phoneVal)) {
            setFieldError('phone', 'رقم الجوال مطلوب ويجب أن يكون بصيغة صحيحة (مثال: 05xxxxxxxx أو +9665xxxxxxxx)');
        }

        // Client type validation
        if (!elements.fields.clientType?.value) {
            setFieldError('clientType', 'نوع العميل مطلوب');
        }

        // Case type validation
        if (!elements.fields.caseType?.value) {
            setFieldError('caseType', 'نوع القضية مطلوب');
        }

        // Details validation
        const detailsVal = elements.fields.details?.value.trim();
        if (!detailsVal || detailsVal.length < 10) {
            setFieldError('details', 'تفاصيل القضية مطلوبة ويجب أن تكون 10 أحرف على الأقل');
        }

        return isValid;
    };

    // Event Listeners
    if (elements.dropzone) {
        elements.dropzone.addEventListener('click', () => elements.fileInput?.click());
        elements.dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            elements.dropzone.classList.add('dragover');
        });
        elements.dropzone.addEventListener('dragleave', () => elements.dropzone.classList.remove('dragover'));
        elements.dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            elements.dropzone.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
        });
    }

    if (elements.fileInput) {
        elements.fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) handleFiles(e.target.files);
            e.target.value = ''; // Reset to allow selecting same files again
        });
    }

    // Real-time validation clear
    Object.keys(elements.fields).forEach(key => {
        const el = elements.fields[key];
        if (el) {
            el.addEventListener('input', () => {
                el.classList.remove('invalid');
                if (elements.errors[key]) elements.errors[key].style.display = 'none';
            });
            el.addEventListener('change', () => {
                el.classList.remove('invalid');
                if (elements.errors[key]) elements.errors[key].style.display = 'none';
            });
        }
    });

    if (elements.form) {
        elements.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideError();

            if (!validateForm()) return;

            setLoading(true);

            try {
                // Convert files
                const filePromises = selectedFiles.map(fileToBase64);
                const filesData = await Promise.all(filePromises);

                const payload = {
                    action: 'submitContactForm',
                    data: {
                        Full_Name: elements.fields.name.value.trim(),
                        Phone: elements.fields.phone.value.trim(),
                        Client_Type: elements.fields.clientType.value,
                        Case_Type: elements.fields.caseType.value,
                        Case_Description: elements.fields.details.value.trim(),
                        Source: 'Website',
                        files: filesData
                    }
                };

                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) throw new Error('Network response was not ok');

                const result = await response.json();

                if (result.success) {
                    if (elements.successModal) elements.successModal.style.display = 'flex';
                    if (elements.clientIdDisplay && result.data && result.data.clientId) {
                        elements.clientIdDisplay.textContent = result.data.clientId;
                    }
                    elements.form.reset();
                    selectedFiles = [];
                    renderFileList();
                } else {
                    if (result.errorCode === 'DUPLICATE_CLIENT') {
                        showError('تم تسجيل هذا العميل مسبقاً.');
                    } else {
                        showError(result.error || 'حدث خطأ أثناء إرسال البيانات. يرجى المحاولة مرة أخرى.');
                    }
                }

            } catch (error) {
                console.error('Error submitting form:', error);
                showError('حدث خطأ في الاتصال بالخادم');
            } finally {
                setLoading(false);
            }
        });
    }

    const closeModal = () => {
        if (elements.successModal) elements.successModal.style.display = 'none';
    };

    if (elements.modalCloseBtn) {
        elements.modalCloseBtn.addEventListener('click', closeModal);
    }

    if (elements.successModal) {
        elements.successModal.addEventListener('click', (e) => {
            if (e.target === elements.successModal) closeModal();
        });
    }

})();
