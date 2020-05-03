//this file will store pending transactions and upload them to the database when reconnected
let database;

//the pending transactions index database
const request = indexedDB.open("transaction", 1);

//create a pending object store with autoincrement
request.onupgradeneeded = function(event) {
    const database = event.target.result;
    database.createObjectStore("pendingTransactions", { autoIncrement: true });
};

request.onsuccess = function(event) {
    database = event.target.result;

    //this if statement will check to see if we are working in online, or offline mode
    if(navigator.onLine){
        //this function will write all of our pending transactions if we are online, and if we have pending transactions to post
        checkDatabase();
    }
}

//error checking
request.onerror = function(event) {
    console.log(event.target.errorCode);
};

//declared functions, saveRecord function will be exported

//saveRecord will be called by the index.js file if we are working offline, it will create a pending transaction to be done the next time the application goes online
function saveRecord(record){
    //create a new Transaction
    const transaction = database.transaction(["pendingTransactions"], "readwrite");
    //this variable will represent our objectStore
    const store = transaction.objectStore("pendingTransactions");
    //add the pending transaction
    store.add(record);
}

function checkDatabase() {
    //open up our list of pending saved transactions
    const transaction = database.transaction(["pendingTransactions"], "readwrite");
    //access pending objects
    const store = transaction.objectStore("pendingTransactions");
    //ues the getAll function to get all the pending transactions
    const all = store.getAll();

    all.onsuccess = function() {
        //if there is anything to add we will call the bulk transaction api to post it
        if(all.result.length > 0) {
            console.log("Sending bulk transactions: ", all.result);
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(all.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                  }
            }).then(response => response.json())
            .then(() => {
                // if successful, open a transaction on your pending db
                const transaction = database.transaction(["pendingTransactions"], "readwrite");
        
                // access your pending object store
                const store = transaction.objectStore("pendingTransactions");
        
                // clear all items in your store
                store.clear();
              });
        }
    };
}

//if the app ever comes back online, it will run the check database function to update the online database
window.addEventListener("online", checkDatabase);