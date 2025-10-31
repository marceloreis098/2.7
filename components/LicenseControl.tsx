import React, { useState, useMemo, useEffect, useRef } from 'react';
import { getLicenses, addLicense, updateLicense, deleteLicense, renameProduct, getLicenseTotals, saveLicenseTotals } from '../services/apiService';
import { License, User, UserRole } from '../types';
import Icon from './common/Icon';

const ProductManagementModal: React.FC<{
    initialProductNames: string[];
    onClose: () => void;
    onSave: (newProductNames: string[], renames: Record<string, string>) => void;
}> = ({ initialProductNames, onClose, onSave }) => {
    const [productNames, setProductNames] = useState([...initialProductNames].sort());
    const [newProductName, setNewProductName] = useState('');
    const [editingProduct, setEditingProduct] = useState<string | null>(null);
    const [draftName, setDraftName] = useState('');
    const [renames, setRenames] = useState<Record<string, string>>({});
    const editInputRef = useRef<HTMLInputElement>(null);

     useEffect(() => {
        if (editingProduct && editInputRef.current) {
            editInputRef.current.focus();
        }
    }, [editingProduct]);

    const handleAddProduct = () => {
        const trimmedName = newProductName.trim();
        if (trimmedName && !productNames.find(p => p.toLowerCase() === trimmedName.toLowerCase())) {
            setProductNames(prev => [...prev, trimmedName].sort());
            setNewProductName('');
        }
    };

    const handleDeleteProduct = (productNameToDelete: string) => {
        if (window.confirm(`Tem certeza que deseja remover "${productNameToDelete}" da lista de produtos?`)) {
            setProductNames(prev => prev.filter(p => p !== productNameToDelete));
        }
    };

    const handleStartEditing = (productName: string) => {
        setEditingProduct(productName);
        setDraftName(productName);
    };

    const handleCancelEditing = () => {
        setEditingProduct(null);
        setDraftName('');
    };
    
    const handleConfirmEdit = () => {
        if (!editingProduct || !draftName.trim() || draftName.trim() === editingProduct) {
            handleCancelEditing();
            return;
        }
        const trimmedDraft = draftName.trim();
        
        if (productNames.find(p => p.toLowerCase() === trimmedDraft.toLowerCase() && p !== editingProduct)) {
            alert(`O produto "${trimmedDraft}" já existe.`);
            return;
        }

        setProductNames(prev => prev.map(p => p === editingProduct ? trimmedDraft : p).sort());
        setRenames(prev => ({ ...prev, [editingProduct]: trimmedDraft }));
        handleCancelEditing();
    };

    const handleSave = () => {
        onSave(productNames, renames);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60] p-4">
            <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
                <div className="p-6 border-b dark:border-dark-border">
                    <h3 className="text-xl font-bold text-brand-dark dark:text-dark-text-primary">Gerenciar Nomes de Produtos</h3>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto">
                    <p className="text-sm text-gray-600 dark:text-dark-text-secondary">Adicione ou remova os nomes de software que aparecerão na caixa de seleção ao criar uma nova licença.</p>
                    <div className="space-y-2">
                        {productNames.map(name => (
                            <div key={name} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-dark-bg rounded">
                                {editingProduct === name ? (
                                    <div className="flex-grow flex items-center gap-2">
                                        <input
                                            ref={editInputRef}
                                            type="text"
                                            value={draftName}
                                            onChange={(e) => setDraftName(e.target.value)}
                                            onBlur={handleConfirmEdit}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleConfirmEdit();
                                                if (e.key === 'Escape') handleCancelEditing();
                                            }}
                                            className="flex-grow p-1 border dark:border-dark-border rounded-md bg-white dark:bg-gray-800"
                                        />
                                        <button onClick={handleConfirmEdit} className="text-green-500 hover:text-green-700" title="Salvar"><Icon name="Check" size={20} /></button>
                                        <button onClick={handleCancelEditing} className="text-red-500 hover:text-red-700" title="Cancelar"><Icon name="X" size={20} /></button>
                                    </div>
                                ) : (
                                    <>
                                        <span className="text-gray-800 dark:text-dark-text-primary">{name}</span>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => handleStartEditing(name)} className="text-blue-500 hover:text-blue-700" title={`Editar ${name}`}>
                                                <Icon name="Pencil" size={16} />
                                            </button>
                                            <button onClick={() => handleDeleteProduct(name)} className="text-red-500 hover:text-red-700" title={`Remover ${name}`}>
                                                <Icon name="Trash2" size={16} />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                         {productNames.length === 0 && <p className="text-center text-gray-500">Nenhum produto cadast