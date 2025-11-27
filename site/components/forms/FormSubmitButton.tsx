"use client"

import { useFormStatus } from "react-dom";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

export default function SubmitButton({ children }) {
    const { pending } = useFormStatus()

    return (
        <Button
            className="w-full mt-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white border-0"
            type="submit"
            aria-disabled={pending}
            disabled={pending}
        >
            {pending ? <Loader2 className="animate-spin" /> : children}
        </Button>
    )
}