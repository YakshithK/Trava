
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Globe, Check } from "lucide-react"

const languages = [
    {code: "en", name: "English", flag: "🇺🇸"},
    {code: "es", name: "Español", flag: "🇪🇸"},
    {code: "fr", name: "Français", flag: "🇫🇷"}
]

export function LanguageSwitcher() {
    const { i18n } = useTranslation()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button 
                    variant="ghost" 
                    size="icon"
                    className="fixed top-4 right-16 z-50 hover:bg-accent/50 transition-colors border border-border/20 bg-background/80 backdrop-blur-sm shadow-sm"
                >
                    <Globe className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-md border border-border/50 shadow-lg min-w-[160px]">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => i18n.changeLanguage(lang.code)}
                        className={`cursor-pointer flex items-center justify-between px-3 py-2 ${
                            i18n.language === lang.code ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-sm">{lang.flag}</span>
                            <span className="text-sm font-medium">{lang.name}</span>
                        </div>
                        {i18n.language === lang.code && (
                            <Check className="h-4 w-4 text-primary" />
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
