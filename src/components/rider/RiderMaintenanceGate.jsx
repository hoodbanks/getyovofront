import { Outlet } from 'react-router-dom';
import { useAppMaintenance } from '../../hooks/useAppMaintenance';

const RiderMaintenanceScreen = ({ message }) => (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-[#103D2E] px-6 text-center text-white">
        <div className="max-w-sm space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">GetYovo Rider</p>
            <h1 className="text-3xl font-bold leading-tight">{message}</h1>
        </div>
    </div>
);

const RiderMaintenanceGate = () => {
    const { checked, maintenance, message } = useAppMaintenance();
    if (!checked) {
        return <div className="fixed inset-0 z-[400] bg-[#103D2E]" role="status" aria-label="Checking the rider app" />;
    }
    if (maintenance) return <RiderMaintenanceScreen message={message} />;
    return <Outlet />;
};

export default RiderMaintenanceGate;
