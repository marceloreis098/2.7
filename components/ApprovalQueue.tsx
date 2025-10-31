import React, { useState, useEffect, useCallback } from 'react';
import { getPendingApprovals, approveItem, rejectItem } from '../services/apiService';
import { User } from '../types';
import Icon from './common/Icon';

interface ApprovalItem {
    id: number;
    name: string;
    type: 'equipment' | 'license';
}

interface ApprovalQueueProps {
    currentUser: User;
    onAction: () => void; // Callback to refresh parent data
}

const ApprovalQueue: React.FC<ApprovalQueueProps> = ({ currentUser, onAction }) => {
    const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState<number | null>(null);

    const fetchApprovals = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getPendingApprovals();
            setApprovals(data);
        } catch (error) {
            console.error("Failed to fetch pending approvals", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchApprovals();
    }, [fetchApprovals]);

    const handleApprove = async (item: ApprovalItem) => {
        setIsProcessing(item.id);
        try {
            await approveItem(item.type, item.id, currentUser.username);
            await fetchApprovals(); // Refresh this component's list
            onAction(); // Refresh dashboard stats
        } catch (error) {
            console.error(`Failed to approve ${item.type}`, error);
            alert("Falha ao aprovar o item.");
        } finally {
            setIsProcessing(null);
        }
    };

    const handleReject = async (item: ApprovalItem) => {
        if (window.confirm(`Tem certeza que deseja rejeitar e excluir esta solicitação para "${item.name}"?`)) {
            setIsProcessing(item.id);
            try {
                await rejectItem(item.type, item.id, currentUser.username);
                await fetchApprovals();
                onAction();
            } catch (error) {
                console.error(`Failed to reject ${item.type}`, error);
                alert("Falha ao rejeitar o item.");
            } finally {
                setIsProcessing(null);
            }
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4 text-brand-dark dark:text-dark-text-primary">Carregando aprovações...</h3>
            </div>
        );
    }
    
    if (approvals.length === 0) {
        return null; // Don't render the box if there's nothing to approve
    }

    return (
        <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md border-l-4 border-yellow-400 animate-fade-in">
            <h3 className="text-xl font-semibold mb-4 text-brand-dark dark:text-dark-text-primary">Solicitações Pendentes de Aprovação ({approvals.length})</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {approvals.map(item => (
                    <div key={`${item.type}-${item.id}`} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-bg rounded-md">
                        <div>
                            <span className={`text-xs font-bold uppercase py-1 px-2 rounded-md mr-3 ${item.type === 'equipment' ? 'bg-blue-200 text-blue-800' : 'bg-green-200 text-green-800'}`}>
                                {item.type === 'equipment' ? 'Equip.' : 'Licença'}
                            </span>
                            <span className="text-gray-800 dark:text-dark-text-primary">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => handleApprove(item)} 
                                disabled={isProcessing === item.id}
                                className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-full disabled:opacity-50"
                                title="Aprovar"
                            >
                                <Icon name="Check" size={18} />
                            </button>
                            <button 
                                onClick={() => handleReject(item)} 
                                disabled={isProcessing === item.id}
                                className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full disabled:opacity-50"
                                title="Rejeitar"
                            >
                                <Icon name="X" size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ApprovalQueue;
