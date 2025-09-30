importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);
 
const firebaseConfig = {
  apiKey: "AIzaSyBgRqjTZqbS142v0tQp3W7KgDKnh2I_Z7Q",
  authDomain: "document-approval-system.firebaseapp.com",
  projectId: "document-approval-system",
  storageBucket: "document-approval-system.firebasestorage.app",
  messagingSenderId: "303203465170",
  appId: "1:303203465170:web:499cd04e6d2592450fba0b",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("recieved background message", payload);
});

messaging.onMessage((payload) => {
  console.log("recieved message", payload);
});
