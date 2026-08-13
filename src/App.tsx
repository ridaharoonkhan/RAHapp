import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { QuizForm } from './components/QuizForm';
import { ResultsView } from './components/ResultsView';
import { RegisterView } from './components/RegisterView';
import { LoginView } from './components/LoginView';
import { JournalView } from './components/JournalView';
import { JourneyDashboard } from './components/JourneyDashboard';
import { IkigaiAnalysisResult, StudentQuizAnswers, RegisteredUser } from './types';
import { AlertCircle } from 'lucide-react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';

function MainApp() {
  const [currentTab, setCurrentTab] = useState<'register' | 'login' | 'dashboard' | 'journal' | 'quiz' | 'results'>('login');
  const [registeredUser, setRegisteredUser] = useState<RegisteredUser | null>(null);
  const [currentAnswers, setCurrentAnswers] = useState<StudentQuizAnswers | null>(null);
  const [result, setResult] = useState<IkigaiAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { t, lang } = useLanguage();

  useEffect(() => {
    fetch('/api/auth/me').then(async response => {
      if (!response.ok) return;
      const { user } = await response.json(); setRegisteredUser(user); setCurrentTab('dashboard');
    }).catch(() => undefined);
  }, []);

  const handleRegistrationComplete = () => {
    setRegisteredUser(null);
    setCurrentTab('login');
  };
  const handleLogin = (user: RegisteredUser) => {
    setRegisteredUser(user);
    setCurrentTab('dashboard');
  };
  const handleLogout = async () => { await fetch('/api/auth/logout', { method: 'POST' }); setRegisteredUser(null); setResult(null); setCurrentTab('login'); };

  const handleQuizSubmit = async (answers: StudentQuizAnswers) => {
    setIsLoading(true);
    setErrorMessage(null);
    setCurrentAnswers(answers);

    try {
      const response = await fetch('/api/analyze-ikigai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...answers, language: lang }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data: IkigaiAnalysisResult = await response.json();
      setResult(data);
      setCurrentTab('results');
    } catch (err: any) {
      console.error("Failed to analyze ikigai:", err);
      setErrorMessage(
        "Could not generate live analysis at this moment. Please check your network or retry."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setErrorMessage(null);
    setCurrentTab('quiz');
  };

  const handleSelectTab = (tab: 'register' | 'login' | 'dashboard' | 'journal' | 'quiz') => {
    if ((tab === 'quiz' || tab === 'dashboard' || tab === 'journal') && !registeredUser) {
      setCurrentTab('login');
      return;
    }
    if (tab === 'quiz' && result) {
      setCurrentTab('results');
    } else {
      setCurrentTab(tab);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-slate-900 font-sans flex flex-col antialiased">
      <Header
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        registeredUser={registeredUser}
        onLogout={handleLogout}
      />

      <main className="rah-theme flex-1 max-w-6xl w-full mx-auto px-4 py-8 sm:px-8">
        {currentTab === 'register' && (
          <RegisterView
            onRegistrationComplete={handleRegistrationComplete}
            onNavigateToQuiz={() => setCurrentTab('quiz')}
          />
        )}
        {currentTab === 'login' && <LoginView onLogin={handleLogin} onRegister={() => setCurrentTab('register')} />}
        {currentTab === 'dashboard' && registeredUser && <JourneyDashboard user={registeredUser} onGo={handleSelectTab} />}
        {currentTab === 'journal' && registeredUser && <JournalView />}

        {currentTab === 'quiz' && (
          <div className="space-y-6">
            {errorMessage && (
              <div className="max-w-2xl mx-auto flex items-center gap-2.5 rounded-xl bg-rose-50 p-4 text-xs font-semibold text-rose-800 border border-rose-200 shadow-xs">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <QuizForm
              onSubmit={handleQuizSubmit}
              isLoading={isLoading}
              registeredUser={registeredUser}
            />
          </div>
        )}

        {currentTab === 'results' && result && currentAnswers && (
          <ResultsView
            result={result}
            answers={currentAnswers}
            onReset={handleReset}
          />
        )}
      </main>

      <footer className="border-t border-white/10 bg-[#0c0c0c] py-6 text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white bg-white/10 px-2.5 py-1 rounded-md border border-white/10">{t('footer.title')}</span>
            <span className="text-slate-400 font-medium">{t('footer.tag')}</span>
          </div>
          <p className="text-slate-400 font-medium">
            {t('footer.powered')}
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}
