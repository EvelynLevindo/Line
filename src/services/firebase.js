import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  increment
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey.length > 5 &&
  firebaseConfig.projectId
);

let app = null;
let auth = null;
let db = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    console.info('Firebase inicializado com sucesso.');
  } catch (err) {
    console.warn('Falha ao inicializar Firebase. Alternando para modo local seguro:', err);
  }
} else {
  console.info('Chaves do Firebase não configuradas no .env. Executando em modo local seguro.');
}

export { auth, db };

// ==========================================
// LOCAL STORAGE FALLBACK FOR ISOLATED ACCOUNTS
// ==========================================
const LOCAL_USERS_KEY = 'line_local_users';
const LOCAL_CURRENT_USER_KEY = 'line_local_current_user';
const LOCAL_FORUM_KEY = 'line_shared_forum_posts';

const getLocalUsers = () => {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalUsers = (users) => {
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.warn(e);
  }
};

// ==========================================
// AUTHENTICATION SERVICES
// ==========================================
export const authService = {
  // Observa mudanças no estado de autenticação
  onAuthStateChange: (callback) => {
    if (auth) {
      return onAuthStateChanged(auth, callback);
    }
    // Fallback Local
    const localUserRaw = localStorage.getItem(LOCAL_CURRENT_USER_KEY);
    if (localUserRaw) {
      try {
        const localUser = JSON.parse(localUserRaw);
        callback(localUser);
      } catch {
        callback(null);
      }
    } else {
      callback(null);
    }
    return () => {};
  },

  // Cadastro de nova usuária
  register: async (email, password, displayName) => {
    if (auth) {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }
      return userCredential.user;
    }

    // Fallback Local
    const users = getLocalUsers();
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('Este e-mail já está cadastrado no aplicativo.');
    }

    const newUser = {
      uid: 'user_' + Date.now(),
      email,
      displayName: displayName || email.split('@')[0],
      createdAt: new Date().toISOString()
    };
    users.push({ ...newUser, password });
    saveLocalUsers(users);
    localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(newUser));
    return newUser;
  },

  // Login de usuária
  login: async (email, password) => {
    if (auth) {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    }

    // Fallback Local
    const users = getLocalUsers();
    const found = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) {
      throw new Error('E-mail ou senha incorretos.');
    }

    const sessionUser = {
      uid: found.uid,
      email: found.email,
      displayName: found.displayName
    };
    localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(sessionUser));
    return sessionUser;
  },

  // Logout
  logout: async () => {
    if (auth) {
      await signOut(auth);
    }
    localStorage.removeItem(LOCAL_CURRENT_USER_KEY);
  }
};

