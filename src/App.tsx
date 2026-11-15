// Screen switcher. All case state lives in useCase; screens get the case, `now` and callbacks.

import { useState } from 'react';
import { CaseScreen } from './ui/CaseScreen';
import { CatchupScreen } from './ui/CatchupScreen';
import { LogScreen } from './ui/LogScreen';
import { ResyncSheet } from './ui/ResyncSheet';
import { StartScreen } from './ui/StartScreen';
import { useCase } from './useCase';

type Screen = 'start' | 'catchup' | 'case' | 'log';

export default function App() {
  const c = useCase();
  const [screen, setScreen] = useState<Screen>(c.current ? 'case' : 'start');
  const [resyncing, setResyncing] = useState(false);
  const s = c.current;

  if (screen === 'catchup') {
    return (
      <CatchupScreen
        now={c.now}
        onBack={() => setScreen('start')}
        onStart={(elapsed, pattern, priors) => (c.startCatchup(elapsed, pattern, priors), setScreen('case'))}
      />
    );
  }

  // The log shows the running case after Summary, or Last case from the start screen.
  const logCase = screen === 'log' ? (s ?? c.last) : null;
  if (logCase) {
    return (
      <LogScreen
        s={logCase}
        now={c.now}
        running={!!s}
        onBack={() => setScreen(s ? 'case' : 'start')}
        onNewCase={() => (c.newCase(), setScreen('start'))}
      />
    );
  }

  if (screen === 'case' && s) {
    return (
      <>
        <CaseScreen
          s={s}
          now={c.now}
          onTap={c.tap}
          onTag={c.tagEntry}
          onRestartCycle={c.restartCycle}
          onUndo={c.undo}
          onResync={() => setResyncing(true)}
          onEnd={() => setScreen('log')}
        />
        {resyncing && (
          <ResyncSheet s={s} now={c.now} onSet={(m) => (c.resync(m), setResyncing(false))} onCancel={() => setResyncing(false)} />
        )}
      </>
    );
  }

  return (
    <StartScreen
      now={c.now}
      last={c.last}
      onStart={() => (c.startNow(), setScreen('case'))}
      onCatchup={() => setScreen('catchup')}
      onLast={() => setScreen('log')}
    />
  );
}
