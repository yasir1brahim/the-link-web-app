# QA Features Layout Toggle Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow developers to toggle QA features (Owner Deliverables, QA Planner) between appearing in a dedicated tab vs. the Compass chat sidebar.

**Architecture:** Extract shared QA state/logic into a custom hook `useInspectionQA`. Add a local constant `USE_TABBED_QA_LAYOUT` to control which layout renders. When false, Chat component uses the hook and shows QA buttons in ChatSidebar.

**Tech Stack:** React, Custom Hooks, Feature Flags

---

## Task 1: Create the hooks directory

**Files:**
- Create: `src/components/SpecGpt/hooks/` (directory)

**Step 1: Create directory**

```bash
mkdir -p src/components/SpecGpt/hooks
```

**Step 2: Commit**

```bash
git add src/components/SpecGpt/hooks
git commit -m "chore: create hooks directory for SpecGpt"
```

---

## Task 2: Create useInspectionQA hook

**Files:**
- Create: `src/components/SpecGpt/hooks/useInspectionQA.js`

**Step 1: Create the hook file with all state and handlers**

Create `src/components/SpecGpt/hooks/useInspectionQA.js`:

```javascript
import { useState, useEffect, useCallback } from 'react';
import {
  fetchMostRecentLog,
  generateAiLog,
  generateQAPlannerLog,
} from '../../utils/apiUtils';

/**
 * Shared hook for QA feature state and handlers.
 * Used by both InspectionQA (tabbed mode) and Chat (sidebar mode).
 *
 * This hook extracts the state and logic from InspectionQA/index.js
 * so it can be shared with ChatSidebar in sidebar mode.
 */
export function useInspectionQA(projectId, projectVersionId) {
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [showLogViewer, setShowLogViewer] = useState(false);
  const [currentLogData, setCurrentLogData] = useState(null);
  const [currentLogType, setCurrentLogType] = useState(null);
  const [isLoadingLog, setIsLoadingLog] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [showQAPlannerModal, setShowQAPlannerModal] = useState(false);
  const [isGeneratingQALogs, setIsGeneratingQALogs] = useState(false);

  // Poll for log updates when log_status is PROCESSING
  useEffect(() => {
    let pollInterval;

    if (showLogViewer && currentLogData && currentLogData.log_status === 'PROCESSING') {
      pollInterval = setInterval(async () => {
        try {
          const updatedLog = await fetchMostRecentLog(projectId, projectVersionId, currentLogType);
          if (updatedLog && updatedLog.id === currentLogData.id) {
            setCurrentLogData(updatedLog);
            // Stop polling if log is no longer processing
            if (updatedLog.log_status !== 'PROCESSING') {
              clearInterval(pollInterval);
            }
          }
        } catch (error) {
          console.error('Error polling for log updates:', error);
        }
      }, 3000);
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [showLogViewer, currentLogData, projectId, projectVersionId, currentLogType]);

  // Handler: Show Owner Deliverables Logs
  const onShowOwnerDeliverablesLogsClick = useCallback(async () => {
    setIsLoadingLog(true);
    setCurrentLogType('owner_deliverables_log');
    setSelectedFeature('owner-deliverables');

    try {
      // Try to get the most recent log
      const mostRecentLog = await fetchMostRecentLog(projectId, projectVersionId, 'owner_deliverables');

      if (mostRecentLog) {
        // Show the log regardless of status (PROCESSING, SUCCESS, or FAILURE)
        setCurrentLogData(mostRecentLog);
        setShowLogViewer(true);
      } else {
        // No log exists, start generation
        const result = await generateAiLog(projectId, projectVersionId, 'owner_deliverables_log');
        if (result && result.id) {
          // Create a placeholder log data for the new generation
          const newLogData = {
            id: result.id,
            log_table: '',
            created_at: new Date().toISOString(),
            log_status: 'PROCESSING'
          };
          setCurrentLogData(newLogData);
          setShowLogViewer(true);
        }
      }
    } catch (error) {
      console.error('Error handling owner deliverables log:', error);
    } finally {
      setIsLoadingLog(false);
    }
  }, [projectId, projectVersionId]);

  // Handler: Show QA Planner
  const onShowQAPlannerClick = useCallback(async () => {
    setIsLoadingLog(true);
    setCurrentLogType('qa_planner');
    setSelectedFeature('qa-planner');

    try {
      // Try to get the most recent QA planner log
      const mostRecentLog = await fetchMostRecentLog(projectId, projectVersionId, 'qa_planner');

      if (mostRecentLog) {
        // Show the log regardless of status
        setCurrentLogData(mostRecentLog);
        setShowLogViewer(true);
      } else {
        // No log exists, show the modal for option selection
        setShowQAPlannerModal(true);
      }
    } catch (error) {
      console.error('Error handling QA planner log:', error);
      // On error, fall back to showing the modal
      setShowQAPlannerModal(true);
    } finally {
      setIsLoadingLog(false);
    }
  }, [projectId, projectVersionId]);

  // Handler: QA Planner Submit (from modal)
  const onQAPlannerSubmit = useCallback(async (selectedOptions) => {
    setIsLoading(true);
    setIsGeneratingQALogs(true);
    setShowQAPlannerModal(false);

    try {
      const result = await generateQAPlannerLog(projectId, projectVersionId, selectedOptions);
      if (result && result.id) {
        // Create log data for the new QA planner generation
        const newLogData = {
          id: result.id,
          log_table: '',
          log_data: [],
          created_at: new Date().toISOString(),
          log_status: 'PROCESSING',
          qa_options_selected: selectedOptions,
          completion_status: selectedOptions.reduce((acc, option) => {
            acc[option] = 'PENDING';
            return acc;
          }, {})
        };
        setCurrentLogData(newLogData);
        setCurrentLogType('qa_planner');
        setShowLogViewer(true);
      }
    } catch (error) {
      console.error('Error handling QA Planner submission:', error);
    } finally {
      setIsGeneratingQALogs(false);
      setIsLoading(false);
    }
  }, [projectId, projectVersionId]);

  // Handler: QA Planner Regenerate
  const onQAPlannerRegenerate = useCallback(() => {
    setShowLogViewer(false);
    setShowQAPlannerModal(true);
  }, []);

  // Handler: Back from LogViewer
  const onBackFromLogViewer = useCallback(() => {
    setShowLogViewer(false);
    setCurrentLogData(null);
    setCurrentLogType(null);
    setSelectedFeature(null);
  }, []);

  return {
    // State
    isLoading,
    showLogViewer,
    currentLogData,
    currentLogType,
    isLoadingLog,
    selectedFeature,
    showQAPlannerModal,
    isGeneratingQALogs,

    // State setters (for direct control)
    setIsLoading,
    setShowLogViewer,
    setShowQAPlannerModal,

    // Handlers
    onShowOwnerDeliverablesLogsClick,
    onShowQAPlannerClick,
    onQAPlannerSubmit,
    onQAPlannerRegenerate,
    onBackFromLogViewer,
  };
}

export default useInspectionQA;
```

