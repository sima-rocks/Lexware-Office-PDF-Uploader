document.addEventListener('DOMContentLoaded', () => {
    const profilesList = document.getElementById('profilesList');
    const profileNameInput = document.getElementById('profileName');
    const apiKeyInput = document.getElementById('apiKey');
    const addProfileButton = document.getElementById('addProfile');
    const statusDiv = document.getElementById('status');

    function renderProfiles(profiles = []) {
        profilesList.innerHTML = '';

        if (profiles.length === 0) {
            profilesList.innerHTML = '<p style="color: #999;">Noch keine Profile gespeichert.</p>';
            return;
        }

        profiles.forEach((profile, index) => {
            const profileDiv = document.createElement('div');
            profileDiv.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 12px; background-color: #f9f9f9; border-radius: 4px; margin-bottom: 8px;';

            const nameSpan = document.createElement('span');
            nameSpan.style.fontWeight = '600';
            nameSpan.textContent = profile.name;

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Löschen';
            deleteButton.className = 'secondary';
            deleteButton.style.width = 'auto';
            deleteButton.style.marginBottom = '0';
            deleteButton.style.padding = '6px 12px';
            deleteButton.addEventListener('click', () => {
                if (confirm(`Möchten Sie das Profil "${profile.name}" wirklich löschen?`)) {
                    deleteProfile(index);
                }
            });

            profileDiv.appendChild(nameSpan);
            profileDiv.appendChild(deleteButton);
            profilesList.appendChild(profileDiv);
        });
    }

    function loadProfiles() {
        chrome.storage.sync.get({ profiles: [] }, (data) => {
            renderProfiles(data.profiles);
        });
    }

    addProfileButton.addEventListener('click', () => {
        const name = profileNameInput.value.trim();
        const apiKey = apiKeyInput.value.trim();

        if (!name || !apiKey) {
            showStatus('Bitte füllen Sie alle Felder aus.', 'error');
            return;
        }

        chrome.storage.sync.get({ profiles: [] }, (data) => {
            const profiles = data.profiles;
            if (profiles.some(p => p.name === name)) {
                showStatus('Ein Profil mit diesem Namen existiert bereits.', 'error');
                return;
            }
            profiles.push({ name, apiKey });
            chrome.storage.sync.set({ profiles }, () => {
                profileNameInput.value = '';
                apiKeyInput.value = '';
                showStatus('Profil erfolgreich hinzugefügt!', 'success');
                loadProfiles();
            });
        });
    });

    function deleteProfile(index) {
        chrome.storage.sync.get({ profiles: [] }, (data) => {
            const profiles = data.profiles;
            profiles.splice(index, 1);
            chrome.storage.sync.set({ profiles }, () => {
                showStatus('Profil gelöscht.', 'success');
                loadProfiles();
            });
        });
    }

    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = type;
        setTimeout(() => {
            statusDiv.textContent = '';
            statusDiv.className = '';
        }, 3000);
    }

    loadProfiles();
});
