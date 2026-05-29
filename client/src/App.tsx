import { BottomBar } from './BottomBar';
import { EntryDetails } from './EntryDetails';
import { EntryList } from './EntryList';
import { TopBar } from './TopBar';
import { useFileExplorerLogic } from './appLogic';
import './App.css';

function App() {
  const fileExplorer = useFileExplorerLogic();

  return (
    <div className="flex col h-100pc">
      <TopBar
        currentPath={fileExplorer.currentPath}
        canGoNext={fileExplorer.history.canGoNext}
        canGoPrevious={fileExplorer.history.canGoPrevious}
        onGoToParent={fileExplorer.nav.goToParent}
        onGoNext={fileExplorer.nav.goNext}
        onGoPrevious={fileExplorer.nav.goPrevious}
      />
      <div className="main-area flex grow">
        <EntryList
          entries={fileExplorer.entries}
          selectedIndex={fileExplorer.selectedIndex}
          onSelectEntry={fileExplorer.selectEntryIndex}
          onOpenEntry={fileExplorer.openEntry}
        />
        <EntryDetails entry={fileExplorer.selectedEntry} />
      </div>
      <BottomBar
        status={fileExplorer.bottomBarStatus}
        isKeyboardHelpOpen={fileExplorer.keyboardHelp.isOpen}
        onOpenKeyboardHelp={fileExplorer.keyboardHelp.open}
        onCloseKeyboardHelp={fileExplorer.keyboardHelp.close}
      />
    </div>
  );
}

export default App;
