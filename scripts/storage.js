/**
 * Save Object scraping in localstorage.
 */
export function saveObjectInLocalStorage(key, newData = null) {
    return new Promise((resolve) => {
        chrome.storage.local.get(key, (result) => {
            let data = result[key],
                finalData = [];

            if (!data) {
                finalData = newData ? newData : [];
            } else {
                finalData = [...data, ...newData];
            }

            chrome.storage.local.set({ [key]: finalData }, () => {
            resolve();
            });
        });
    });
}

/**
 * Reset object scraping in localstorage.
 */
export function resetObjectInLocalStorage(key) {
    return new Promise((resolve) => {
        chrome.storage.local.remove(key, () => {
            resolve();
        });        
    });    
}

/**
 * Get object scraping in localstorage.
 */
export function getObjectInLocalStorage(key) {
    return new Promise((resolve) => {
        chrome.storage.local.get(key, (result) => {            
            resolve(result[key]);
        });
    });
}