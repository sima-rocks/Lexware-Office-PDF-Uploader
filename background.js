chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'UPLOAD_PDF') {
        (async () => {
            try {
                const { apiKey, profileName, forceUpload } = request.payload;

                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                if (!tab || !tab.url) {
                    throw new Error("Aktiver Tab konnte nicht gefunden werden.");
                }

                const pdfUrl = tab.url;

                const pdfResponse = await fetch(pdfUrl);
                if (!pdfResponse.ok) {
                    throw new Error(`Datei konnte nicht geladen werden: ${pdfResponse.statusText}`);
                }

                const pdfBlob = await pdfResponse.blob();

                const isPdf = await isValidPdf(pdfResponse, pdfBlob);
                if (!isPdf) {
                    throw new Error("Die Seite ist keine PDF-Datei (weder laut Header noch Inhalt).");
                }

                await uploadFileForOcr(apiKey, pdfBlob, pdfUrl, forceUpload);

                // Upload-Historie aktualisieren
                chrome.storage.local.get({ uploadHistory: {} }, (data) => {
                    const uploadHistory = data.uploadHistory;

                    if (!uploadHistory[profileName]) {
                        uploadHistory[profileName] = [];
                    }

                    if (!uploadHistory[profileName].includes(pdfUrl)) {
                        uploadHistory[profileName].push(pdfUrl);

                        // Max. 100 Einträge pro Profil
                        if (uploadHistory[profileName].length > 100) {
                            uploadHistory[profileName].shift();
                        }

                        chrome.storage.local.set({ uploadHistory });
                    }
                });

                sendResponse({ success: true, message: `Erfolgreich zu ${profileName} hochgeladen!` });

            } catch (error) {
                console.error('LexOffice Upload Error:', error);
                sendResponse({ success: false, message: error.message });
            }
        })();

        return true; // async response
    }
});

/**
 * Prüft ob die Datei ein PDF ist (Content-Type oder Magic Bytes)
 */
async function isValidPdf(response, blob) {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.toLowerCase().includes('application/pdf')) {
        return true;
    }

    // Fallback: Magic Bytes prüfen (%PDF-)
    try {
        const headerSlice = blob.slice(0, 5);
        const text = await headerSlice.text();
        if (text.startsWith('%PDF-')) {
            return true;
        }
    } catch (e) {
        console.warn('Could not read blob for magic bytes check', e);
    }

    return false;
}

async function uploadFileForOcr(apiKey, pdfBlob, pdfUrl, forceUpload = false) {
    const url = 'https://api.lexware.io/v1/files';

    const formData = new FormData();
    let filename = 'invoice.pdf';

    // Dateiname aus URL extrahieren
    try {
        const urlObj = new URL(pdfUrl);
        const path = urlObj.pathname;
        if (path && path.lastIndexOf('/') !== -1) {
            const possibleName = path.substring(path.lastIndexOf('/') + 1);
            if (possibleName && possibleName.length > 0) {
                filename = possibleName;
            }
        }
    } catch (e) {
        // Default verwenden
    }

    if (!filename.toLowerCase().endsWith('.pdf')) {
        filename += '.pdf';
    }

    // Bei erneutem Upload: Timestamp anhängen
    if (forceUpload) {
        const timestamp = new Date().getTime();
        const extensionIndex = filename.lastIndexOf('.');
        if (extensionIndex !== -1) {
            filename = filename.substring(0, extensionIndex) + '_' + timestamp + filename.substring(extensionIndex);
        } else {
            filename = filename + '_' + timestamp + '.pdf';
        }
    }

    formData.append('file', pdfBlob, filename);
    formData.append('type', 'voucher');

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Accept': 'application/json'
        },
        body: formData
    });

    if (!response.ok) {
        let errorDetails = `Status: ${response.status} ${response.statusText}`;
        try {
            const errorData = await response.json();
            errorDetails += ` - Message: ${errorData.message || JSON.stringify(errorData)}`;
        } catch (e) {
            const textError = await response.text();
            errorDetails += ` - Response: ${textError}`;
        }
        throw new Error(`Datei-Upload fehlgeschlagen: ${errorDetails}`);
    }

    return await response.json();
}
