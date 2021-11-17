const indexedDB =
    window.indexedDB ||
    window.mozIndexedDB ||
    window.webkitIndexedDB ||
    window.msIndexedDB ||
    Window.shimIndexedDB;

let db;

const request = indexedDB.open("budget", 1);

request.onupgradeneeded = ({ target }) => {
    let db = target.result;
    db.createObjectStore("budgetObjStore", {autoIncrement:  true});
};

request.onsuccess = ({ target }) => {
    db = target.result;
    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror =function(event) {
    console.log("Uh on! " + event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(["budgetObjStore"], "readwrite");
    const store = transaction.objectStore("budgetObjStore");
    store.add(record);
}

function checkDatabase() {
    const transaction = db.transaction(["budgetObjStore"], "readwrite");
    const store = transaction.objectStore("budgetObjStore");
    const getAll = store.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch("api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    accept: "application/json, text/plain, */*",
                    "Content-Type":"application/json"
                }
                       
            })
            .then(response => {
                return response.json();
            })
            .then(() => {
                const transaction = db.transaction(["budgetObjStore"], "readwrite");
                const store = transaction.objectStore("budgetObjStore");
                store.clear();
            });
        }
    };
}

window.addEventListener("online", checkDatabase);