import {
    useLangGraphInterruptState,
    useLangGraphSendCommand,
} from "@assistant-ui/react-langgraph";
import { useUser } from "@auth0/nextjs-auth0/client";
import { StandardInterruptDialog } from "./StandardInterruptDialog";
import { OAuthDialog } from "./OAuthDialog";
import { ErrorDialog } from "./ErrorDialog";
import type { InterruptCommand, InterruptResponse } from "./types";

export const InterruptUI: React.FC = () => {
    const interrupt = useLangGraphInterruptState();
    const sendCommand = useLangGraphSendCommand();
    const { user } = useUser();

    if (!interrupt) return null;

    const handleResponse = (response: InterruptResponse) => {
        sendCommand({ resume: response });
    };

    // Check interrupt types
    const isOAuthInterrupt = interrupt.value.includes('Please use the following link to authorize');
    const isUserIdRequired = interrupt.value.includes('user_id is required');
    const isNonResumable = interrupt.resumable === false;

    // Handle user_id requirement
    if (isUserIdRequired) {
        // If we have a verified user email, use it as the user_id
        if (user?.email && user.email_verified) {
            return (
                <StandardInterruptDialog
                    message="Would you like to proceed with your verified email?"
                    onResponse={handleResponse}
                />
            );
        }

        // Otherwise show authentication error
        return (
            <ErrorDialog
                message="This action requires a verified email address. Please sign in with a verified email account."
                onClose={() => handleResponse("no")}
            />
        );
    }

    // Handle OAuth flow
    if (isOAuthInterrupt) {
        // Extract the authorization URL
        const urlMatch = interrupt.value.match(/https:\/\/accounts\.google\.com[^\s']*/);
        const authUrl = urlMatch ? urlMatch[0] : '';

        if (!authUrl) {
            return (
                <ErrorDialog
                    message="Could not find authorization URL. Please try again."
                    onClose={() => handleResponse("no")}
                />
            );
        }

        return (
            <OAuthDialog
                authUrl={authUrl}
                onCancel={() => handleResponse("no")}
                onAuthorized={() => handleResponse("yes")}
            />
        );
    }

    // Handle standard interrupts
    return (
        <StandardInterruptDialog
            message={interrupt.value}
            onResponse={handleResponse}
        />
    );
}; 