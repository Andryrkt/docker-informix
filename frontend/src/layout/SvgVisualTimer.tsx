import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

const SvgVisualTimer = () => {
  const totalTime = 900; // 15 minutes in seconds
  const [timeLeft, setTimeLeft] = useState(totalTime);

  // Wrap reset in useCallback to prevent infinite event listener attaches
  const resetTimer = useCallback(() => {
    setTimeLeft(totalTime);
  }, [totalTime]);

  // Handle User Activity Listeners
  useEffect(() => {
    const events = [
      "mousemove",
      "mousedown",
      "click",
      "keypress",
      "scroll",
      "touchstart",
    ];

    // Attach event listeners
    events.forEach((event) => window.addEventListener(event, resetTimer));

    // Cleanup event listeners
    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [resetTimer]);

  // Handle Countdown Interval and Toast Trigger
  useEffect(() => {
    if (timeLeft <= 0) {
      toast.error("Delais expires", {
        position: "top-center",
      });
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (time) => {
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

export default SvgVisualTimer;
