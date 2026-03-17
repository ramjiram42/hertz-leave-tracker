import React, { useState } from 'react';
import { AppProvider } from './store/AppContext';
import { Sidebar, Header } from './components/Layout';
import { CalendarView } from './components/CalendarView';
import { ManagerDashboard } from './components/ManagerDashboard';
import { SettingsView } from './components/SettingsView';
import { motion, AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <AppProvider>
      <div className="flex min-h-screen text-slate-900 overflow-hidden transition-colors duration-300">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          <Header />
          
          <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {activeTab === 'dashboard' && (
                  <ManagerDashboard />
                )}
                
                {activeTab === 'calendar' && (
                  <div className="pt-4 h-full">
                    <CalendarView />
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="h-full">
                    <SettingsView />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </AppProvider>
  );
};

export default App;
