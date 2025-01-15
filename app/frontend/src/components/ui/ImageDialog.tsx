import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

const ImageDialog = ({ imageUrl, onClose }: { imageUrl: string; onClose: () => void }) => (
    <DialogPrimitive.Root>
        <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <DialogPrimitive.Content className={cn("w-full max-w-lg rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800")}>
                    <img src={imageUrl} alt="Drink" className="h-auto w-full" />
                    <DialogPrimitive.Close
                        onClick={onClose}
                        className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-500"
                    >
                        <span className="sr-only">Close</span>
                        &times;
                    </DialogPrimitive.Close>
                </DialogPrimitive.Content>
            </div>
        </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
);

export default ImageDialog;
