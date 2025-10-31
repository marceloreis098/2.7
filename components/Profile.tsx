import React, { useState } from 'react';
import { User } from '../types';
import { updateUser, generate2FASecret, enable2FA, disable2FA } from '../services/apiService';
import Icon from './common/Icon';

interface ProfileProps {
    currentUser: User;
    onProfileUpdate: (updatedUser: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ currentUser, onProfileUpdate }) => {
    const [formData, setFormData] = useState({
        realName: currentUser.realName,
        username: currentUser.username,
        email: currentUser.email,
        password: '',
        confirmPassword: '',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // 2FA State
    const [is2FAEnabled, setIs2FAEnabled] = useState(currentUser.is2FAEnabled);
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [secret, setSecret] = useState<string | null>(null);
    const [token, setToken] = useState('');
    const [error2FA, setError2FA] = useState('');
    const [loading2FA, setLoading2FA] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleProfileSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaveMessage(null);

        if (formData.password && formData.password !== formData.confirmPassword) {
            setSaveMessage({ type: 'error', text: 'As senhas não coincidem.' });
            return;
        }

        setIsSaving(true);
        try {
            const dataToUpdate: any = {
                id: currentUser.id,
                realName: formData.realName,
                username: formData.username,
                email: formData.email,
            };

            if (formData.password) {
                dataToUpdate.password = formData.password;
            }

            const updatedUser = await updateUser(dataToUpdate, currentUser.username);
            onProfileUpdate({ ...currentUser, ...updatedUser }); // Update state in App
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
            setSaveMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
        } catch (error: any) {
            setSaveMessage({ type: 'error', text: error.message || 'Falha ao atualizar o perfil.' });
        } finally {
            setIsSaving(false);
        }
    };
    
    // 2FA Handlers
    const handleGenerateSecret = async () => {
        setLoading2FA(true);
        setError2FA('');
        try {
            const data = await generate2FASecret(currentUser.id);
            setSecret(data.secret);
            setQrCodeUrl(data.qrCodeUrl);
        } catch (error: any) {
            setError2FA(error.message || 'Falha ao gerar o segredo 2FA.');
        } finally {
            setLoading2FA(false);
        }
    };

    const handleEnable2FA = async () => {
        if (!secret || token.length !== 6) {
            setError2FA("Por favor, insira um código válido de 6 dígitos.");
            return;
        }
        setLoading2FA(true);
        setError2FA('');
        try {
            await enable2FA(currentUser.id, secret, token);
            const updatedUser = { ...currentUser, is2FAEnabled: true };
            onProfileUpdate(updatedUser);
            setIs2FAEnabled(true);
            setQrCodeUrl(null);
            setSecret(null);
            setToken('');
            alert('2FA habilitado com sucesso!');
        } catch (error: any) {
             setError2FA(error.message || 'Código de verificação inválido.');
        } finally {
             setLoading2FA(false);
        }
    };

    const handleDisable2FA = async () => {
        if (!window.confirm("Tem certeza de que deseja desabilitar a autenticação de dois fatores?")) return;
        setLoading2FA(true);
        setError2FA('');
        try {
            await disable2FA(currentUser.id);
            const updatedUser = { ...currentUser, is2FAEnabled: false };
            onProfileUpdate(updatedUser);
            setIs2FAEnabled(false);
            alert('2FA desabilitado com sucesso!');
        } catch (error: any) {
            setError2FA(error.message || 'Falha ao desabilitar 2FA.');
        } finally {
            setLoading2FA(false);
        }
    };


    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-brand-dark dark:text-dark-text-primary">Meu Perfil</h2>

            {/* Profile Form */}
            <form onSubmit={handleProfileSave} className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-brand-secondary dark:text-dark-text-primary mb-4">Informações da Conta</h3>
                
                 {saveMessage && (
                    <div className={`p-3 mb-4 rounded-md text-sm ${saveMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {saveMessage.text}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Nome Real</label>
                        <input type="text" name="realName" value={formData.realName} onChange={handleChange} className="mt-1 w-full p-2 border dark:border-dark-border rounded-md bg-white dark:bg-gray-800"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Nome de Usuário</label>
                        <input type="text" name="username" value={formData.username} onChange={handleChange} className="mt-1 w-full p-2 border dark:border-dark-border rounded-md bg-white dark:bg-gray-800"/>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 w-full p-2 border dark:border-dark-border rounded-md bg-white dark:bg-gray-800"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Permissão</label>
                        <input type="text" value={currentUser.role} disabled className="mt-1 w-full p-2 border dark:border-dark-border rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"/>
                    </div>
                </div>
                
                <div className="mt-6 border-t dark:border-dark-border pt-6">
                    <h4 className="text-lg font-semibold text-brand-secondary dark:text-dark-text-primary mb-2">Alterar Senha</h4>
                    <p className="text-sm text-gray-500 dark:text-dark-text-secondary mb-4">Deixe os campos em branco para manter a senha atual.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Nova Senha</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} className="mt-1 w-full p-2 border dark:border-dark-border rounded-md bg-white dark:bg-gray-800"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Confirmar Nova Senha</label>
                            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="mt-1 w-full p-2 border dark:border-dark-border rounded-md bg-white dark:bg-gray-800"/>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button type="submit" disabled={isSaving} className="bg-brand-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                        {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </form>

            {/* 2FA Section */}
            <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-brand-secondary dark:text-dark-text-primary mb-2">Autenticação de Dois Fatores (2FA)</h3>
                <p className="text-sm text-gray-500 dark:text-dark-text-secondary mb-4">
                    Adicione uma camada extra de segurança à sua conta. Use um aplicativo como Google Authenticator ou Authy.
                </p>
                {error2FA && <p className="text-red-500 mb-4">{error2FA}</p>}
                
                {is2FAEnabled ? (
                    <div>
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold mb-4">
                            <Icon name="ShieldCheck" size={20} />
                            <span>Autenticação de dois fatores está ATIVADA.</span>
                        </div>
                        <button onClick={handleDisable2FA} disabled={loading2FA} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400">
                             {loading2FA ? 'Desativando...' : 'Desativar 2FA'}
                        </button>
                    </div>
                ) : qrCodeUrl ? (
                     <div className="flex flex-col md:flex-row gap-6 items-center">
                        <div className="text-center">
                            <p className="font-semibold mb-2">1. Escaneie o QR Code</p>
                            <div className="p-2 border dark:border-dark-border rounded-lg bg-white inline-block">
                               <img src={qrCodeUrl} alt="QR Code" />
                            </div>
                        </div>
                        <div className="flex-1">
                             <p className="font-semibold mb-2">2. Insira o código de 6 dígitos</p>
                             <p className="text-sm text-gray-500 dark:text-dark-text-secondary mb-4">Após escanear, insira o código gerado pelo seu aplicativo para confirmar.</p>
                             <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    placeholder="123456"
                                    maxLength={6}
                                    className="p-2 border dark:border-dark-border rounded-md w-32 text-center text-lg tracking-widest"
                                />
                                <button onClick={handleEnable2FA} disabled={loading2FA} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400">
                                    {loading2FA ? 'Verificando...' : 'Ativar e Verificar'}
                                </button>
                             </div>
                        </div>
                    </div>
                ) : (
                    <button onClick={handleGenerateSecret} disabled={loading2FA} className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                         {loading2FA ? 'Gerando...' : 'Iniciar Configuração do 2FA'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default Profile;