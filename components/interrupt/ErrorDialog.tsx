import { Button } from "../ui/button";
import { DialogContainer } from "../ui/DialogContainer";

interface ErrorDialogProps {
  message: string;
  onClose: () => void;
}

export const ErrorDialog = ({ message, onClose }: ErrorDialogProps) => (
  <DialogContainer>
    <div className="text-lg font-medium text-red-600">Error</div>
    <div className="text-sm text-gray-700 mb-4">
      {message}
    </div>
    <div className="flex items-center gap-2">
      <Button onClick={onClose} variant="default">
        Close
      </Button>
    </div>
  </DialogContainer>
); 