**Step 2: Verify the file was created correctly**

```bash
cat src/components/SpecGpt/hooks/useInspectionQA.js | head -20
```

Expected: First 20 lines of the hook file

**Step 3: Commit**

```bash
git add src/components/SpecGpt/hooks/useInspectionQA.js
git commit -m "feat: add useInspectionQA hook for shared QA state management"
```

---

## Task 3: Add USE_TABBED_QA_LAYOUT constant to ProjectLogs.jsx

**Files:**
- Modify: `src/components/ProjectLogs/ProjectLogs.jsx:1-10` (add constant near top)
- Modify: `src/components/ProjectLogs/ProjectLogs.jsx:317-330` (pass prop to ProjectLogsHeaderTop)
- Modify: `src/components/ProjectLogs/ProjectLogs.jsx:1989-2008` (conditional InspectionQA render)

**Step 1: Add the constant after imports**

In `src/components/ProjectLogs/ProjectLogs.jsx`, after all imports (around line 45, before `const ProjectLogs`), add:

```javascript
// Toggle between tabbed layout (true) and sidebar layout (false)
// Set to false to show QA features in Compass sidebar instead of separate tab
const USE_TABBED_QA_LAYOUT = false;
```

**Step 2: Import and initialize the shared hook**

1. Add the import near the top of the file with the other component imports:

```javascript
import { useInspectionQA } from '../SpecGpt/hooks/useInspectionQA';
```

2. Inside the `ProjectLogs` component, initialize the hook once (place this alongside the other hooks/state declarations so React preserves order):

```javascript
const inspectionQA = useInspectionQA(projectId, projectVersionId);
```

**Step 3: Pass useQaTabbedLayout prop to ProjectLogsHeaderTop**

Find the `<ProjectLogsHeaderTop` component (around line 317) and add the prop:

