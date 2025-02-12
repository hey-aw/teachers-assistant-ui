import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { DialogContainer } from "../ui/DialogContainer";

interface OAuthDialogProps {
    authUrl: string;
    onCancel: () => void;
    onAuthorized: () => void;
}

export const OAuthDialog = ({ authUrl, onCancel, onAuthorized }: OAuthDialogProps) => {
    const [isWindowOpen, setIsWindowOpen] = useState(false);
    const [authWindow, setAuthWindow] = useState<Window | null>(null);

    useEffect(() => {
        // Listen for messages from the OAuth popup
        const handleMessage = (event: MessageEvent) => {
            // Verify origin matches your auth callback URL
            if (event.data === 'oauth-complete') {
                if (authWindow) {
                    authWindow.close();
                }
                setIsWindowOpen(false);
                onAuthorized();
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [authWindow, onAuthorized]);

    const handleOpenAuth = () => {
        const width = 600;
        const height = 800;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        const popup = window.open(
            authUrl,
            'OAuth Authorization',
            `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,location=no,status=no`
        );

        setAuthWindow(popup);
        setIsWindowOpen(true);

        // Monitor popup window
        const checkWindow = setInterval(() => {
            if (popup?.closed) {
                clearInterval(checkWindow);
                setIsWindowOpen(false);
                setAuthWindow(null);
            }
        }, 500);
    };

    return (
        <DialogContainer>
            <div className="text-lg font-medium">Authorization Required</div>
            <div className="text-sm text-gray-600 mb-2">
                To continue, you need to authorize access with Google.
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
                        {isWindowOpen ? "Authorizing..." : "Authorize with Google"}
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