// ==========================================
// FIRESTORE / PROFILE & USER DATA SERVICES
// ==========================================
export const dataService = {
  // Carrega o perfil do Firestore ou local
  getUserProfile: async (uid) => {
    if (db) {
      try {
        const userRef = doc(db, 'users', uid);
        const snapshot = await getDoc(userRef);
        if (snapshot.exists()) {
          return snapshot.data();
        }
      } catch (err) {
        console.warn('Erro ao carregar perfil do Firestore:', err);
      }
    }

    // Fallback Local
    const raw = localStorage.getItem(`line_profile_${uid}`);
    return raw ? JSON.parse(raw) : null;
  },

  // Salva dados do perfil (onboarding, duração do ciclo, etc.)
  saveUserProfile: async (uid, profileData) => {
    const updated = {
      ...profileData,
      updatedAt: new Date().toISOString()
    };

    if (db) {
      try {
        const userRef = doc(db, 'users', uid);
        await setDoc(userRef, updated, { merge: true });
      } catch (err) {
        console.warn('Erro ao salvar perfil no Firestore:', err);
      }
    }

    // Fallback Local
    localStorage.setItem(`line_profile_${uid}`, JSON.stringify(updated));
    return updated;
  },

  // Carrega registros de ciclo da usuária
  getUserCycleLogs: async (uid) => {
    if (db) {
      try {
        const docRef = doc(db, 'users', uid, 'data', 'cycle_logs');
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          return snapshot.data().logs || {};
        }
      } catch (err) {
        console.warn('Erro ao obter cycle_logs do Firestore:', err);
      }
    }

    const raw = localStorage.getItem(`line_cycle_logs_${uid}`);
    return raw ? JSON.parse(raw) : {};
  },

  // Salva registros de ciclo da usuária
  saveUserCycleLogs: async (uid, logs) => {
    if (db) {
      try {
        const docRef = doc(db, 'users', uid, 'data', 'cycle_logs');
        await setDoc(docRef, { logs, updatedAt: new Date().toISOString() }, { merge: true });
      } catch (err) {
        console.warn('Erro ao salvar cycle_logs no Firestore:', err);
      }
    }

    localStorage.setItem(`line_cycle_logs_${uid}`, JSON.stringify(logs));
  },

  // Carrega lembretes da usuária
  getUserReminders: async (uid) => {
    if (db) {
      try {
        const docRef = doc(db, 'users', uid, 'data', 'reminders');
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          return snapshot.data().items || [];
        }
      } catch (err) {
        console.warn('Erro ao obter lembretes do Firestore:', err);
      }
    }

    const raw = localStorage.getItem(`line_reminders_${uid}`);
    return raw ? JSON.parse(raw) : [];
  },

  // Salva lembretes da usuária
  saveUserReminders: async (uid, reminders) => {
    if (db) {
      try {
        const docRef = doc(db, 'users', uid, 'data', 'reminders');
        await setDoc(docRef, { items: reminders, updatedAt: new Date().toISOString() }, { merge: true });
      } catch (err) {
        console.warn('Erro ao salvar lembretes no Firestore:', err);
      }
    }

    localStorage.setItem(`line_reminders_${uid}`, JSON.stringify(reminders));
  },

  // ==========================================
  // FORUM COMPARTILHADO (SHARED FIRESTORE FORUM)
  // ==========================================
  subscribeForumPosts: (callback) => {
    if (db) {
      try {
        const q = query(collection(db, 'forum_posts'), orderBy('createdAt', 'desc'));
        return onSnapshot(q, (snapshot) => {
          const posts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          callback(posts);
        }, (error) => {
          console.warn('Erro na escuta do Firestore forum_posts:', error);
          // Fallback to local
          const raw = localStorage.getItem(LOCAL_FORUM_KEY);
          callback(raw ? JSON.parse(raw) : []);
        });
      } catch (err) {
        console.warn('Erro ao assinar posts do Firestore:', err);
      }
    }

    // Fallback local
    const getLocalPosts = () => {
      const raw = localStorage.getItem(LOCAL_FORUM_KEY);
      return raw ? JSON.parse(raw) : [];
    };

    callback(getLocalPosts());

    // Listen to storage event across tabs
    const listener = (e) => {
      if (e.key === LOCAL_FORUM_KEY) {
        callback(getLocalPosts());
      }
    };
    window.addEventListener('storage', listener);
    return () => window.removeEventListener('storage', listener);
  },

  // Cria novo post anônimo compartilhado
  addForumPost: async (postData) => {
    const newPost = {
      ...postData,
      createdAt: new Date().toISOString(),
      likes: 0
    };

    if (db) {
      try {
        const docRef = await addDoc(collection(db, 'forum_posts'), {
          ...newPost,
          serverTimestamp: serverTimestamp()
        });
        return { id: docRef.id, ...newPost };
      } catch (err) {
        console.warn('Erro ao criar post no Firestore:', err);
      }
    }

    // Fallback local compartilhado
    const raw = localStorage.getItem(LOCAL_FORUM_KEY);
    const posts = raw ? JSON.parse(raw) : [];
    const postWithId = { id: 'post_' + Date.now(), ...newPost };
    posts.unshift(postWithId);
    localStorage.setItem(LOCAL_FORUM_KEY, JSON.stringify(posts));
    return postWithId;
  },

  // Curtir post
  likeForumPost: async (postId) => {
    if (db) {
      try {
        const postRef = doc(db, 'forum_posts', postId);
        await updateDoc(postRef, {
          likes: increment(1)
        });
        return;
      } catch (err) {
        console.warn('Erro ao curtir post no Firestore:', err);
      }
    }

    // Fallback local
    const raw = localStorage.getItem(LOCAL_FORUM_KEY);
    if (!raw) return;
    const posts = JSON.parse(raw);
    const updated = posts.map(p => p.id === postId ? { ...p, likes: (p.likes || 0) + 1 } : p);
    localStorage.setItem(LOCAL_FORUM_KEY, JSON.stringify(updated));
  }
};
