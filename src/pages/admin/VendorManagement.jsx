import React, { useState, useEffect } from 'react';
import { 
    Plus, 
    Search, 
    MoreHorizontal, 
    Edit2, 
    Trash2, 
    Loader2, 
    AlertCircle,
    CheckCircle2,
    X,
    Layers
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/api';
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from 'sonner';

const ShopTypeModal = ({ isOpen, onClose, shopType = null }) => {
    const { accessToken } = useAuthStore();
    const queryClient = useQueryClient();
    const [name, setName] = useState(shopType?.name || '');
    const [description, setDescription] = useState(shopType?.description || '');

    useEffect(() => {
        if (isOpen) {
            setName(shopType?.name || '');
            setDescription(shopType?.description || '');
        }
    }, [shopType, isOpen]);

    const mutation = useMutation({
        mutationFn: (data) => {
            if (shopType) {
                return api.patch(`/shop-types/update/${shopType.id}`, data, accessToken);
            }
            return api.post('/shop-types/create', data, accessToken);
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries(['shop-types']);
            toast.success(response.message || `Shop type ${shopType ? 'updated' : 'created'} successfully`);
            onClose();
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to save shop type');
        }
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in duration-200">
                <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-zinc-900">{shopType ? 'Edit Shop Type' : 'Create Shop Type'}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-zinc-900 tracking-tight uppercase">Name</label>
                        <input 
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Pharmacy"
                            className="w-full px-4 py-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500/20 transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-zinc-900 tracking-tight uppercase">Description</label>
                        <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description..."
                            className="w-full px-4 py-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500/20 transition-all h-32 resize-none"
                        />
                    </div>

                    {mutation.isError && (
                        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-2 text-rose-600">
                            <AlertCircle size={18} />
                            <span className="text-xs font-bold">{mutation.error?.message || 'Failed to save shop type'}</span>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-zinc-50 flex gap-3">
                    <button 
                        onClick={onClose}
                        className="flex-1 py-3.5 text-sm font-bold text-zinc-600 bg-white border border-zinc-200 rounded-2xl hover:bg-zinc-100 transition-all"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => mutation.mutate({ name, description })}
                        disabled={!name || mutation.isPending}
                        className="flex-1 py-3.5 text-sm font-bold text-white bg-emerald-800 rounded-2xl hover:bg-emerald-900 transition-all shadow-lg shadow-emerald-900/10 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {mutation.isPending && <Loader2 className="animate-spin" size={18} />}
                        {shopType ? 'Update' : 'Create'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, name }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-fade-in" onClick={onClose} />
            <div className="relative bg-white rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                <div className="p-8 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6">
                        <Trash2 size={32} className="text-rose-600" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-zinc-900 mb-2">Delete Shop Type?</h3>
                    <p className="text-xs text-zinc-500 font-medium leading-relaxed mb-8 px-4">
                        Are you sure you want to delete <span className="text-zinc-900 font-bold">"{name}"</span>? This action cannot be undone and may affect associated vendors.
                    </p>

                    <div className="flex w-full gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-4 bg-zinc-50 text-zinc-900 text-sm font-bold rounded-2xl hover:bg-zinc-100 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => { onConfirm(); onClose(); }}
                            className="flex-1 py-4 bg-rose-600 text-white text-sm font-bold rounded-2xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const VendorManagement = () => {
    const { accessToken } = useAuthStore();
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedShopType, setSelectedShopType] = useState(null);
    const [shopTypeIdToDelete, setShopTypeIdToDelete] = useState(null);
    const [shopTypeNameToDelete, setShopTypeNameToDelete] = useState('');

    const { data: shopTypesData, isLoading, error, refetch } = useQuery({
        queryKey: ['shop-types'],
        queryFn: () => api.get('/shop-types/get-all', accessToken)
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/shop-types/delete/${id}`, null, accessToken),
        onSuccess: (response) => {
            queryClient.invalidateQueries(['shop-types']);
            toast.success(response.message || 'Shop type deleted successfully');
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to delete shop type');
        }
    });

    const shopTypes = (shopTypesData?.data || []).filter(st => 
        st.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleEdit = (st) => {
        setSelectedShopType(st);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedShopType(null);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (st) => {
        setShopTypeIdToDelete(st.id);
        setShopTypeNameToDelete(st.name);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (shopTypeIdToDelete) {
            deleteMutation.mutate(shopTypeIdToDelete);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header & Stats Placeholder */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                <div className="p-6 bg-white rounded-3xl border border-zinc-200 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
                    <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 transition-all group-hover:rotate-6">
                        <Layers size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Total Types</p>
                        <p className="text-xl font-bold text-zinc-900">{shopTypes.length}</p>
                    </div>
                </div>
            </div>

            {/* Actions & Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1 w-full sm:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search shop types..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-white border border-zinc-200 rounded-3xl text-sm focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all shadow-sm placeholder:text-zinc-400"
                    />
                </div>
                <button 
                    onClick={handleCreate}
                    className="flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-800 text-white rounded-3xl text-sm font-bold hover:bg-emerald-900 transition-all shadow-lg shadow-emerald-900/10 active:scale-95"
                >
                    <Plus size={18} />
                    Add Shop Type
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-x-auto min-h-[400px]">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-zinc-50/50 border-b border-zinc-100">
                            <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Created At</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                        {isLoading ? (
                            <tr>
                                <td colSpan="4" className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 size={32} className="text-emerald-600 animate-spin" />
                                        <p className="text-sm font-medium text-zinc-500">Loading shop types...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan="4" className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <AlertCircle size={32} className="text-rose-500" />
                                        <p className="text-sm font-medium text-rose-500">{error.message || 'Failed to load data'}</p>
                                        <button onClick={() => refetch()} className="px-4 py-2 bg-zinc-900 text-white text-xs font-bold rounded-xl">Retry</button>
                                    </div>
                                </td>
                            </tr>
                        ) : shopTypes.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="py-20 text-center text-zinc-400 text-sm font-medium italic">No shop types found.</td>
                            </tr>
                        ) : (
                            shopTypes.map((st) => (
                                <tr key={st.id} className="hover:bg-zinc-50/50 transition-colors group">
                                    <td className="px-6 py-5">
                                        <span className="text-sm font-bold text-zinc-900 capitalize">{st.name}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-xs font-medium text-zinc-500 max-w-md block">{st.description || 'No description provided.'}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-xs font-medium text-zinc-400">{new Date(st.createdAt).toLocaleDateString()}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => handleEdit(st)}
                                                className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteClick(st)}
                                                disabled={deleteMutation.isPending}
                                                className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all disabled:opacity-30"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <ShopTypeModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                shopType={selectedShopType}
            />

            <DeleteConfirmModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                name={shopTypeNameToDelete}
            />
        </div>
    );
};

export default VendorManagement;
