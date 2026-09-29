import { HousesProvider } from "@/components/providers/HousesProvider";
import { HousesStorageAlert } from "@/components/houses/HousesStorageAlert";

export const metadata = {
    title: "Mis casas",
    description:
        "Seguimiento de propiedades: links de las publicaciones, precio publicado y oferta con honorarios, superficie y valor por m², y notas. Todo queda guardado en tu navegador.",
};

export default function HousesLayout({ children }) {
    return (
        <HousesProvider>
            <div className="mx-auto min-w-0 max-w-[1200px] space-y-6">
                <HousesStorageAlert />
                {children}
            </div>
        </HousesProvider>
    );
}
