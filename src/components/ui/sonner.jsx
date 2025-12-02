"use client";
import { Toaster as Sonner } from "sonner"

const Toaster = ({
  ...props
}) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="top-right"
      expand={false}
      richColors
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-800 group-[.toaster]:border-slate-200 group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl",
          description: "group-[.toast]:text-slate-500",
          actionButton:
            "group-[.toast]:bg-indigo-600 group-[.toast]:text-white group-[.toast]:rounded-lg",
          cancelButton:
            "group-[.toast]:bg-slate-100 group-[.toast]:text-slate-600 group-[.toast]:rounded-lg",
          success: "group-[.toaster]:border-emerald-200 group-[.toaster]:bg-emerald-50",
          error: "group-[.toaster]:border-red-200 group-[.toaster]:bg-red-50",
          warning: "group-[.toaster]:border-amber-200 group-[.toaster]:bg-amber-50",
          info: "group-[.toaster]:border-blue-200 group-[.toaster]:bg-blue-50",
        },
      }}
      {...props}
    />
  );
}

export { Toaster }
