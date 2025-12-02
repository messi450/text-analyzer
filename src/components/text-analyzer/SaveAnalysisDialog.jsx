import React, { useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function SaveAnalysisDialog({ onSave, disabled, isSaving }) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('');

    const handleSave = async () => {
        const analysisTitle = title.trim() || `Analysis ${new Date().toLocaleDateString()}`;
        await onSave(analysisTitle);
        setTitle('');
        setOpen(false);
        toast.success('Analysis saved!');
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button 
                    disabled={disabled}
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-700"
                >
                    <Save className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Save Analysis</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Save className="w-5 h-5 text-indigo-500" />
                        Save Analysis
                    </DialogTitle>
                    <DialogDescription>
                        Give your analysis a name to find it easily later
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Analysis Title</Label>
                        <Input
                            id="title"
                            placeholder="E.g., Blog Post Draft, Essay Analysis..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="rounded-xl"
                            autoFocus
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl">
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="rounded-xl bg-indigo-600 hover:bg-indigo-700"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}