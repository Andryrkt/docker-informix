import { useAuth } from "@/context/authContext";
import { useState, useEffect, useCallback, useRef } from "react";

const VisualTimer = () => {
  const { logout } = useAuth();
  const totalTime = Number(import.meta.env.VITE_TIMER_SESSION) || 900;
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const logoutRef = useRef(logout);
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    logoutRef.current = logout;
  }, [logout]);

  // Initialize BroadcastChannel & Listen for Tab Sync Events
  useEffect(() => {
    const channel = new BroadcastChannel("session_timer_channel");
    channelRef.current = channel;

    channel.onmessage = (event) => {
      if (event.data?.type === "RESET_TIMER") {
        setTimeLeft(totalTime);
      }
    };

    return () => {
      channel.close();
    };
  }, [totalTime]);

  // Reset local state and broadcast reset event to other tabs
  const resetTimer = useCallback(() => {
    setTimeLeft(totalTime);
    channelRef.current?.postMessage({ type: "RESET_TIMER" });
  }, [totalTime]);

  useEffect(() => {
    const events = [
      "mousemove",
      "mousedown",
      "click",
      "keypress",
      "scroll",
      "touchstart",
    ];
    events.forEach((event) => window.addEventListener(event, resetTimer));
    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [resetTimer]);

  // Single interval — created once, never recreated on each tick
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Separate effect: logout when timer reaches 0
  useEffect(() => {
    if (timeLeft === 0) logoutRef.current();
  }, [timeLeft]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const percentage = (timeLeft / totalTime) * 100;

  // SVG Circle configuration variables
  const radius = 75;
  const strokeWidth = 17;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Dynamic color switching for SVG path based on time remaining
  const getColorClass = () => {
    if (timeLeft === 0) return "stroke-gray-300";
    if (percentage < 25) return "stroke-red-500";
    if (percentage < 50) return "stroke-yellow-500";
    return "stroke-green-500";
  };

  return (
    <div className="w-fit shadow-xl text-center flex flex-col items-center  ">
      {/* Circular SVG Timer View */}
      <div className="relative flex flex-col items-center justify-center size-15">
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 200 200"
        >
          {/* Background Circle */}
          <circle
            className="stroke-gray-100"
            cx="100"
            cy="100"
            r={radius}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated Progress Countdown Circle */}
          <circle
            className={`${getColorClass()} transition-all duration-1000 ease-linear`}
            cx="100"
            cy="100"
            r={radius}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        {/* Centered Countdown Numbers */}
        <div className=" absolute   flex flex-col items-center justify-center">
          <span className="text-[0.62rem] font-bold font-mono text-white tracking-wider">
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VisualTimer;
