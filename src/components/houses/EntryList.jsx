"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { InlineConfirmDelete } from "@/components/houses/InlineConfirmDelete";
import { formatDateTime } from "@/lib/utils";

/** En desktop Enter agrega y Shift+Enter hace salto de línea; en touch Enter es salto de línea. */
function enterSubmits(event) {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) {
        return false;
    }
    return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function EntryEditor({ id, initialText, onSave, onCancel }) {
    const [text, setText] = useState(initialText);

    const save = () => {
        if (text.trim()) {
            onSave(text);
        }
    };

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                save();
            }}
            className="space-y-2"
        >
            <label htmlFor={id} className="sr-only">
                Editar texto
            </label>
            <Textarea
                id={id}
                value={text}
                autoFocus
                rows={2}
                className="max-h-64"
                onChange={(event) => setText(event.target.value)}
                onKeyDown={(event) => {
                    if (event.key === "Escape") {
                        onCancel();
                    } else if (enterSubmits(event)) {
                        event.preventDefault();
                        save();
                    }
                }}
            />
            <div className="flex justify-end gap-2">
                <Button variant="ghost" className="h-8 px-3 text-xs" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    variant="secondary"
                    className="h-8 px-3 text-xs"
                    disabled={!text.trim()}
                >
                    Guardar
                </Button>
            </div>
        </form>
    );
}

function EntryRow({ entry, onUpdate, onRemove }) {
    const [editing, setEditing] = useState(false);
    const edited = entry.updatedAt !== entry.createdAt;

    return (
        <li className="group rounded-lg bg-white/[0.02] px-3 py-2.5 ring-1 ring-white/[0.05]">
            {editing ? (
                <EntryEditor
                    id={`entry-edit-${entry.id}`}
                    initialText={entry.text}
                    onCancel={() => setEditing(false)}
                    onSave={(text) => {
                        onUpdate(entry.id, text);
                        setEditing(false);
                    }}
                />
            ) : (
                <div className="flex items-start gap-2.5">
                    <div className="min-w-0 flex-1">
                        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground">
                            {entry.text}
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                            {formatDateTime(entry.createdAt)}
                            {edited ? " · editado" : ""}
                        </p>
                    </div>
                    <div className="-my-1 -mr-1.5 flex shrink-0 items-center transition-opacity [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within:opacity-100 [@media(hover:hover)]:group-hover:opacity-100">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            aria-label="Editar"
                            title="Editar"
                            onClick={() => setEditing(true)}
                        >
                            <Pencil aria-hidden="true" />
                        </Button>
                        <InlineConfirmDelete label="Borrar" onConfirm={() => onRemove(entry.id)} />
                    </div>
                </div>
            )}
        </li>
    );
}

function EntryComposer({ id, label, placeholder, onAdd }) {
    const [text, setText] = useState("");

    const submit = () => {
        if (!text.trim()) {
            return;
        }
        onAdd(text);
        setText("");
    };

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                submit();
            }}
            className="space-y-1.5"
        >
            <label htmlFor={id} className="sr-only">
                {label}
            </label>
            <div className="flex items-end gap-2">
                <Textarea
                    id={id}
                    rows={1}
                    value={text}
                    placeholder={placeholder}
                    maxLength={5000}
                    className="max-h-48 flex-1"
                    onChange={(event) => setText(event.target.value)}
                    onKeyDown={(event) => {
                        if (enterSubmits(event)) {
                            event.preventDefault();
                            submit();
                        }
                    }}
                />
                <Button
                    type="submit"
                    variant="outline"
                    className="shrink-0 px-3"
                    disabled={!text.trim()}
                >
                    <Plus aria-hidden="true" />
                    <span className="sr-only sm:not-sr-only">Agregar</span>
                </Button>
            </div>
            <p className="hidden text-[11px] text-muted-foreground/80 [@media(hover:hover)_and_(pointer:fine)]:block">
                Enter para agregar · Shift+Enter para salto de línea
            </p>
        </form>
    );
}

export function EntryList({
    id,
    entries,
    label,
    placeholder,
    emptyText,
    onAdd,
    onUpdate,
    onRemove,
}) {
    return (
        <div className="space-y-3">
            {entries.length > 0 ? (
                <ul className="space-y-2" aria-label={label}>
                    {entries.map((entry) => (
                        <EntryRow
                            key={entry.id}
                            entry={entry}
                            onUpdate={onUpdate}
                            onRemove={onRemove}
                        />
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-muted-foreground">{emptyText}</p>
            )}
            <EntryComposer
                id={`${id}-composer`}
                label={`Agregar a ${label.toLowerCase()}`}
                placeholder={placeholder}
                onAdd={onAdd}
            />
        </div>
    );
}
