document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input');
    const cameraBtn = document.getElementById('camera-btn');
    const captureBtn = document.getElementById('capture-btn');
    const analyzeBtn = document.getElementById('analyze-btn');
    const resetBtn = document.getElementById('reset-btn');

    const cameraContainer = document.getElementById('camera-container');
    const previewContainer = document.getElementById('preview-container');
    const video = document.getElementById('video');
    const imagePreview = document.getElementById('image-preview');
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');

    let stream = null;
    let capturedBlob = null;

    // File Upload
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                imagePreview.src = event.target.result;
                previewContainer.classList.remove('hidden');
                cameraContainer.classList.add('hidden');
                capturedBlob = file;
            };
            reader.readAsDataURL(file);
        }
    });

    // Camera Access
    cameraBtn.addEventListener('click', async () => {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
            cameraContainer.classList.remove('hidden');
            previewContainer.classList.add('hidden');
        } catch (err) {
            alert('Could not access camera: ' + err.message);
        }
    });

    // Capture Photo
    captureBtn.addEventListener('click', () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);

        canvas.toBlob((blob) => {
            capturedBlob = blob;
            imagePreview.src = URL.createObjectURL(blob);
            previewContainer.classList.remove('hidden');
            cameraContainer.classList.add('hidden');

            // Stop camera stream
            stream.getTracks().forEach(track => track.stop());
        }, 'image/jpeg');
    });

    // Analyze Skin
    analyzeBtn.addEventListener('click', async () => {
        if (!capturedBlob) return;

        const formData = new FormData();
        formData.append('image', capturedBlob, 'skin.jpg');

        previewContainer.classList.add('hidden');
        loading.classList.remove('hidden');
        results.classList.add('hidden');

        try {
            const response = await fetch('/analyze', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (data.error) throw new Error(data.error);

            displayResults(data);
        } catch (err) {
            alert('Analysis failed: ' + err.message);
        } finally {
            loading.classList.add('hidden');
        }
    });

    function displayResults(data) {
        document.getElementById('res-skin-type').textContent = data.skin_type;
        document.getElementById('res-conditions').textContent = data.conditions.join(', ');

        const confidencePercent = Math.round(data.confidence * 100);
        document.getElementById('res-confidence').textContent = confidencePercent + '%';
        document.getElementById('confidence-fill').style.width = confidencePercent + '%';

        // Dynamic Tips
        const tips = getTips(data.skin_type, data.conditions);
        document.getElementById('res-tips').textContent = tips;

        results.classList.remove('hidden');
    }

    function getTips(type, conditions) {
        const typeTips = {
            'Oily': 'Use a foaming cleanser and oil-free moisturizer. Try salicylic acid.',
            'Dry': 'Use a gentle cream cleanser and hyaluronic acid. Moisturize heavily.',
            'Normal': 'Maintain with a balanced routine. Use SPF daily.',
            'Combination': 'Use a gentle cleanser. Apply targeted treatments to oily areas.',
            'Sensitive': 'Avoid fragrances and harsh chemicals. Use soothing aloe or centella.'
        };

        let tip = typeTips[type] || 'Consult a dermatologist for a personalized plan.';

        if (conditions.includes('Acne') || conditions.includes('Pimples')) {
            tip += ' Focus on acne-fighting ingredients like Benzoyl Peroxide.';
        } else if (conditions.includes('Wrinkles')) {
            tip += ' Consider adding Retinol to your nightly routine.';
        } else if (conditions.includes('Dark Spots')) {
            tip += ' Use Vitamin C serum and daily sunscreen to fade spots.';
        }

        return tip;
    }

    resetBtn.addEventListener('click', () => {
        results.classList.add('hidden');
        previewContainer.classList.add('hidden');
        fileInput.value = '';
    });
});
