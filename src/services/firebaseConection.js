import {initializeApp} from 'firebase/app';
import {getAuth} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';
import {getStorage} from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyDPj_c9jNcqjWWaIQHKvhXpkuMj7mmPCpo",
    authDomain: "chamados-e720f.firebaseapp.com",
    projectId: "chamados-e720f",
    storageBucket: "chamados-e720f.appspot.com",
    messagingSenderId: "129680069183",
    appId: "1:129680069183:web:a69b7f0dca3c54895c9e8a",
    measurementId: "G-X0KLLZXWGN"
  };
  const firebaseApp = initializeApp(firebaseConfig);

  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);
  const storage =getStorage(firebaseApp);

  export {auth,db,storage};
  