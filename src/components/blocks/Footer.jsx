import React from "react";

function Footer() {
    return (
        <footer className="mt-auto border-t border-border/60 bg-card/40 py-6">
            <div className="mx-auto max-w-[1200px] px-4 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
                <p>
                    Creado por Agustin Wet &copy;{" "}
                    <span suppressHydrationWarning>
                        {new Date().getFullYear()}
                    </span>
                </p>
            </div>
        </footer>
    );
}

export default Footer;
