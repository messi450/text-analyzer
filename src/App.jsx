import './App.css'
import Pages from "@/pages/index.jsx"
import { Toaster } from "@/components/ui/sonner"
import { Toaster as ShadcnToaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/ThemeProvider"

function App() {
    return (
        <ThemeProvider defaultTheme="light" storageKey="textalyzer-theme">
            <Pages />
            <Toaster 
                position="top-right"
                toastOptions={{
                    className: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg',
                    duration: 3000,
                }}
            />
            <ShadcnToaster />
        </ThemeProvider>
    )
}

export default App
