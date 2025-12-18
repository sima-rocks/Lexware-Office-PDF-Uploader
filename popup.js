document.addEventListener('DOMContentLoaded', () => {
    const buttonContainer = document.getElementById('buttonContainer');
    const statusDiv = document.getElementById('status');
    let currentPdfUrl = null;

    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        if (tabs[0] && tabs[0].url && tabs[0].url.toLowerCase().endsWith('.pdf')) {
            currentPdfUrl = tabs[0].url;
        }
        loadProfiles();
    });

    function loadProfiles() {
        chrome.storage.sync.get({ profiles: [] }, (data) => {
            const profiles = data.profiles;

            if (profiles.length === 0) {
                statusDiv.innerHTML = 'Keine Profile konfiguriert. Bitte <a href="options.html" target="_blank">Einstellungen öffnen</a>.';
                return;
            }

            chrome.storage.local.get({ uploadHistory: {} }, (historyData) => {
                const uploadHistory = historyData.uploadHistory;

                profiles.forEach(profile => {
                    const button = document.createElement('button');
                    const profileHistory = uploadHistory[profile.name] || [];
                    const alreadyUploaded = currentPdfUrl && profileHistory.includes(currentPdfUrl);

                    button.textContent = alreadyUploaded
                        ? `Erneut hochladen zu ${profile.name}`
                        : `Hochladen zu ${profile.name}`;

                    button.addEventListener('click', () => {
                        handleUpload(profile, alreadyUploaded);
                    });
                    buttonContainer.appendChild(button);
                });
            });
        });
    }

    function handleUpload(profile, forceUpload) {
        document.querySelectorAll('button').forEach(btn => btn.disabled = true);
        statusDiv.textContent = 'Wird hochgeladen...';
        statusDiv.className = '';

        chrome.runtime.sendMessage(
            {
                type: 'UPLOAD_PDF',
                payload: {
                    apiKey: profile.apiKey,
                    profileName: profile.name,
                    forceUpload: forceUpload
                }
            },
            (response) => {
                if (chrome.runtime.lastError) {
                    statusDiv.textContent = `Fehler: ${chrome.runtime.lastError.message}`;
                    statusDiv.className = 'error';
                } else if (response) {
                    if (response.success) {
                        statusDiv.textContent = response.message;
                        statusDiv.className = 'success';
                    } else {
                        statusDiv.textContent = `Fehler: ${response.message}`;
                        statusDiv.className = 'error';
                    }
                }

                if (!response || !response.success) {
                    setTimeout(() => {
                        document.querySelectorAll('button').forEach(btn => btn.disabled = false);
                    }, 2000);
                }
            }
        );
    }
});
