import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { BaitoContext } from "./BaitoContext";

export const BaitoManager = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Default settings state
  const [DEFAULT_START_TIME, setDefaultStartTime] = useState({
    hour: 17,
    minute: 0,
  });
  const [DEFAULT_END_TIME, setDefaultEndTime] = useState({
    hour: 22,
    minute: 0,
  });
  const [WORKTIME_START, setWorktimeStart] = useState({ hour: 17, minute: 0 });
  const [WORKTIME_END, setWorktimeEnd] = useState({ hour: 24, minute: 0 });
  const [PAY_INTERVAL_MINUTES, setPayIntervalMinutes] = useState(15);
  const [TIME_BARRIER, setTimeBarrier] = useState({ hour: 22, minute: 0 });
  const [COMMUTING_COST, setCommutingCost] = useState(230);
  const [WEEKDAY_WAGE, setWeekdayWage] = useState(1200);
  const [WEEKEND_WAGE, setWeekendWage] = useState(1500);

  // --- Authentication Functions ---
  const signup = (email, password) =>
    createUserWithEmailAndPassword(auth, email, password);
  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);
  const loginWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };
  const loginAsGuest = () => {
    if (currentUser) signOut(auth);
    setIsGuest(true);
  };
  const logout = () => {
    setIsGuest(false);
    return signOut(auth);
  };

  // --- Auth State Observer ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) setIsGuest(false);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  // --- Data Management ---
  const saveSettings = async (newSettings) => {
    if (isGuest) {
      localStorage.setItem("settings", JSON.stringify(newSettings));
      return;
    }
    if (currentUser) {
      const settingsRef = doc(db, "users", currentUser.uid, "settings", "main");
      await setDoc(settingsRef, newSettings, { merge: true });
    }
  };

  useEffect(() => {
    const loadSettings = async () => {
      let settings;
      if (isGuest) {
        const guestSettings = localStorage.getItem("settings");
        if (guestSettings) settings = JSON.parse(guestSettings);
      } else if (currentUser) {
        const settingsRef = doc(
          db,
          "users",
          currentUser.uid,
          "settings",
          "main"
        );
        const docSnap = await getDoc(settingsRef);
        if (docSnap.exists()) settings = docSnap.data();
      }

      if (settings) {
        setDefaultStartTime(settings.DEFAULT_START_TIME);
        setDefaultEndTime(settings.DEFAULT_END_TIME);
        setWorktimeStart(settings.WORKTIME_START);
        setWorktimeEnd(settings.WORKTIME_END);
        setPayIntervalMinutes(settings.PAY_INTERVAL_MINUTES);
        setCommutingCost(settings.COMMUTING_COST);
        setWeekdayWage(settings.WEEKDAY_WAGE);
        setWeekendWage(settings.WEEKEND_WAGE);
      }
    };

    if (currentUser || isGuest) loadSettings();
  }, [currentUser, isGuest]);

  const formatKey = (year, month) =>
    `${year}-${String(month + 1).padStart(2, "0")}`;

  const fetchWorkdays = async (year, month) => {
    const key = formatKey(year, month);
    if (isGuest) {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    }
    if (currentUser) {
      const docRef = doc(db, "users", currentUser.uid, "workdays", key);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data().workdays : [];
    }
    return [];
  };

  const addWorkday = async (year, month, newWorkday) => {
    const workdays = await fetchWorkdays(year, month);
    const newWorkdays = [...workdays, newWorkday];
    const key = formatKey(year, month);

    if (isGuest) {
      localStorage.setItem(key, JSON.stringify(newWorkdays));
    } else if (currentUser) {
      const docRef = doc(db, "users", currentUser.uid, "workdays", key);
      await setDoc(docRef, { workdays: newWorkdays });
    }
  };

  const updateWorkday = async (year, month, day, updatedWorkday) => {
    const workdays = await fetchWorkdays(year, month);
    const newWorkdays = workdays.map((w) =>
      w.day === day ? updatedWorkday : w
    );
    const key = formatKey(year, month);

    if (isGuest) {
      localStorage.setItem(key, JSON.stringify(newWorkdays));
    } else if (currentUser) {
      const docRef = doc(db, "users", currentUser.uid, "workdays", key);
      await setDoc(docRef, { workdays: newWorkdays });
    }
  };

  const deleteWorkday = async (year, month, day) => {
    const workdays = await fetchWorkdays(year, month);
    const newWorkdays = workdays.filter((w) => w.day !== day);
    const key = formatKey(year, month);

    if (isGuest) {
      localStorage.setItem(key, JSON.stringify(newWorkdays));
    } else if (currentUser) {
      const docRef = doc(db, "users", currentUser.uid, "workdays", key);
      await setDoc(docRef, { workdays: newWorkdays });
    }
  };

  const migrateGuestToAccount = async (email, password) => {
    if (!isGuest) return;

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const newUser = userCredential.user;

      const guestSettings = JSON.parse(localStorage.getItem("settings"));
      const guestWorkdays = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (/^\d{4}-\d{2}$/.test(key)) {
          guestWorkdays[key] = JSON.parse(localStorage.getItem(key));
        }
      }

      const promises = [];
      if (guestSettings) {
        const settingsRef = doc(db, "users", newUser.uid, "settings", "main");
        promises.push(setDoc(settingsRef, guestSettings));
      }
      for (const key in guestWorkdays) {
        const docRef = doc(db, "users", newUser.uid, "workdays", key);
        promises.push(setDoc(docRef, { workdays: guestWorkdays[key] }));
      }

      await Promise.all(promises);

      localStorage.clear();
      setIsGuest(false);
    } catch (error) {
      console.error("Error migrating guest data:", error);
      throw error;
    }
  };

  const migrateGuestToGoogleAccount = async () => {
    if (!isGuest) return;

    try {
      // 1. Sign in with Google popup
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const newUser = userCredential.user;

      // 2. Read all data from localStorage
      const guestSettings = JSON.parse(localStorage.getItem("settings"));
      const guestWorkdays = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (/^\d{4}-\d{2}$/.test(key)) {
          guestWorkdays[key] = JSON.parse(localStorage.getItem(key));
        }
      }

      // 3. Write the data to Firestore under the new user's UID
      const promises = [];
      if (guestSettings) {
        const settingsRef = doc(db, "users", newUser.uid, "settings", "main");
        // Use merge: true to avoid overwriting data if the user already existed
        promises.push(setDoc(settingsRef, guestSettings, { merge: true }));
      }
      for (const key in guestWorkdays) {
        const docRef = doc(db, "users", newUser.uid, "workdays", key);
        promises.push(
          setDoc(docRef, { workdays: guestWorkdays[key] }, { merge: true })
        );
      }

      await Promise.all(promises);

      // 4. Clean up localStorage
      localStorage.clear();
      setIsGuest(false);
    } catch (error) {
      console.error("Error migrating guest data to Google account:", error);
      throw error;
    }
  };

  const calculateDailySalary = (workdays) => {
    if (!workdays || workdays.length === 0) return [];
    let dailySalary = [];
    workdays.forEach((workday) => {
      let singleDaySalary = 0;
      const wage = workday.wage;
      if (
        workday.endTime.hour >= TIME_BARRIER.hour &&
        workday.endTime.minute > TIME_BARRIER.minute
      ) {
        singleDaySalary += (TIME_BARRIER.hour - workday.startTime.hour) * wage;
        singleDaySalary +=
          ((TIME_BARRIER.minute - workday.startTime.minute) / 60) * wage;
        singleDaySalary +=
          (workday.endTime.hour - TIME_BARRIER.hour) * wage * 1.25;
        singleDaySalary +=
          ((workday.endTime.minute - TIME_BARRIER.minute) / 60) * wage * 1.25;
      } else {
        singleDaySalary +=
          (workday.endTime.hour - workday.startTime.hour) * wage;
        singleDaySalary +=
          ((workday.endTime.minute - workday.startTime.minute) / 60) * wage;
      }
      singleDaySalary += 2 * COMMUTING_COST;
      dailySalary.push(singleDaySalary);
    });
    return dailySalary;
  };

  const value = {
    currentUser,
    isGuest,
    isLoading,
    signup,
    login,
    logout,
    loginWithGoogle,
    loginAsGuest,
    migrateGuestToAccount,
    migrateGuestToGoogleAccount,
    DEFAULT_START_TIME,
    DEFAULT_END_TIME,
    WORKTIME_START,
    WORKTIME_END,
    COMMUTING_COST,
    PAY_INTERVAL_MINUTES,
    WEEKDAY_WAGE,
    WEEKEND_WAGE,
    TIME_BARRIER,
    setDefaultStartTime,
    setDefaultEndTime,
    setWorktimeStart,
    setWorktimeEnd,
    setCommutingCost,
    setPayIntervalMinutes,
    setTimeBarrier,
    setWeekdayWage,
    setWeekendWage,
    saveSettings,
    fetchWorkdays,
    addWorkday,
    updateWorkday,
    deleteWorkday,
    calculateDailySalary,
  };

  return (
    <BaitoContext.Provider value={value}>
      {!isLoading && children}
    </BaitoContext.Provider>
  );
};
