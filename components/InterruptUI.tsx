import {
  useLangGraphInterruptState,
  useLangGraphSendCommand,
} from "@assistant-ui/react-langgraph";
import { Button } from "./ui/button";
import { useState } from "react";

interface DialogContainerProps {
  children: React.ReactNode;
}

const DialogContainer = ({ children }: DialogContainerProps) => (
  <div className="flex flex-col gap-2 p-4 border rounded-lg bg-gray-50">
    {children}
  </div>
);

interface InterruptDialogProps {
  message: string;
  onResponse: (response: "yes" | "no") => void;
}

const InterruptDialog = ({ message, onResponse }: InterruptDialogProps) => (
  <DialogContainer>
    <div className="text-lg font-medium">Interrupt: {message}</div>
    <div className="flex items-end gap-2">
      <Button onClick={() => onResponse("yes")} variant="default">
        Yes
      </Button>
      <Button onClick={() => onResponse("no")} variant="outline">
        No
      </Button>
    </div>
  </DialogContainer>
);

interface OAuthDialogProps {
  authUrl: string;
  onCancel: () => void;
}

const OAuthDialog = ({ authUrl, onCancel }: OAuthDialogProps) => {
  const [isWindowOpen, setIsWindowOpen] = useState(false);

  const handleOpenAuth = () => {
    // Open in a popup window with specific dimensions and features
    const width = 600;
    const height = 800;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      authUrl,
      'OAuth Authorization',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,location=no,status=no`
    );

    setIsWindowOpen(true);

    // Monitor popup window
    const checkWindow = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkWindow);
        setIsWindowOpen(false);
      }
    }, 500);
  };

  return (
    <DialogContainer>
      <div className="text-lg font-medium">Authorization Required</div>
      <div className="text-sm text-gray-600 mb-2">
        To continue, you need to authorize access with the service provider.
      </div>
      <div className="flex flex-col gap-4">
        <div className="text-sm text-gray-700">
          {isWindowOpen ? (
            <span className="text-blue-600">
              ↗️ Please complete the authorization in the popup window
            </span>
          ) : (
            "Click the button below to start the authorization process"
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleOpenAuth}
            variant="default"
            disabled={isWindowOpen}
            className="flex items-center gap-2"
          >
            {isWindowOpen ? "Authorizing..." : "Authorize Access"}
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex items-center gap-2"
          >
            Cancel
          </Button>
        </div>
        {isWindowOpen && (
          <div className="text-xs text-gray-500">
            If you don't see the popup window, please check if it was blocked by your browser
          </div>
        )}
      </div>
    </DialogContainer>
  );
};

interface ErrorDialogProps {
  message: string;
  onClose: () => void;
}

const ErrorDialog = ({ message, onClose }: ErrorDialogProps) => (
  <DialogContainer>
    <div className="text-lg font-medium text-red-600">Error</div>
    <div className="text-sm text-gray-700 mb-4">
      {message}
    </div>
    <div className="flex items-center gap-2">
      <Button
        onClick={onClose}
        variant="default"
      >
        Close
      </Button>
    </div>
  </DialogContainer>
);

export const InterruptUI: React.FC = () => {
  const interrupt = useLangGraphInterruptState();
  const sendCommand = useLangGraphSendCommand();

  if (!interrupt) return null;

  // Handle different types of interrupts
  const isOAuthInterrupt = interrupt.value.includes('Please use the following link to authorize');
  const isUserIdRequired = interrupt.value.includes('user_id is required');
  const isNonResumable = interrupt.resumable === false;

  // Handle non-resumable user_id requirement
  if (isUserIdRequired && isNonResumable) {
    return (
      <ErrorDialog
        message="This action requires authentication. Please sign in to access your Google account."
        onClose={() => sendCommand({ resume: 'no' })}
      />
    );
  }

  // Handle OAuth flow
  if (isOAuthInterrupt) {
    const urlMatch = interrupt.value.match(/https:\/\/accounts\.google\.com[^\s']*/);
    const authUrl = urlMatch ? urlMatch[0] : '';

    return (
      <OAuthDialog
        authUrl={authUrl}
        onCancel={() => sendCommand({ resume: 'no' })}
      />
    );
  }

  // Handle standard interrupts
  return (
    <InterruptDialog
      message={interrupt.value}
      onResponse={(response) => sendCommand({ resume: response })}
    />
  );
};
