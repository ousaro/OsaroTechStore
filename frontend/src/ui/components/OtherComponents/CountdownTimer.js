// CountdownTimer.js
import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ endDate }) => {
    const calculateTimeLeft = () => {
        const difference = +new Date(endDate) - +new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearTimeout(timer);
    });

    return (
        <div className="countdown flex flex-wrap justify-center gap-4">
            <div className='bg-primary2 text-white w-24 h-24 rounded-full flex justify-center items-center shadow-lg'>{timeLeft.days || 0} DAYS</div>
            <div className='bg-primary2 text-white w-24 h-24 rounded-full flex justify-center items-center shadow-lg'>{timeLeft.hours || 0} HOURS</div>
            <div className='bg-primary2 text-white w-24 h-24 rounded-full flex justify-center items-center shadow-lg'>{timeLeft.minutes || 0} MINS</div>
            <div className='bg-primary2 text-white w-24 h-24 rounded-full flex justify-center items-center shadow-lg'>{timeLeft.seconds || 0} SECS</div>
        </div>
    );
};

export default CountdownTimer;
