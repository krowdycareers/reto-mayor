const saveObjectInLocalStorage = async function (obj) {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.set(obj, function () {
                resolve();
            });
        } catch (ex) {
            reject(ex);
        }
    });
};
  
const gatObjectInLocalStorage = async function (key) {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.get(key, function (value) {
                const res = value.totalJobs ?? [];
                resolve(res);
            });
        } catch (ex) {
            reject(ex);
        }
    });
};

const removeObjectInLocalStorage = async (key) => {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.remove(key, function () {
                resolve();
            });
        } catch (ex) {
            reject(ex);
        }
    });
};


export {
    removeObjectInLocalStorage,
    gatObjectInLocalStorage,
    saveObjectInLocalStorage
}