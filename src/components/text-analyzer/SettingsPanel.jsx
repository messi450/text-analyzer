import React from 'react';
import { Settings, Sun, Moon, Monitor, Type, Sparkles, Eye, PenTool } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/components/ThemeProvider";

const WRITING_STYLES = [
    { value: 'academic', label: 'Academic', emoji: '🎓', description: 'Formal, scholarly tone' },
    { value: 'business', label: 'Business', emoji: '💼', description: 'Professional, corporate' },
    { value: 'casual', label: 'Casual', emoji: '💬', description: 'Friendly, conversational' },
    { value: 'creative', label: 'Creative', emoji: '✨', description: 'Expressive, artistic' },
    { value: 'technical', label: 'Technical', emoji: '⚙️', description: 'Precise, detailed' }
];

export default function SettingsPanel({ preferences, onUpdate, writingStyle, onStyleChange }) {
    const { theme, setTheme } = useTheme();
    
    const themeIcons = {
        light: <Sun className="w-4 h-4" />,
        dark: <Moon className="w-4 h-4" />,
        system: <Monitor className="w-4 h-4" />
    };

    const currentStyle = WRITING_STYLES.find(s => s.value === writingStyle) || WRITING_STYLES[2];

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
        onUpdate({ ...preferences, theme: newTheme });
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-950"
                    title="Settings"
                >
                    <Settings className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-indigo-500" />
                        Settings
                    </DialogTitle>
                    <DialogDescription>
                        Customize your text analyzer experience
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Writing Style - Now in Settings */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium flex items-center gap-2">
                            <PenTool className="w-4 h-4 text-indigo-500" />
                            Writing Style
                        </Label>
                        <p className="text-xs text-slate-500 -mt-1">
                            Choose the style for AI suggestions
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            {WRITING_STYLES.map((style) => (
                                <button
                                    key={style.value}
                                    onClick={() => onStyleChange?.(style.value)}
                                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                                        writingStyle === style.value
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50'
                                            : 'border-slate-200 hover:border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600'
                                    }`}
                                >
                                    <span className="text-lg">{style.emoji}</span>
                                    <p className={`text-sm font-medium ${
                                        writingStyle === style.value ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'
                                    }`}>
                                        {style.label}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{style.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    {/* Theme Selection */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium flex items-center gap-2">
                            {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-500" /> : <Sun className="w-4 h-4 text-indigo-500" />}
                            Appearance
                        </Label>
                        <div className="flex gap-2">
                            {['light', 'dark', 'system'].map((themeOption) => (
                                <Button
                                    key={themeOption}
                                    variant={theme === themeOption ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handleThemeChange(themeOption)}
                                    className={`flex-1 rounded-xl capitalize ${
                                        theme === themeOption 
                                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                                            : ''
                                    }`}
                                >
                                    {themeIcons[themeOption]}
                                    <span className="ml-2">{themeOption}</span>
                                </Button>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    {/* Font Size */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium flex items-center gap-2">
                            <Type className="w-4 h-4 text-indigo-500" />
                            Font Size
                        </Label>
                        <Select 
                            value={preferences.font_size || 'medium'} 
                            onValueChange={(value) => onUpdate({ ...preferences, font_size: value })}
                        >
                            <SelectTrigger className="rounded-xl">
                                <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="small">Small</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="large">Large</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Separator />

                    {/* Toggle Options */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-slate-500" />
                                <Label className="text-sm">Real-time Analysis</Label>
                            </div>
                            <Switch
                                checked={preferences.auto_analyze !== false}
                                onCheckedChange={(checked) => onUpdate({ ...preferences, auto_analyze: checked })}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Eye className="w-4 h-4 text-slate-500" />
                                <Label className="text-sm">Show Writing Suggestions</Label>
                            </div>
                            <Switch
                                checked={preferences.show_suggestions !== false}
                                onCheckedChange={(checked) => onUpdate({ ...preferences, show_suggestions: checked })}
                            />
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
