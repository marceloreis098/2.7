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
                         {productNames.length === 0 && <p className="text-center text-gray-500">Nenhum produto cadastrado.</p>}
                    </div>
                    <div className="border-t dark:border-dark-border pt-4">
                        <h4 className="font-semibold text-gray-800 dark:text-dark-text-primary mb-2">Adicionar Novo Produto</h4>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={newProductName}
                                onChange={(e) => setNewProductName(e.target.value)}
                                placeholder="Nome do Software"
                                className="flex-grow p-2 border dark:border-dark-border rounded-md bg-white dark:bg-gray-800"
                                onKeyDown={(e) => e.key === 'Enter' && handleAddProduct()}
                            />
                            <button onClick={handleAddProduct} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">Adicionar</button>
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-dark-card/50 border-t dark:border-dark-border flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">Cancelar</button>
                    <button type="button" onClick={handleSave} className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700">Salvar Alterações</button>
                </div>
            </div>
        </div>
    );
};


const LicenseFormModal: React.FC<{
    license?: License | null;
    onClose: () => void;
    onSave: () => void;
    currentUser: User;
    productNames: string[];
}> = ({ license, onClose, onSave, currentUser, productNames }) => {
    const [formData, setFormData] = useState<Partial<Omit<License, 'id' | 'approval_status' | 'rejection_reason'>>>({
        produto: productNames.length > 0 ? productNames[0] : '',
        usuario: '',
        chaveSerial: '',
        tipoLicenca: '',
        dataExpiracao: '',
        cargo: '',
        setor: '',
        gestor: '',
        centroCusto: '',
        contaRazao: '',
        nomeComputador: '',
        numeroChamado: '',
        observacoes: '',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState('');

    useEffect(() => {
        if (license) {
            setFormData({
                produto: license.produto,
                usuario: license.usuario,
                chaveSerial: license.chaveSerial,
                tipoLicenca: license.tipoLicenca || '',
                dataExpiracao: license.dataExpiracao || '',
                cargo: license.cargo || '',
                setor: license.setor || '',
                gestor: license.gestor || '',
                centroCusto: license.centroCusto || '',
                contaRazao: license.contaRazao || '',
                nomeComputador: license.nomeComputador || '',
                numeroChamado: license.numeroChamado || '',
                observacoes: license.observacoes || '',
            });
        }
    }, [license]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveError('');
        try {
            if (license) {
                await updateLicense({ ...formData, id: license.id } as License, currentUser.username);
            } else {
                if (!formData.produto || !formData.chaveSerial || !formData.usuario) {
                    throw new Error("Produto, Chave Serial e Usuário são campos obrigatórios.");
                }
                await addLicense(formData as Omit<License, 'id'>, currentUser);
            }
            onSave();
        } catch (error: any) {
            console.error("Failed to save license", error);
            setSaveError(error.message || 'Ocorreu um erro desconhecido ao salvar.');
        } finally {
            setIsSaving(false);
        }
    };

    const requiredFields: (keyof typeof formData)[] = ['produto', 'chaveSerial', 'usuario'];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start sm:items-center z-50 p-4 overflow-y-auto">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-dark-card rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b dark:border-dark-border flex-shrink-0">
                    <h3 className="text-xl font-bold text-brand-dark dark:text-dark-text-primary">
                        {license ? 'Editar Licença' : 'Nova Licença'}
                    </h3>
                </div>
                 {saveError && (
                    <div className="p-4 bg-red-100 dark:bg-red-900/50 border-b border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 flex-shrink-0">
                        <strong>Erro ao Salvar:</strong> {saveError}
                    </div>
                )}
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto">
                    {Object.keys(formData).map(key => {
                        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                        const isRequired = requiredFields.includes(key as keyof typeof formData);
                        
                        if (key === 'produto') {
                            return (
                                <div key={key}>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Produto {isRequired && '*'}</label>
                                    <select name="produto" value={formData.produto} onChange={handleChange} className="mt-1 block w-full p-2 border dark:border-dark-border rounded-md bg-white dark:bg-gray-800" required>
                                        {productNames.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                            );
                        }
                        
                        if (key === 'observacoes') {
                            return (
                                <div key={key} className="sm:col-span-2 md:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">{label}</label>
                                    <textarea name={key} value={formData[key as keyof typeof formData]} onChange={handleChange} rows={3} className="mt-1 block w-full p-2 border dark:border-dark-border rounded-md bg-white dark:bg-gray-800"></textarea>
                                </div>
                            );
                        }
                        
                        return (
                             <div key={key}>
                                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">{label} {isRequired && '*'}</label>
                                <input
                                    type={key === 'dataExpiracao' ? 'date' : 'text'}
                                    name={key}
                                    value={formData[key as keyof typeof formData] || ''}
                                    onChange={handleChange}
                                    className="mt-1 block w-full p-2 border dark:border-dark-border rounded-md bg-white dark:bg-gray-800"
                                    required={isRequired}
                                />
                            </div>
                        );
                    })}
                </div>
                <div className="p-4 bg-gray-50 dark:bg-dark-card/50 border-t dark:border-dark-border flex justify-end gap-3 flex-shrink-0">
                    <button type="button" onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancelar</button>
                    <button type="submit" disabled={isSaving} className="bg-brand-primary text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400">
                        {isSaving ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </form>
        </div>
    );
};


const LicenseControl: React.FC<{ currentUser: User }> = ({ currentUser }) => {
    const [allLicenses, setAllLicenses] = useState<License[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingLicense, setEditingLicense] = useState<License | null>(null);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    
    // State for total licenses (from server)
    const [licenseTotals, setLicenseTotals] = useState<Record<string, number>>({});
    const [editingTotal, setEditingTotal] = useState<{ product: string; total: string } | null>(null);


    const loadLicenses = async () => {
        setLoading(true);
        try {
            const [licensesData, totalsData] = await Promise.all([
                getLicenses(currentUser),
                getLicenseTotals()
            ]);
            setAllLicenses(licensesData);
            setLicenseTotals(totalsData);
        } catch (error) {
            console.error("Failed to load license data", error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        loadLicenses();
    }, [currentUser]);

    const productNames = useMemo(() => {
        const names = new Set(allLicenses.map(l => l.produto));
        Object.keys(licenseTotals).forEach(p => names.add(p));
        return [...names].sort();
    }, [allLicenses, licenseTotals]);

    const filteredLicenses = useMemo(() => {
        let licenses = allLicenses;
        if (selectedProduct) {
            licenses = licenses.filter(l => l.produto === selectedProduct);
        }
        if (searchTerm) {
            const termLower = searchTerm.toLowerCase();
            licenses = licenses.filter(l => 
                l.usuario.toLowerCase().includes(termLower) || 
                l.chaveSerial.toLowerCase().includes(termLower) ||
                (l.tipoLicenca || '').toLowerCase().includes(termLower)
            );
        }
        return licenses;
    }, [allLicenses, selectedProduct, searchTerm]);

    const productStats = useMemo(() => {
        return productNames.map(product => {
            const used = allLicenses.filter(l => l.produto === product && l.approval_status !== 'rejected').length;
            const total = licenseTotals[product] ?? used; // Use saved total, fallback to used count
            const available = total - used;
            return { product, total, used, available };
        });
    }, [productNames, allLicenses, licenseTotals]);

    const handleOpenFormModal = (license: License | null = null) => {
        setEditingLicense(license);
        setIsFormModalOpen(true);
    };

    const handleCloseFormModal = () => {
        setEditingLicense(null);
        setIsFormModalOpen(false);
    };

    const handleSave = () => {
        loadLicenses();
        handleCloseFormModal();
    };

    const handleDelete = async (licenseId: number) => {
        if (window.confirm("Tem certeza que deseja excluir esta licença?")) {
            try {
                await deleteLicense(licenseId, currentUser.username);
                loadLicenses();
            } catch (error) {
                console.error("Failed to delete license", error);
            }
        }
    };
    
    const handleProductManagementSave = async (newProductNames: string[], renames: Record<string, string>) => {
        try {
            // First, handle renames
            for (const oldName in renames) {
                const newName = renames[oldName];
                await renameProduct(oldName, newName, currentUser.username);
                // Also update totals key
                if (licenseTotals[oldName] !== undefined) {
                    licenseTotals[newName] = licenseTotals[oldName];
                    delete licenseTotals[oldName];
                }
            }
    
            // Then, remove products that were deleted
            const currentProducts = new Set(productNames);
            const newProducts = new Set(newProductNames);
            const productsToDelete = [...currentProducts].filter(p => !newProducts.has(p));
            
            for (const productName of productsToDelete) {
                delete licenseTotals[productName];
            }
    
            // Finally, save the updated totals
            await saveLicenseTotals(licenseTotals, currentUser.username);
            
            // Reload everything
            loadLicenses();
// FIX: Changed caught error from 'any' to 'unknown' for improved type safety, which is a best practice.
        } catch (error: unknown) {
            // FIX: Safely handle the unknown error type to prevent a type error when calling alert.
            console.error("Failed to save product management changes", error);
            if (error instanceof Error) {
                alert(`Ocorreu um erro ao salvar as alterações nos produtos: ${error.message}`);
            } else {
                alert(`Ocorreu um erro ao salvar as alterações nos produtos: ${String(error)}`);
            }
        }
    };

    const handleSaveTotal = async () => {
        if (!editingTotal) return;
        const newTotal = parseInt(editingTotal.total, 10);
        if (isNaN(newTotal) || newTotal < 0) {
            alert("Por favor, insira um número válido.");
            return;
        }

        const updatedTotals = { ...licenseTotals, [editingTotal.product]: newTotal };

        try {
            await saveLicenseTotals(updatedTotals, currentUser.username);
            setLicenseTotals(updatedTotals);
            setEditingTotal(null);
        } catch (error) {
            console.error("Failed to save license totals", error);
            alert("Falha ao salvar o total de licenças.");
        }
    };
    
    const StatusBadge: React.FC<{ license: License }> = ({ license }) => {
        if (!license.approval_status || license.approval_status === 'approved') return null;

        const baseClasses = "ml-2 text-xs font-semibold px-2 py-0.5 rounded-full";
        if (license.approval_status === 'pending_approval') {
            return <span className={`${baseClasses} bg-yellow-200 text-yellow-800`}>Pendente</span>;
        }
        if (license.approval_status === 'rejected') {
            return (
                <span className={`${baseClasses} bg-red-200 text-red-800`} title={license.rejection_reason || 'Rejeitado'}>
                    <Icon name="Ban" size={12} className="inline-block mr-1" />
                    Rejeitado
                </span>
            );
        }
        return null;
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Icon name="LoaderCircle" className="animate-spin text-brand-primary" size={48} /></div>;
    }

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-full">
             {/* Left Panel - Product List */}
            <div className="lg:w-1/3 xl:w-1/4 bg-white dark:bg-dark-card p-4 rounded-lg shadow-md flex flex-col">
                <h3 className="text-xl font-bold text-brand-dark dark:text-dark-text-primary mb-4">Produtos</h3>
                <div className="flex gap-2 mb-4">
                    <button onClick={() => setIsProductModalOpen(true)} className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2 text-sm">
                        <Icon name="Settings2" size={16}/> Gerenciar
                    </button>
                    {currentUser.role === 'Admin' && (
                         <button onClick={() => setSelectedProduct(null)} className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${!selectedProduct ? 'bg-brand-primary text-white' : 'bg-gray-200 dark:bg-dark-bg text-gray-700 dark:text-dark-text-secondary'}`}>
                            Ver Todos
                        </button>
                    )}
                </div>
                <div className="overflow-y-auto flex-grow">
                    {productStats.map(stat => (
                         <div key={stat.product} onClick={() => setSelectedProduct(stat.product)} className={`p-3 rounded-lg cursor-pointer mb-2 transition-colors ${selectedProduct === stat.product ? 'bg-blue-100 dark:bg-blue-900/50' : 'hover:bg-gray-100 dark:hover:bg-dark-bg'}`}>
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-brand-secondary dark:text-dark-text-primary">{stat.product}</span>
                                <Icon name="ChevronRight" size={16} className="text-gray-400" />
                            </div>
                            <div className="flex items-center text-sm mt-2 text-gray-600 dark:text-dark-text-secondary">
                                <div className="flex items-center mr-3">
                                    <span className="mr-1 font-semibold">Total:</span>
                                    {editingTotal?.product === stat.product ? (
                                        <div className="flex items-center">
                                            <input
                                                type="number"
                                                value={editingTotal.total}
                                                onChange={(e) => setEditingTotal({ ...editingTotal, total: e.target.value })}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSaveTotal()}
                                                className="w-16 p-1 text-center border rounded bg-white dark:bg-gray-800"
                                                autoFocus
                                            />
                                            <button onClick={handleSaveTotal} className="ml-1 text-green-500"><Icon name="Check" size={18}/></button>
                                            <button onClick={() => setEditingTotal(null)} className="ml-1 text-red-500"><Icon name="X" size={18}/></button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center">
                                            <span>{stat.total}</span>
                                            {currentUser.role === 'Admin' && (
                                                <button onClick={(e) => { e.stopPropagation(); setEditingTotal({ product: stat.product, total: String(stat.total) }); }} className="ml-2 text-gray-400 hover:text-blue-500">
                                                    <Icon name="Pencil" size={12} />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <span className="mr-3">Usadas: <span className="font-bold py-0.5 px-2 bg-gray-200 dark:bg-gray-700 rounded-full text-xs">{stat.used}</span></span>
                                <span>Disponíveis: <span className={`font-bold ${stat.available < 0 ? 'text-red-500' : 'text-green-600'}`}>{stat.available}</span></span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Panel - License Details */}
            <div className="flex-1 bg-white dark:bg-dark-card p-4 rounded-lg shadow-md flex flex-col">
                 <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                    <h2 className="text-2xl font-bold text-brand-dark dark:text-dark-text-primary">
                        {selectedProduct ? `Licenças de ${selectedProduct}` : 'Todas as Licenças'}
                    </h2>
                    <button onClick={() => handleOpenFormModal()} className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 self-start sm:self-center">
                        <Icon name="CirclePlus" size={18}/> Nova Licença
                    </button>
                </div>
                <input
                    type="text"
                    placeholder="Buscar por usuário, chave serial, tipo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 border dark:border-dark-border rounded-md mb-4 bg-white dark:bg-gray-800"
                />
                <div className="overflow-x-auto flex-grow">
                     <table className="w-full text-sm text-left text-gray-700 dark:text-dark-text-secondary">
                        <thead className="text-xs text-gray-800 dark:text-dark-text-primary uppercase bg-gray-100 dark:bg-gray-900/50">
                            <tr>
                                {!selectedProduct && <th className="px-4 py-3">Produto</th>}
                                <th className="px-4 py-3">Usuário</th>
                                <th className="px-4 py-3">Chave Serial</th>
                                <th className="px-4 py-3">Tipo</th>
                                <th className="px-4 py-3">Expira em</th>
                                <th className="px-4 py-3">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLicenses.map(license => (
                                <tr key={license.id} className="bg-white dark:bg-dark-card border-b dark:border-dark-border hover:bg-gray-50 dark:hover:bg-gray-700">
                                    {!selectedProduct && <td className="px-4 py-4 font-medium text-gray-900 dark:text-dark-text-primary">{license.produto}</td>}
                                    <td className="px-4 py-4 flex items-center">{license.usuario} <StatusBadge license={license} /></td>
                                    <td className="px-4 py-4 font-mono text-xs">{license.chaveSerial}</td>
                                    <td className="px-4 py-4">{license.tipoLicenca}</td>
                                    <td className="px-4 py-4">{license.dataExpiracao}</td>
                                    <td className="px-4 py-4">
                                        {currentUser.role !== UserRole.User && (
                                            <div className="flex items-center gap-4">
                                                <button onClick={() => handleOpenFormModal(license)} className="text-blue-600 hover:text-blue-800"><Icon name="Pencil" size={16} /></button>
                                                <button onClick={() => handleDelete(license.id)} className="text-red-600 hover:text-red-800"><Icon name="Trash2" size={16} /></button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {filteredLicenses.length === 0 && <div className="text-center py-10 text-gray-500">Nenhuma licença encontrada.</div>}
                </div>
            </div>

            {isFormModalOpen && <LicenseFormModal license={editingLicense} onClose={handleCloseFormModal} onSave={handleSave} currentUser={currentUser} productNames={productNames} />}
            {isProductModalOpen && <ProductManagementModal initialProductNames={productNames} onClose={() => setIsProductModalOpen(false)} onSave={handleProductManagementSave} />}
        </div>
    );
};

export default LicenseControl;