```javascript
<ProjectLogsHeaderTop
  teamId={teamId}
  isSpecGptFlagActive={isSpecGptFlagActive}
  isInspectionLogFeatureFlagActive={isInspectionLogFlagActive(teamId)}
  isQaPlannerFlagActive={isQaPlannerFlagActive(teamId)}
  isSpecCenteredViewFlagActive={isSpecCenteredViewFlagActive(teamId)}
  activeTab={activeTab}
  setActiveTab={setActiveTab}
  useQaTabbedLayout={USE_TABBED_QA_LAYOUT}
/>
```

**Step 4: Pass QA props to Chat component**

Find where `<Chat` is rendered (in the 'assistant' tab section) and add these props:

```javascript
<Chat
  projectId={projectId}
  projectVersionId={projectVersionId}
  chatSessionId={chatSessionId}
  setChatSessionId={setChatSessionId}
  messages={messages}
  setMessages={setMessages}
  chatHistory={chatHistory}
  setChatHistory={setChatHistory}
  isLoadingMessage={isLoadingMessage}
  setIsLoadingMessage={setIsLoadingMessage}
  userInput={userInput}
  setUserInput={setUserInput}
  isChatEnabled={isChatEnabled}
  setIsChatEnabled={setIsChatEnabled}
  teamId={teamId}
  useQaTabbedLayout={USE_TABBED_QA_LAYOUT}
  inspectionQA={inspectionQA}
  isInspectionLogFeatureFlagActive={isInspectionLogFlagActive(teamId)}
  isQaPlannerFlagActive={isQaPlannerFlagActive(teamId)}
/>
```

**Step 5: Wrap InspectionQA render with conditional and pass shared props**

Find the InspectionQA render block (around line 1989) and wrap it:

```javascript
{activeTab == 'inspection-qa' && USE_TABBED_QA_LAYOUT &&
  <>
  <div className="compass-chat-viewport">
    <ProcessingIndicator
      documentIsProcessing={documentIsBeingEmbedded}
      documentData={documentData}
      toggleDocumentStatusModal={toggleSpecGptProcessingModal}
      indicatorText={"Assistant is processing your documents..."}
    />
    <ChakraProvider>
      <InspectionQA
        projectId={projectId}
        projectVersionId={projectVersionId}
        isInspectionLogFeatureFlagActive={isInspectionLogFlagActive(teamId)}
        isQaPlannerFlagActive={isQaPlannerFlagActive(teamId)}
        inspectionQA={inspectionQA}
      />
    </ChakraProvider>
    </div>
  </>
}
```

**Step 6: Verify build passes**

```bash
npm run build
```

Expected: Build completes without errors

**Step 7: Commit**

```bash
git add src/components/ProjectLogs/ProjectLogs.jsx
git commit -m "feat: add USE_TABBED_QA_LAYOUT constant and pass props to children"
```

---

## Task 4: Update ProjectLogsHeaderTop to conditionally render tab

**Files:**
- Modify: `src/components/shared/Header/ProjectLogsHeaderTop.jsx:11` (add prop)
- Modify: `src/components/shared/Header/ProjectLogsHeaderTop.jsx:56-74` (conditional render)

**Step 1: Add useQaTabbedLayout to props destructuring**

In `src/components/shared/Header/ProjectLogsHeaderTop.jsx`, update the props (line 11):

```javascript
const ProjectLogsHeaderTop = (props) => {
```

The component already uses `props.` notation, so no destructuring needed.

**Step 2: Update conditional for Inspection & QA tab**

Find the Inspection & QA tab button (around line 56) and update the condition:

```javascript
{props.useQaTabbedLayout && (props.isInspectionLogFeatureFlagActive || props.isQaPlannerFlagActive) && (
```

This ensures the tab only appears when `useQaTabbedLayout` is true AND at least one feature flag is active.

**Step 3: Verify build passes**

```bash
npm run build
```

Expected: Build completes without errors

**Step 4: Commit**

```bash
git add src/components/shared/Header/ProjectLogsHeaderTop.jsx
git commit -m "feat: conditionally render Inspection & QA tab based on layout flag"
```

---

## Task 5: Update ChatSidebar to accept QA button props

**Files:**
- Modify: `src/components/SpecGpt/components/Chat/ChatSidebar/index.js`

**Step 1: Add new props to ChatSidebar**

Update the component to accept and render QA buttons. Replace the entire file:

