import { useState } from 'react'
import { Moon, Sun, SettingsIcon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface SettingsProps {
  isMobile: boolean
}

export function Settings({ isMobile }: SettingsProps) {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isAzureBackend, setIsAzureBackend] = useState(true)

  const SettingsContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="dark-mode">Dark Mode</Label>
          <p className="text-sm text-muted-foreground">
            Toggle between light and dark theme
          </p>
        </div>
        <Switch
          id="dark-mode"
          checked={isDarkMode}
          onCheckedChange={setIsDarkMode}
          aria-label="Toggle dark mode"
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="azure-backend">Azure Backend</Label>
          <p className="text-sm text-muted-foreground">
            Toggle between Azure OpenAI and standard backend
          </p>
        </div>
        <Switch
          id="azure-backend"
          checked={isAzureBackend}
          onCheckedChange={setIsAzureBackend}
          aria-label="Toggle Azure backend"
        />
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <SettingsIcon className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">Open settings</span>
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Settings</SheetTitle>
            <SheetDescription>
              Adjust your app preferences here.
            </SheetDescription>
          </SheetHeader>
          <SettingsContent />
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <SettingsIcon className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Open settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Adjust your app preferences here.
          </DialogDescription>
        </DialogHeader>
        <SettingsContent />
      </DialogContent>
    </Dialog>
  )
}

