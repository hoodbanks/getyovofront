import React, { useState } from 'react';
import { 
    Bell, 
    Search, 
    Users, 
    User, 
    Store, 
    Bike, 
    Send,
    Loader2,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { useAuthStore } from '../../store/useAuthStore';

const PushNotifications = () => {
    const { accessToken } = useAuthStore();
    const [audience, setAudience] = useState('ALL_USERS');
    const [targetRole, setTargetRole] = useState('USER');
    const [actorId, setActorId] = useState('');
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [type, setType] = useState('PROMO');
    const [showSuccess, setShowSuccess] = useState(false);

    const broadcastMutation = useMutation({
        mutationFn: (mutationData) => api.post('/notification/broadcast', mutationData),
        onSuccess: (res) => {
            setShowSuccess(true);
            setTitle('');
            setBody('');
            setActorId('');
            setTimeout(() => setShowSuccess(false), 5000);
        }
    });

    // Account Verification Query
    const { data: accountData, isFetching: isVerifying, error: verifyError } = useQuery({
        queryKey: ['verifyAccount', targetRole, actorId],
        queryFn: async () => {
            const endpoint = targetRole === 'USER' 
                ? `/superadmin/users/${actorId}/overview` 
                : targetRole === 'VENDOR' 
                    ? `/superadmin/vendors/${actorId}/overview` 
                    : `/superadmin/riders/${actorId}/overview`;
            return await api.get(endpoint);
        },
        enabled: !!actorId && actorId.length > 5 && audience === 'SINGLE',
        retry: false,
    });

    const accountName = (() => {
        if (!accountData?.data) return null;
        const d = accountData.data;
        if (targetRole === 'USER') return `${d.firstname || ''} ${d.lastname || ''}`.trim() || d.name;
        if (targetRole === 'VENDOR') return d.storeName || d.ownerName;
        if (targetRole === 'RIDER') return d.name;
        return null;
    })();

    const handleSend = (e) => {
        if (e) e.preventDefault();
        if (!title.trim() || !body.trim()) return;
        if (audience === 'SINGLE' && !actorId.trim()) return;
        
        const payload = {
            audience,
            title: title.trim(),
            body: body.trim(),
            type
        };

        if (audience === 'SINGLE') {
            payload.targetRole = targetRole;
            payload.actorId = actorId.trim();
        }

        broadcastMutation.mutate(payload);
    };

    const categories = [
        { id: 'PROMO', label: 'Promotion', color: 'bg-emerald-500' },
        { id: 'SYSTEM', label: 'System Update', color: 'bg-blue-500' },
        { id: 'SECURITY', label: 'Security', color: 'bg-rose-500' },
        { id: 'PAYMENT', label: 'Payment', color: 'bg-amber-500' },
        { id: 'ORDER', label: 'Order Info', color: 'bg-zinc-500' },
    ];

    const audiences = [
        { id: 'SINGLE', label: 'Single Target', icon: User, sub: 'Direct Message' },
        { id: 'ALL_USERS', label: 'All Users', icon: Users, sub: 'Default' },
        { id: 'ALL_VENDORS', label: 'All Vendors', icon: Store, sub: 'Sellers' },
        { id: 'ALL_RIDERS', label: 'All Riders', icon: Bike, sub: 'Delivery' },
    ];

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto">
            {/* Header */}
            

            <div className="space-y-6">
                {/* Target Audience */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm">
                    <div className="mb-8">
                        <h3 className="text-[15px] font-bold text-zinc-900">Target Audience</h3>
                        <p className="text-[11px] text-zinc-400 font-medium mt-1">Select who this message is for</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {audiences.map((aud) => (
                            <button
                                key={aud.id}
                                onClick={() => setAudience(aud.id)}
                                className={`flex items-start gap-4 p-5 rounded-[2rem] border-2 transition-all duration-300 text-left ${
                                    audience === aud.id 
                                    ? 'bg-[#00B074]/5 border-[#00B074] shadow-xl shadow-[#00B074]/5 scale-[1.02]' 
                                    : 'bg-white border-zinc-100 hover:border-zinc-200 grayscale opacity-60'
                                }`}
                            >
                                <div className={`p-3 rounded-2xl ${audience === aud.id ? 'bg-[#00B074] text-white' : 'bg-zinc-100 text-zinc-500'}`}>
                                    <aud.icon size={24} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h4 className={`text-sm font-bold ${audience === aud.id ? 'text-[#00B074]' : 'text-zinc-900'}`}>{aud.label}</h4>
                                    <p className="text-[10px] text-zinc-400 font-medium">{aud.sub}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Single Target Configuration */}
                {audience === 'SINGLE' && (
                    <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm animate-in fade-in zoom-in-95 duration-300">
                        <div className="mb-8">
                            <h3 className="text-[15px] font-bold text-zinc-900">Target Details</h3>
                            <p className="text-[11px] text-zinc-400 font-medium mt-1">Specify which account should receive this notification</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-[11px] font-bold text-zinc-900 ml-1 uppercase tracking-wider">Account Role</label>
                                <div className="flex p-1.5 bg-zinc-50 rounded-2xl border border-zinc-100">
                                    {['USER', 'VENDOR', 'RIDER'].map((role) => (
                                        <button
                                            key={role}
                                            type="button"
                                            onClick={() => setTargetRole(role)}
                                            className={`flex-1 py-2.5 text-[10px] font-bold rounded-xl transition-all ${
                                                targetRole === role 
                                                ? 'bg-white text-zinc-900 shadow-sm' 
                                                : 'text-zinc-400 hover:text-zinc-600'
                                            }`}
                                        >
                                            {role}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[11px] font-bold text-zinc-900 ml-1 uppercase tracking-wider">Account ID / Actor ID</label>
                                <div className="relative">
                                    <input 
                                        type="text"
                                        value={actorId}
                                        onChange={(e) => setActorId(e.target.value)}
                                        placeholder="e.g. user_123, vendor_456"
                                        className={`w-full px-5 py-4 bg-zinc-50 border rounded-2xl text-xs font-medium text-zinc-700 focus:bg-white focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-zinc-300 ${
                                            accountName ? 'border-emerald-500/50' : 'border-zinc-100'
                                        }`}
                                    />
                                    {isVerifying && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <Loader2 size={16} className="text-emerald-600 animate-spin" />
                                        </div>
                                    )}
                                </div>
                                {accountName && (
                                    <div className="flex items-center gap-2 px-1 animate-in fade-in slide-in-from-left-2 duration-300">
                                        <CheckCircle2 size={14} className="text-emerald-600" />
                                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight">Verified: {accountName}</p>
                                    </div>
                                )}
                                {verifyError && actorId.length > 5 && (
                                    <div className="flex items-center gap-2 px-1 animate-in fade-in slide-in-from-left-2 duration-300">
                                        <AlertCircle size={14} className="text-rose-500" />
                                        <p className="text-[10px] font-bold text-rose-500 uppercase tracking-tight">Account not found or invalid ID</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Category Selection */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm">
                    <div className="mb-8">
                        <h3 className="text-[15px] font-bold text-zinc-900">Notification Category</h3>
                        <p className="text-[11px] text-zinc-400 font-medium mt-1">Classify your message for better user engagement</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setType(cat.id)}
                                className={`px-6 py-3 rounded-2xl text-[10px] font-bold transition-all flex items-center gap-2 ${
                                    type === cat.id 
                                    ? 'bg-zinc-900 text-white shadow-lg' 
                                    : 'bg-zinc-50 text-zinc-500 hover:bg-zinc-100'
                                }`}
                            >
                                <span className={`w-1.5 h-1.5 rounded-full ${cat.color}`} />
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Message Content */}
                <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
                        <h3 className="text-sm font-bold text-zinc-900">Message Content</h3>
                    </div>
                    
                    <div className="p-8">
                        <form onSubmit={handleSend} className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[11px] font-bold text-zinc-900 ml-1 uppercase tracking-wider">Title</label>
                                <input 
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Flash Sale: Get 50% Off Now!"
                                    className="w-full px-7 py-5 bg-zinc-50 border border-zinc-100 rounded-[1.5rem] text-sm font-medium text-zinc-800 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/30 outline-none transition-all placeholder:text-zinc-300"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[11px] font-bold text-zinc-900 ml-1 uppercase tracking-wider">Message Content</label>
                                <textarea 
                                    required
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    placeholder="Write your announcement here..."
                                    className="w-full px-7 py-6 bg-zinc-50 border border-zinc-100 rounded-[2rem] text-sm font-medium text-zinc-800 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/30 outline-none transition-all placeholder:text-zinc-300 h-52 resize-none leading-relaxed"
                                />
                            </div>

                            {showSuccess && (
                                <div className="flex items-center gap-3 text-emerald-700 bg-emerald-50 p-5 rounded-[1.5rem] border border-emerald-200 animate-in fade-in slide-in-from-top-4 duration-500">
                                    <div className="bg-emerald-100 p-1 rounded-full"><CheckCircle2 size={18} /></div>
                                    <div className="flex flex-col">
                                        <span className="text-[12px] font-bold">Success!</span>
                                        <p className="text-[10px] font-medium opacity-80">Message broadcasted to target audience.</p>
                                    </div>
                                </div>
                            )}

                            {broadcastMutation.isError && (
                                <div className="flex items-start gap-3 text-rose-700 bg-rose-50 p-5 rounded-[1.5rem] border border-rose-200 animate-in fade-in slide-in-from-top-4 duration-500">
                                    <div className="bg-rose-100 p-1 rounded-full shrink-0"><AlertCircle size={18} /></div>
                                    <div className="flex flex-col">
                                        <span className="text-[12px] font-bold">Sending Failed</span>
                                        <p className="text-[10px] font-medium opacity-80">
                                            {broadcastMutation.error?.response?.data?.message || broadcastMutation.error?.message || 'Please check your connection and try again.'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <button 
                                type="submit"
                                disabled={!title.trim() || !body.trim() || (audience === 'SINGLE' && !actorId.trim()) || broadcastMutation.isPending}
                                className="w-full py-5 bg-[#00B074] text-white rounded-[1.5rem] text-sm font-bold hover:bg-[#009663] transition-all shadow-xl shadow-emerald-900/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 active:scale-[0.98] group"
                            >
                                {broadcastMutation.isPending ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        <span>Broadcast Message</span>
                                        <Send size={18} className="translate-x-0 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PushNotifications;
