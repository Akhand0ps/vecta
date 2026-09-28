import React, { useState, useEffect } from 'react';
import './index.css';
import { BoardProvider, useBoard } from './context/BoardContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { ToastContainer } from './components/ToastContainer';
import { Navbar } from './components/Navbar';
import { KanbanBoard } from './components/KanbanBoard';
import { CardDetailModal } from './components/CardDetailModal';
import { InviteModal } from './components/InviteModal';
import { LandingModal } from './components/LandingModal';
import { LandingPage } from './components/LandingPage';
import { BragModal } from './components/BragModal';
import { WorkflowTourModal } from './components/WorkflowTourModal';
import { soundService } from './services/soundService';

interface BoardAppProps {
  onBackToLanding: () => void;
}

function BoardApp({ onBackToLanding }: BoardAppProps) {
  const { currentUser, setIsBragOpen } = useBoard();
  const { addToast } = useToast();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isLandingOpen, setIsLandingOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      if ((e.key === 'b' || e.key === 'B') && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        soundService.playClick();
        setIsBragOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [setIsBragOpen]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('invite') || params.get('user') === 'sam') {
      addToast({
        title: `Welcome ${currentUser.name}`,
        description: 'You joined Project Board with live peer sync.',
        type: 'success',
        duration: 5000,
      });
    }
  }, [currentUser, addToast]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-app)' }}>
      {/* Top Navigation */}
      <Navbar
        onOpenInvite={() => setIsInviteOpen(true)}
        onOpenLanding={() => setIsLandingOpen(true)}
        onOpenTour={() => setIsTourOpen(true)}
        onBackToLanding={onBackToLanding}
      />

      {/* Main Kanban Workspace */}
      <KanbanBoard />

      {/* Centered Command Dossier Modal */}
      <CardDetailModal />

      {/* Invite Modal */}
      <InviteModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />

      {/* Landing / OTP Signup Simulator Modal */}
      <LandingModal isOpen={isLandingOpen} onClose={() => setIsLandingOpen(false)} />

      {/* 40-Second Architectural Workflow Tour Film Lightbox */}
      <WorkflowTourModal isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />
    </div>
  );
}

export function App() {
  const [view, setView] = useState<'landing' | 'board'>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('invite') || params.get('user') || params.get('board') === 'true') {
      return 'board';
    }
    return 'landing';
  });

  const handleEnterBoard = () => {
    window.history.pushState(null, '', '/?board=true');
    setView('board');
  };

  const handleBackToLanding = () => {
    window.history.pushState(null, '', '/');
    setView('landing');
  };

  return (
    <ToastProvider>
      <BoardProvider>
        {view === 'landing' ? (
          <LandingPage onEnterBoard={handleEnterBoard} />
        ) : (
          <>
            <BoardApp onBackToLanding={handleBackToLanding} />
            {/* Brag Modal only for board internal shortcuts */}
            <BragModal />
          </>
        )}

        {/* Global Interactive Toast Notification Dock */}
        <ToastContainer />
      </BoardProvider>
    </ToastProvider>
  );
}

export default App;