```javascript
import styles from './ChatSidebar.module.css';

function ChatSidebar({
  chatHistory,
  onClickChatLink,
  onNewChatClick,
  // New QA props (optional - only passed in sidebar mode)
  onShowOwnerDeliverablesLogsClick,
  onShowQAPlannerClick,
  isInspectionLogFeatureFlagActive,
  isQaPlannerFlagActive,
  selectedFeature,
  isLoadingLog,
}) {
  const hasQAFeatures = !!(onShowOwnerDeliverablesLogsClick || onShowQAPlannerClick);

  return (
    <div className={styles.sidebarContainer}>
      <div className={styles.sidebarHeader}>
        <h2 className={styles.sidebarTitle}>Assistant</h2>
        <button
          className={styles.newChatButton}
          onClick={onNewChatClick}
        >
          New Chat
        </button>
      </div>

      {/* QA Feature Buttons - only shown in sidebar mode */}
      {hasQAFeatures && (
        <div className={styles.qaButtonsContainer}>
          {isInspectionLogFeatureFlagActive && (
            <button
              className={`${styles.qaButton} ${selectedFeature === 'owner-deliverables' ? styles.qaButtonActive : ''}`}
              onClick={onShowOwnerDeliverablesLogsClick}
              disabled={isLoadingLog}
            >
              {isLoadingLog && selectedFeature === 'owner-deliverables' ? 'Loading...' : 'Owner Deliverables'}
            </button>
          )}
          {isQaPlannerFlagActive && (
            <button
              className={`${styles.qaButton} ${selectedFeature === 'qa-planner' ? styles.qaButtonActive : ''}`}
              onClick={onShowQAPlannerClick}
              disabled={isLoadingLog}
            >
              {isLoadingLog && selectedFeature === 'qa-planner' ? 'Loading...' : 'QA Planner'}
            </button>
          )}
        </div>
      )}

      <div className={styles.chatHistoryContainer}>
        {chatHistory && chatHistory.length > 0 ? (
          chatHistory.map((group, groupIndex) => (
            <div key={groupIndex} className={styles.chatHistoryGroup}>
              <div className={styles.chatHistoryDate}>{group.date}</div>
              {group.sessions.map((session) => (
                <button
                  key={session.id}
                  className={styles.chatHistoryItem}
                  onClick={() => onClickChatLink(session.id)}
                >
                  {session.title || 'Untitled Chat'}
                </button>
              ))}
            </div>
          ))
        ) : (
          <div className={styles.emptyHistory}>No chat history</div>
        )}
      </div>

      <div className={styles.disclaimer}>
        <p>AI can make mistakes. Verify important information.</p>
      </div>
    </div>
  );
}

export default ChatSidebar;
```

**Step 2: Add CSS for QA buttons**

Add to `src/components/SpecGpt/components/Chat/ChatSidebar/ChatSidebar.module.css`:

```css
.qaButtonsContainer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
}

.qaButton {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;
}

.qaButton:hover:not(:disabled) {
  background-color: #e8e8e8;
  border-color: #ccc;
}

.qaButton:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.qaButtonActive {
  background-color: #007bff;
  border-color: #007bff;
  color: white;
}

.qaButtonActive:hover:not(:disabled) {
  background-color: #0056b3;
  border-color: #0056b3;
}
```

**Step 3: Verify build passes**

```bash
npm run build
```

Expected: Build completes without errors

**Step 4: Commit**

```bash
git add src/components/SpecGpt/components/Chat/ChatSidebar/
git commit -m "feat: add QA button support to ChatSidebar"
```

---

## Task 6: Update Chat component to consume shared QA state in sidebar mode

**Files:**
- Modify: `src/components/SpecGpt/components/Chat/index.js`

**Step 1: Ensure supporting imports are present**

Add (or confirm) the following imports near the top of the file:

```javascript
import LogViewer from './LogViewer';
import QAPlannerModal from './QAPlannerModal';
import { ChakraProvider } from '@chakra-ui/react';
```

**Step 2: Add new props to component signature**

Update the component props (around line 22) to accept the shared QA state object:

```javascript
function Chat({
  projectId,
  projectVersionId,
  chatSessionId,
  setChatSessionId,
  messages,
  setMessages,
  chatHistory,
  setChatHistory,
  isLoadingMessage,
  setIsLoadingMessage,
  userInput,
  setUserInput,
  isChatEnabled,
  setIsChatEnabled,
  teamId,
  // New props for sidebar QA mode
  useQaTabbedLayout = true,
  inspectionQA = null,
  isInspectionLogFeatureFlagActive = false,
  isQaPlannerFlagActive = false,
}) {
```

