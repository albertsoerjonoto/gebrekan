"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  ActivityKey,
  BeraniKey,
  DayKey,
  InviteeKey,
  LocationKey,
} from "./options";
import { allowedActivities, allowedInvitees, allowedLocations, isWeekend, needsInviteesPage } from "./options";

export type FormState = {
  berani: BeraniKey | null;
  day: DayKey | null;
  location: LocationKey | null;
  invitees: InviteeKey[];
  activity: ActivityKey | null;
  message: string;
};

const EMPTY: FormState = {
  berani: null,
  day: null,
  location: null,
  invitees: [],
  activity: null,
  message: "",
};

const STORAGE_KEY = "gebrekan:v1";
const SESSION_KEY = "gebrekan:sid";

type TrackEvent =
  | { type: "page_view"; page: string }
  | { type: "change"; field: keyof FormState; value: unknown }
  | { type: "submit" };

type Ctx = {
  state: FormState;
  sessionId: string;
  hydrated: boolean;
  setBerani: (v: BeraniKey) => void;
  setDay: (v: DayKey) => void;
  setLocation: (v: LocationKey | null) => void;
  toggleInvitee: (v: InviteeKey) => void;
  setActivity: (v: ActivityKey | null) => void;
  setMessage: (v: string) => void;
  track: (e: TrackEvent) => void;
  reset: () => void;
};

const StateCtx = createContext<Ctx | null>(null);

function genId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "sid-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function StateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<FormState>(EMPTY);
  const [sessionId, setSessionId] = useState<string>("");
  const [hydrated, setHydrated] = useState(false);
  const queue = useRef<TrackEvent[]>([]);
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<FormState>;
        setState({ ...EMPTY, ...parsed, invitees: parsed.invitees ?? [] });
      }
      let sid = localStorage.getItem(SESSION_KEY);
      if (!sid) {
        sid = genId();
        localStorage.setItem(SESSION_KEY, sid);
      }
      setSessionId(sid);
    } catch {
      setSessionId(genId());
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state, hydrated]);

  const flush = useCallback(() => {
    if (!sessionId || queue.current.length === 0) return;
    const events = queue.current.splice(0, queue.current.length);
    const body = JSON.stringify({ sessionId, events, snapshot: state });
    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: "application/json" });
        navigator.sendBeacon("/api/track", blob);
        return;
      }
    } catch {}
    fetch("/api/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  }, [sessionId, state]);

  const track = useCallback(
    (e: TrackEvent) => {
      queue.current.push(e);
      if (flushTimer.current) clearTimeout(flushTimer.current);
      flushTimer.current = setTimeout(flush, 250);
    },
    [flush],
  );

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pagehide", flush);
    };
  }, [flush]);

  const setBerani = useCallback(
    (v: BeraniKey) => {
      setState((s) => {
        const nextInvitees = v === "udh_haha" ? [] : s.invitees;
        return { ...s, berani: v, invitees: nextInvitees };
      });
      track({ type: "change", field: "berani", value: v });
    },
    [track],
  );

  const setDay = useCallback(
    (v: DayKey) => {
      setState((s) => {
        let nextLocation = s.location;
        if (!isWeekend(v)) nextLocation = null;
        else {
          const allowed = allowedLocations(v);
          if (nextLocation && !allowed.includes(nextLocation)) nextLocation = null;
        }
        const allowedInv = allowedInvitees(v, nextLocation);
        const nextInvitees = s.invitees.filter((i) => allowedInv.includes(i));
        const allowedAct = allowedActivities({
          berani: s.berani,
          day: v,
          location: nextLocation,
          invitees: nextInvitees,
        });
        const nextActivity = s.activity && allowedAct.includes(s.activity) ? s.activity : null;
        return {
          ...s,
          day: v,
          location: nextLocation,
          invitees: nextInvitees,
          activity: nextActivity,
        };
      });
      track({ type: "change", field: "day", value: v });
    },
    [track],
  );

  const setLocation = useCallback(
    (v: LocationKey | null) => {
      setState((s) => {
        const allowedInv = allowedInvitees(s.day, v);
        const nextInvitees = s.invitees.filter((i) => allowedInv.includes(i));
        const allowedAct = allowedActivities({
          berani: s.berani,
          day: s.day,
          location: v,
          invitees: nextInvitees,
        });
        const nextActivity = s.activity && allowedAct.includes(s.activity) ? s.activity : null;
        return { ...s, location: v, invitees: nextInvitees, activity: nextActivity };
      });
      track({ type: "change", field: "location", value: v });
    },
    [track],
  );

  const toggleInvitee = useCallback(
    (v: InviteeKey) => {
      setState((s) => {
        if (!needsInviteesPage(s.berani)) return s;
        const has = s.invitees.includes(v);
        const nextInvitees = has ? s.invitees.filter((x) => x !== v) : [...s.invitees, v];
        const allowedAct = allowedActivities({
          berani: s.berani,
          day: s.day,
          location: s.location,
          invitees: nextInvitees,
        });
        const nextActivity = s.activity && allowedAct.includes(s.activity) ? s.activity : null;
        return { ...s, invitees: nextInvitees, activity: nextActivity };
      });
      track({ type: "change", field: "invitees", value: v });
    },
    [track],
  );

  const setActivity = useCallback(
    (v: ActivityKey | null) => {
      setState((s) => ({ ...s, activity: v }));
      track({ type: "change", field: "activity", value: v });
    },
    [track],
  );

  const setMessage = useCallback(
    (v: string) => {
      setState((s) => ({ ...s, message: v }));
      track({ type: "change", field: "message", value: v.length });
    },
    [track],
  );

  const reset = useCallback(() => {
    setState(EMPTY);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      state,
      sessionId,
      hydrated,
      setBerani,
      setDay,
      setLocation,
      toggleInvitee,
      setActivity,
      setMessage,
      track,
      reset,
    }),
    [state, sessionId, hydrated, setBerani, setDay, setLocation, toggleInvitee, setActivity, setMessage, track, reset],
  );

  return <StateCtx.Provider value={value}>{children}</StateCtx.Provider>;
}

export function useFormState() {
  const ctx = useContext(StateCtx);
  if (!ctx) throw new Error("useFormState outside provider");
  return ctx;
}
