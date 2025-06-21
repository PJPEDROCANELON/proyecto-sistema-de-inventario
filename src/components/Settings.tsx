import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  User as UserIcon, 
  Shield, 
  Bell, 
  Monitor,
  Database,
  Wifi,
  Save,
  RefreshCw,
  LogOut
} from 'lucide-react';
import { User } from '../types'; // Importar la interfaz User

interface SettingsProps {
  user: User | null;
  onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('account');
  const [settings, setSettings] = useState({
    general: {
      companyName: 'NeoTech Industries',
      timezone: 'UTC-8',
      dateFormat: 'MM/DD/YYYY',
      language: 'English'
    },
    notifications: {
      lowStockAlerts: true,
      systemMaintenance: true,
      securityAlerts: true,
      emailNotifications: false,
      pushNotifications: true
    },
    system: {
      autoBackup: true,
      backupFrequency: 'daily',
      apiRateLimit: '1000',
      sessionTimeout: '30'
    }
  });

  const tabs = [
    { id: 'account', label: 'Account', icon: UserIcon },
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'system', label: 'System', icon: Monitor },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'database', label: 'Database', icon: Database }
  ];

  const handleSettingChange = (
  category: string, 
  key: string, 
  value: string | boolean | number  // Tipos específicos en lugar de any
) => {
  setSettings(prev => ({
    ...prev,
    [category]: {
      ...prev[category as keyof typeof prev],
      [key]: value
    }
  }));
};

  const renderAccountSettings = () => (
    <div className="space-y-6">
      {user ? (
        <>
          <div className="bg-slate-800/30 rounded-xl border border-cyan-500/30 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-cyan-500/20 w-16 h-16 rounded-full flex items-center justify-center border border-cyan-500/30">
                <UserIcon className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{user.nombre}</h3>
                <p className="text-slate-400">{user.email}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <p className="text-slate-400 text-sm">User ID</p>
                <p className="text-white font-mono">{user.id}</p>
              </div>
              
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <p className="text-slate-400 text-sm">Member Since</p>
                <p className="text-white">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-colors duration-200"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <div className="bg-slate-800/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 border border-slate-700/50">
            <UserIcon className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-xl text-slate-300 mb-2">No User Information</h3>
          <p className="text-slate-500">Please sign in to view account details</p>
        </div>
      )}
    </div>
  );

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-slate-300 text-sm font-medium mb-2">
          Company Name
        </label>
        <input
          type="text"
          value={settings.general.companyName}
          onChange={(e) => handleSettingChange('general', 'companyName', e.target.value)}
          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">
            Timezone
          </label>
          <select
            value={settings.general.timezone}
            onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          >
            <option value="UTC-8">UTC-8 (Pacific)</option>
            <option value="UTC-5">UTC-5 (Eastern)</option>
            <option value="UTC+0">UTC+0 (GMT)</option>
            <option value="UTC+9">UTC+9 (JST)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">
            Date Format
          </label>
          <select
            value={settings.general.dateFormat}
            onChange={(e) => handleSettingChange('general', 'dateFormat', e.target.value)}
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white mb-4">Alert Preferences</h3>
      
      {Object.entries(settings.notifications).map(([key, value]) => (
        <div key={key} className="flex items-center justify-between p-4 bg-slate-700/20 rounded-lg">
          <div>
            <h4 className="text-white font-medium capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </h4>
            <p className="text-slate-400 text-sm mt-1">
              {key === 'lowStockAlerts' && 'Get notified when inventory levels are low'}
              {key === 'systemMaintenance' && 'Receive updates about system maintenance'}
              {key === 'securityAlerts' && 'Important security notifications'}
              {key === 'emailNotifications' && 'Send alerts to your email address'}
              {key === 'pushNotifications' && 'Browser push notifications'}
            </p>
          </div>
          <button
            onClick={() => handleSettingChange('notifications', key, !value)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
              value ? 'bg-cyan-500' : 'bg-slate-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                value ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      ))}
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">
            API Rate Limit (requests/hour)
          </label>
          <input
            type="number"
            value={settings.system.apiRateLimit}
            onChange={(e) => handleSettingChange('system', 'apiRateLimit', e.target.value)}
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
        </div>
        
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">
            Session Timeout (minutes)
          </label>
          <input
            type="number"
            value={settings.system.sessionTimeout}
            onChange={(e) => handleSettingChange('system', 'sessionTimeout', e.target.value)}
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
        </div>
      </div>
      
      <div className="flex items-center justify-between p-4 bg-slate-700/20 rounded-lg">
        <div>
          <h4 className="text-white font-medium">Automatic Backup</h4>
          <p className="text-slate-400 text-sm">Automatically backup system data</p>
        </div>
        <button
          onClick={() => handleSettingChange('system', 'autoBackup', !settings.system.autoBackup)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
            settings.system.autoBackup ? 'bg-cyan-500' : 'bg-slate-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
              settings.system.autoBackup ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">System Settings</h1>
        <p className="text-slate-400 mt-1">Configure your inventory management system</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 backdrop-blur-sm p-6">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-700/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 backdrop-blur-sm p-8">
            {activeTab === 'account' && renderAccountSettings()}
            {activeTab === 'general' && renderGeneralSettings()}
            {activeTab === 'notifications' && renderNotificationSettings()}
            {activeTab === 'system' && renderSystemSettings()}
            
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white">Security Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-slate-700/20 rounded-lg border border-slate-600/50">
                    <h4 className="text-white font-medium mb-2">Two-Factor Authentication</h4>
                    <p className="text-slate-400 text-sm mb-4">Add an extra layer of security</p>
                    <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                      Enable 2FA
                    </button>
                  </div>
                  <div className="p-6 bg-slate-700/20 rounded-lg border border-slate-600/50">
                    <h4 className="text-white font-medium mb-2">Password Policy</h4>
                    <p className="text-slate-400 text-sm mb-4">Enforce strong passwords</p>
                    <button className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                      Configure
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'database' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white">Database Management</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-slate-700/20 rounded-lg border border-slate-600/50 text-center">
                    <Database className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                    <h4 className="text-white font-medium mb-2">Backup Now</h4>
                    <button className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                      <RefreshCw className="w-4 h-4 inline mr-2" />
                      Backup
                    </button>
                  </div>
                  <div className="p-6 bg-slate-700/20 rounded-lg border border-slate-600/50 text-center">
                    <Wifi className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                    <h4 className="text-white font-medium mb-2">Connection Status</h4>
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      <span className="text-emerald-400 text-sm">Connected</span>
                    </div>
                  </div>
                  <div className="p-6 bg-slate-700/20 rounded-lg border border-slate-600/50 text-center">
                    <Monitor className="w-8 h-8 text-amber-400 mx-auto mb-3" />
                    <h4 className="text-white font-medium mb-2">Performance</h4>
                    <p className="text-amber-400 text-sm">97% Uptime</p>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button - Solo mostrar en pestañas que no sean Account */}
            {activeTab !== 'account' && (
              <div className="mt-8 pt-6 border-t border-slate-700/50">
                <div className="flex items-center justify-between">
                  <p className="text-slate-400 text-sm">
                    Changes are saved automatically
                  </p>
                  <button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2">
                    <Save className="w-5 h-5" />
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;