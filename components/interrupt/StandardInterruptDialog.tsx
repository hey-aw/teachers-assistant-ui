import { Button } from "../ui/button";
import { DialogContainer } from "../ui/DialogContainer";

interface StandardInterruptDialogProps {
    message: string;
    onResponse: (response: "yes" | "no") => void;
}

export const StandardInterruptDialog = ({ message, onResponse }: StandardInterruptDialogProps) => (
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