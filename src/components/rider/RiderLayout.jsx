import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Navigation, Clock, User } from 'lucide-react';

const RiderLayout = () => {
    return (
        <div className="min-h-screen bg-[#f9f9f9] flex flex-col max-w-md mx-auto relative pb-24">
            <div className="flex-1 overflow-y-auto">
                <Outlet />
            </div>

        </div>
    );
};

export default RiderLayout;