**Step 3: Derive sidebar QA helpers from the shared prop**

Right after the component's local state declarations (around line 50), add:

```javascript
const isSidebarMode = !useQaTabbedLayout;
const qaSidebarProps = isSidebarMode
  ? {
      onShowOwnerDeliverablesLogsClick: inspectionQA?.onShowOwnerDeliverablesLogsClick,
      onShowQAPlannerClick: inspectionQA?.onShowQAPlannerClick,
      isInspectionLogFeatureFlagActive,
      isQaPlannerFlagActive,
      selectedFeature: inspectionQA?.selectedFeature,
      isLoadingLog: inspectionQA?.isLoadingLog,
    }
  : {};
```

Also pull out the values needed for the LogViewer/Modal:

```javascript
const qaViewerState = {
  showLogViewer: inspectionQA?.showLogViewer,
  currentLogData: inspectionQA?.currentLogData,
  currentLogType: inspectionQA?.currentLogType,
  onBackFromLogViewer: inspectionQA?.onBackFromLogViewer,
  onQAPlannerRegenerate: inspectionQA?.onQAPlannerRegenerate,
  showQAPlannerModal: inspectionQA?.showQAPlannerModal,
  setShowQAPlannerModal: inspectionQA?.setShowQAPlannerModal,
  onQAPlannerSubmit: inspectionQA?.onQAPlannerSubmit,
  isGeneratingQALogs: inspectionQA?.isGeneratingQALogs,
};
```

**Step 4: Update ChatSidebar props in both desktop and mobile renders**

Find the desktop ChatSidebar render (around line 313) and update the JSX to spread the derived props:

```javascript
<ChatSidebar
  chatHistory={chatHistory}
  onClickChatLink={onClickChatLink}
  onNewChatClick={onNewChatClick}
  {...qaSidebarProps}
/>
```

Do the same for the mobile drawer ChatSidebar (around line 340).

**Step 5: Add LogViewer and QAPlannerModal renders**

Before the closing `</div>` of the main container, render the viewer and modal only in sidebar mode:

```javascript
{/* LogViewer - shown when viewing a log in sidebar mode */}
{isSidebarMode && qaViewerState.showLogViewer && qaViewerState.currentLogData && (
  <ChakraProvider>
    <div className={styles.logViewerOverlay}>
      <LogViewer
        projectId={projectId}
        projectVersionId={projectVersionId}
        initialLogData={qaViewerState.currentLogData}
        logType={qaViewerState.currentLogType}
        onBack={qaViewerState.onBackFromLogViewer}
        onQAPlannerRegenerate={
          qaViewerState.currentLogType === 'qa_planner' ? qaViewerState.onQAPlannerRegenerate : null
        }
      />
    </div>
  </ChakraProvider>
)}

{/* QA Planner Modal */}
{isSidebarMode && (
  <QAPlannerModal
    isOpen={qaViewerState.showQAPlannerModal || false}
    onClose={() => qaViewerState.setShowQAPlannerModal?.(false)}
    onSubmit={qaViewerState.onQAPlannerSubmit}
    isLoading={qaViewerState.isGeneratingQALogs || false}
  />
)}
```

**Step 6: Add CSS for log viewer overlay**

Add to `src/components/SpecGpt/components/Chat/Chat.module.css`:

```css
.logViewerOverlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  z-index: 10;
  overflow: auto;
}
```

**Step 7: Verify build passes**

```bash
npm run build
```

Expected: Build completes without errors

**Step 8: Commit**

```bash
git add src/components/SpecGpt/components/Chat/
git commit -m "feat: wire shared QA sidebar state through Chat component"
```

---

## Task 7: Refactor InspectionQA to consume shared QA state

**Files:**
- Modify: `src/components/SpecGpt/components/InspectionQA/index.js`

**Step 1: Replace inline hook call with shared prop**

Update `src/components/SpecGpt/components/InspectionQA/index.js` so the component relies on the shared state passed in from `ProjectLogs`:

```javascript
import { ChakraProvider } from '@chakra-ui/react';
import InspectionQASidebar from './InspectionQASidebar';
import LogViewer from '../Chat/LogViewer';
import QAPlannerModal from '../Chat/QAPlannerModal';

function InspectionQA({
  projectId,
  projectVersionId,
  isInspectionLogFeatureFlagActive,
  isQaPlannerFlagActive,
  inspectionQA,
}) {
  const {
    showLogViewer,
    currentLogData,
    currentLogType,
    isLoadingLog,
    selectedFeature,
    showQAPlannerModal,
    isGeneratingQALogs,
    setShowQAPlannerModal,
    onShowOwnerDeliverablesLogsClick,
    onShowQAPlannerClick,
    onQAPlannerSubmit,
    onQAPlannerRegenerate,
    onBackFromLogViewer,
  } = inspectionQA || {};

  if (showLogViewer && currentLogData) {
    return (
      <ChakraProvider>
        <LogViewer
          projectId={projectId}
          projectVersionId={projectVersionId}
          initialLogData={currentLogData}
          logType={currentLogType}
          onBack={onBackFromLogViewer}
          onQAPlannerRegenerate={currentLogType === 'qa_planner' ? onQAPlannerRegenerate : null}
        />
        <QAPlannerModal
          isOpen={showQAPlannerModal}
          onClose={() => setShowQAPlannerModal?.(false)}
          onSubmit={onQAPlannerSubmit}
          isLoading={isGeneratingQALogs}
        />
      </ChakraProvider>
    );
  }

  return (
    <ChakraProvider>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <InspectionQASidebar
          onShowOwnerDeliverablesLogsClick={onShowOwnerDeliverablesLogsClick}
          onShowQAPlannerClick={onShowQAPlannerClick}
          isInspectionLogFeatureFlagActive={isInspectionLogFeatureFlagActive}
          isQaPlannerFlagActive={isQaPlannerFlagActive}
          isSidebarExpanded={false}
          selectedFeature={selectedFeature}
          isLoadingLog={isLoadingLog}
        />
      </div>
      <QAPlannerModal
        isOpen={showQAPlannerModal}
        onClose={() => setShowQAPlannerModal?.(false)}
        onSubmit={onQAPlannerSubmit}
        isLoading={isGeneratingQALogs}
      />
    </ChakraProvider>
  );
}

export default InspectionQA;
```

**Step 2: Verify build passes**

```bash
npm run build
```

Expected: Build completes without errors

**Step 3: Commit**

```bash
git add src/components/SpecGpt/components/InspectionQA/index.js
git commit -m "refactor: InspectionQA consumes shared QA state from ProjectLogs"
```

---

## Task 8: Manual testing

**Step 1: Test tabbed mode (USE_TABBED_QA_LAYOUT = true)**

1. Set `USE_TABBED_QA_LAYOUT = true` in `ProjectLogs.jsx`
2. Run: `npm run dev`
3. Navigate to a project with QA feature flags enabled
4. Verify:
   - "Inspection & QA" tab appears in header
   - Clicking tab shows InspectionQA component
   - Owner Deliverables and QA Planner buttons work
   - Compass sidebar does NOT show QA buttons

**Step 2: Test sidebar mode (USE_TABBED_QA_LAYOUT = false)**

1. Set `USE_TABBED_QA_LAYOUT = false` in `ProjectLogs.jsx`
2. Refresh page
3. Verify:
   - "Inspection & QA" tab does NOT appear in header
   - Assistant tab shows Compass chat
   - ChatSidebar shows Owner Deliverables and QA Planner buttons
   - Clicking buttons shows LogViewer in place of chat
   - Back button returns to chat

**Step 3: Test QA Planner workflow in sidebar mode**

1. With `USE_TABBED_QA_LAYOUT = false`
2. Click "QA Planner" in sidebar
3. If no existing log, modal should appear
4. Select options and submit
5. LogViewer should show with processing status
6. Regenerate should work

**Step 4: Commit final state**

```bash
git add .
git commit -m "feat: complete QA layout toggle feature - default to sidebar mode"
```

---

## Summary

| Task | Description | Files Changed |
|------|-------------|---------------|
| 1 | Create hooks directory | `src/components/SpecGpt/hooks/` |
| 2 | Create useInspectionQA hook | `hooks/useInspectionQA.js` |
| 3 | Add layout constant to ProjectLogs | `ProjectLogs.jsx` |
| 4 | Conditional tab render | `ProjectLogsHeaderTop.jsx` |
| 5 | Add QA buttons to ChatSidebar | `ChatSidebar/index.js`, CSS |
| 6 | Integrate hook into Chat | `Chat/index.js`, CSS |
| 7 | Refactor InspectionQA | `InspectionQA/index.js` |
| 8 | Manual testing | N/A |

**Default behavior:** `USE_TABBED_QA_LAYOUT = false` means QA features appear in the Compass sidebar by default.
